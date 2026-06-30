import { db } from "@/lib/db";
import { refurbishedProducts, categories } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/helpers/auth-helpers";
import { slugify, isRefurbishedSlugTaken } from "@/lib/helpers/refurbished-slug";
import { eq, ilike } from "drizzle-orm";
import * as XLSX from "xlsx";

// ──────────────────────────────────────────────────────────
// ENUM DEFINITIONS (match db/schema/refurbishedProducts.js)
// ──────────────────────────────────────────────────────────
const PRODUCT_TYPES = ["Complete System", "LED Display Single Cabinet"];
const DESIGNS = ["Fix", "Mobil"];
const SPECIAL_TYPES = ["Standard", "Transparent", "Curved", "Floor", "LED pendant"];
const LED_TECHS = ["SMD", "SMD+GOB", "IMD", "COB", "DIP", "LOB", "MIP"]; // Other → ledTechnologyOther
const CHIP_BONDINGS = ["Gold Wire", "Copper Wire", "Flip-Chip"];
const CONTROL_SYSTEMS = ["Colorlight", "Novastar", "Brompton", "LINSN"]; // Other → controlSystemOther
const SERVICES = ["Frontside and Backside", "Frontside", "Backside"];
const LEVELS = ["Okay", "Good", "Excellent"];

// ──────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ──────────────────────────────────────────────────────────
function str(value) {
    if (value === null || value === undefined) return null;
    const s = value.toString().trim();
    return s || null;
}

function parseNumber(value) {
    if (value === null || value === undefined || value === "") return null;
    const s = value.toString().trim().replace(/,/g, "");
    const match = s.match(/-?[\d.]+/);
    if (!match) return null;
    const num = parseFloat(match[0]);
    return isNaN(num) ? null : num;
}

function parseInteger(value) {
    const num = parseNumber(value);
    if (num === null) return null;
    if (num > 2147483647 || num < -2147483648) return null;
    return Math.round(num);
}

function parseDecimal(value) {
    const num = parseNumber(value);
    if (num === null) return null;
    return num.toString();
}

function matchEnum(value, options) {
    if (!value || !value.toString().trim()) return null;
    const v = value.toString().trim();
    const exact = options.find((o) => o === v);
    if (exact) return exact;
    const lower = v.toLowerCase();
    const ci = options.find((o) => o.toLowerCase() === lower);
    if (ci) return ci;
    const partial = options.find(
        (o) => lower.includes(o.toLowerCase()) || o.toLowerCase().includes(lower)
    );
    return partial || null;
}

// Enum matching that falls back to "Other" + companion text column
function matchEnumWithOther(rawValue, options) {
    if (!rawValue || !rawValue.toString().trim()) return { value: null, other: null };
    const raw = rawValue.toString().trim();
    if (raw.toLowerCase() === "other") return { value: "Other", other: null };
    const matched = matchEnum(raw, options);
    if (matched) return { value: matched, other: null };
    return { value: "Other", other: raw };
}

function matchService(value) {
    if (!value) return null;
    const v = value.toString().trim().toLowerCase();
    const hasFront = v.includes("front");
    const hasBack = v.includes("back");
    if (hasFront && hasBack) return "Frontside and Backside";
    if (hasFront) return "Frontside";
    if (hasBack) return "Backside";
    return matchEnum(value, SERVICES);
}

// Yes/No that also accepts a count format like "20 / NA" (a positive number → Yes)
function matchYesNoLoose(value) {
    if (value === null || value === undefined || value === "") return null;
    const v = value.toString().trim().toLowerCase();
    if (["yes", "y", "ja", "true", "1"].includes(v)) return "Yes";
    if (["no", "n", "nein", "false", "0", "na", "n/a", "-"].includes(v)) return "No";
    const num = parseNumber(value);
    if (num !== null) return num > 0 ? "Yes" : "No";
    if (v.includes("yes") || v.includes("ja")) return "Yes";
    if (v.includes("no")) return "No";
    return null;
}

// "1280 x 960" → { width, height } (decimals)
function parseDimensions(value) {
    if (!value) return { width: null, height: null };
    const parts = value.toString().split(/[x×*]/i);
    if (parts.length >= 2) {
        return { width: parseDecimal(parts[0]), height: parseDecimal(parts[1]) };
    }
    return { width: parseDecimal(value), height: null };
}

// "192 x 144" → { h, v } (integers)
function parseResolution(value) {
    if (!value) return { h: null, v: null };
    const parts = value.toString().split(/[x×*]/i);
    if (parts.length >= 2) {
        return { h: parseInteger(parts[0]), v: parseInteger(parts[1]) };
    }
    return { h: parseInteger(value), v: null };
}

async function generateUniqueRefurbishedSlug(serie) {
    const base = slugify(serie) || "refurbished-product";
    let slug = base;
    let n = 2;
    // Guard against runaway loops
    while ((await isRefurbishedSlugTaken(slug)) && n < 1000) {
        slug = `${base}-${n}`;
        n++;
    }
    return slug;
}

// ──────────────────────────────────────────────────────────
// MAIN IMPORT HANDLER
// Layout (transposed): col A = EN label, col B = DE label, col C = unit,
// col D = Example, then one column per refurbished product.
// ──────────────────────────────────────────────────────────
export async function POST(req) {
    try {
        // Admin only
        const { user, error } = await getCurrentUser();
        if (error || !user) return errorResponse("Unauthorized", 401);
        if (user.role !== "admin" && user.role !== "super_admin") {
            return errorResponse("Forbidden: Admin access required", 403);
        }

        const formData = await req.formData();
        const file = formData.get("file");

        if (!file || !(file instanceof File)) return errorResponse("No file provided", 400);

        const name = (file.name || "").toLowerCase();
        if (!name.endsWith(".csv") && !name.endsWith(".xlsx") && !name.endsWith(".xls") && !name.endsWith(".xlsm")) {
            return errorResponse("Invalid file type. Upload .csv, .xlsx, .xls, or .xlsm", 400);
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        if (!sheet) return errorResponse("The uploaded file contains no sheets", 400);

        const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
        if (data.length < 2) return errorResponse("File has no data rows", 400);

        // Field → label aliases. Order matters: more specific / earlier-listed fields win
        // when a row label could match several (e.g. "stock location" before "stock").
        const headerMappings = {
            serie: ["serie", "series"],
            productNumber: ["product number", "artikelnummer", "product_number", "article number"],
            productDescription: ["product description", "produktbeschreibung", "description"],
            oemBrand: ["oem", "brand", "marke"],
            productType: ["product type", "procuct type", "produkttyp", "artikeltyp"],
            areaOfUse: ["area of use", "einsatzumgebung"],
            design: ["design", "bauform"],
            specialTypes: ["special types", "spezialtypen", "special type"],
            yearOfConstruction: ["year of construction", "baujahr"],
            operatingHours: ["operating hours", "betriebsstunden"],
            pixelPitch: ["pixel pitch", "pixelabstand"],
            cabinetDimensions: ["cabinet width", "cabinet breite", "width x height", "breite x"],
            cabinetResolution: ["cabinet resolution", "auflösung cabinet", "auflosung cabinet", "resolution h"],
            weight: ["weight without packaging", "weight", "gewicht"],
            ledTechnology: ["led technology", "diodentechnologie"],
            ledChipManufacturer: ["manufacturer", "hersteller", "led/chip", "chip manufacturer"],
            chipBonding: ["chip-bonding", "chip bonding", "bonding"],
            brightnessValue: ["brightness", "helligkeit"],
            ledDriver: ["led driver", "led treiber", "driver", "treiber"],
            inputVoltage: ["input voltage", "eingangsspannung", "voltage", "spannung"],
            powerConsumptionMax: ["power consumption (max", "power consumption max", "leistungsaufnahme (max", "consumption (max"],
            powerConsumptionTypical: ["power consumption (typ", "power consumption typical", "leistungsaufnahme (typ", "consumption (typ"],
            refreshRate: ["refresh rate", "bildwiederholrate", "refresh"],
            scanRate: ["scan rate", "zeilenrate"],
            controlSystem: ["control system", "steuerungssytem", "steuerungssystem"],
            controller: ["controller"],
            ipRating: ["ip rating", "ip-klassifizierung", "ip-klass", "ip class"],
            service: ["service"],
            hangingBrackets: ["hanging-brackets", "hanging brackets", "hanging"],
            stackingSystem: ["stacking system", "stacking", "ständerwerk", "standerwerk"],
            flightCases: ["flightcases", "flight cases", "flight case"],
            accessories: ["accessories", "zubehör", "zubehor", "accessory"],
            pricePerCabinet: ["price per cabinet", "preis pro cabinet", "preis pro cabinett"],
            pricePerMetreSquare: ["price per m²", "price per m2", "price per metre", "price per meter", "preis pro m"],
            sellingPrice: ["selling price", "verkaufspreis", "selling"],
            stockLocation: ["stock location", "lagerort"],
            stockPieces: ["stock", "lagerbestand"],
            leadtime: ["leadtime", "lead time", "vorlaufzeit", "lieferzeit"],
            notes: ["notes", "notizen"],
            levelOfQuality: ["level of quality", "qualitätsniveau", "qualitatsniveau", "quality"],
        };

        // Scan the label columns (A + B) to map each field to its row index
        const fieldRowMap = {};
        for (let r = 1; r < data.length; r++) {
            const label = [str(data[r]?.[0]), str(data[r]?.[1])].filter(Boolean).join(" ").toLowerCase();
            if (!label) continue;
            for (const [field, aliases] of Object.entries(headerMappings)) {
                if (fieldRowMap[field] !== undefined) continue;
                if (aliases.some((a) => label.includes(a))) {
                    fieldRowMap[field] = r;
                    break;
                }
            }
        }

        const serieRowIdx = fieldRowMap.serie;
        if (serieRowIdx === undefined) {
            return errorResponse("Could not find the 'Serie' field (column A) in the file.", 400);
        }

        // Determine product columns: start after the 3 label columns (A, B, C),
        // skip the template's "Example" column, and include any column with a Serie value.
        const LABEL_COLS = 3;
        const headerRow0 = data[0] || [];
        const serieRow = data[serieRowIdx] || [];
        const maxCol = Math.max(serieRow.length, headerRow0.length, 60);
        const productCols = [];
        for (let col = LABEL_COLS; col < maxCol; col++) {
            const h = str(headerRow0[col]);
            if (h && h.toLowerCase() === "example") continue;
            if (serieRow[col] && serieRow[col].toString().trim()) productCols.push(col);
        }

        if (productCols.length === 0) {
            return errorResponse(
                "No refurbished product data found. Product columns should start at column D/E with a 'Serie' value.",
                400
            );
        }

        function cell(field, col) {
            const rowIdx = fieldRowMap[field];
            if (rowIdx === undefined) return null;
            const row = data[rowIdx];
            if (!row) return null;
            const val = row[col];
            return val === undefined || val === null || val === "" ? null : val;
        }

        // Pre-fetch categories
        const allCategories = await db.select().from(categories);
        const categoryMap = {};
        for (const cat of allCategories) categoryMap[cat.name.toLowerCase()] = cat.id;

        const results = { created: 0, skipped: 0, errors: [], total: productCols.length };

        for (const col of productCols) {
            try {
                const serie = str(cell("serie", col));
                const productNumber = str(cell("productNumber", col));

                if (!serie || !productNumber) {
                    results.errors.push(`Column ${col + 1}: Missing Serie or Product Number, skipped.`);
                    continue;
                }

                // Skip if product number already exists
                const existing = await db
                    .select({ id: refurbishedProducts.id })
                    .from(refurbishedProducts)
                    .where(eq(refurbishedProducts.productNumber, productNumber))
                    .limit(1)
                    .then((r) => r[0]);

                if (existing) {
                    results.skipped++;
                    continue;
                }

                // Parsed / matched fields
                const ledTechResult = matchEnumWithOther(cell("ledTechnology", col), LED_TECHS);
                const controlSysResult = matchEnumWithOther(cell("controlSystem", col), CONTROL_SYSTEMS);
                const dims = parseDimensions(cell("cabinetDimensions", col));
                const res = parseResolution(cell("cabinetResolution", col));

                // Area of Use → category (find or create)
                let areaOfUseId = null;
                const areaOfUseRaw = str(cell("areaOfUse", col));
                if (areaOfUseRaw) {
                    const key = areaOfUseRaw.toLowerCase();
                    if (categoryMap[key]) {
                        areaOfUseId = categoryMap[key];
                    } else {
                        const [newCat] = await db
                            .insert(categories)
                            .values({ name: areaOfUseRaw })
                            .onConflictDoNothing()
                            .returning();
                        if (newCat) {
                            categoryMap[newCat.name.toLowerCase()] = newCat.id;
                            areaOfUseId = newCat.id;
                        } else {
                            const found = await db
                                .select()
                                .from(categories)
                                .where(ilike(categories.name, areaOfUseRaw))
                                .limit(1)
                                .then((r) => r[0]);
                            if (found) {
                                categoryMap[found.name.toLowerCase()] = found.id;
                                areaOfUseId = found.id;
                            }
                        }
                    }
                }

                const refurbishedData = {
                    serie,
                    productNumber,
                    productDescription: str(cell("productDescription", col)),
                    oemBrand: str(cell("oemBrand", col)),

                    productType: matchEnum(cell("productType", col), PRODUCT_TYPES),
                    areaOfUseId,
                    design: matchEnum(cell("design", col), DESIGNS),
                    specialTypes: matchEnum(cell("specialTypes", col), SPECIAL_TYPES),

                    yearOfConstruction: parseInteger(cell("yearOfConstruction", col)),
                    operatingHours: str(cell("operatingHours", col)),

                    pixelPitch: parseDecimal(cell("pixelPitch", col)),
                    cabinetWidth: dims.width,
                    cabinetHeight: dims.height,
                    cabinetResolutionHorizontal: res.h,
                    cabinetResolutionVertical: res.v,
                    weightWithoutPackaging: parseDecimal(cell("weight", col)),

                    ledTechnology: ledTechResult.value,
                    ledTechnologyOther: ledTechResult.other,
                    ledChipManufacturer: str(cell("ledChipManufacturer", col)),
                    chipBonding: matchEnum(cell("chipBonding", col), CHIP_BONDINGS),
                    brightnessValue: str(cell("brightnessValue", col)),
                    ledDriver: str(cell("ledDriver", col)),

                    inputVoltage: str(cell("inputVoltage", col)),
                    powerConsumptionMax: parseInteger(cell("powerConsumptionMax", col)),
                    powerConsumptionTypical: parseInteger(cell("powerConsumptionTypical", col)),
                    refreshRate: parseInteger(cell("refreshRate", col)),
                    scanRate: str(cell("scanRate", col)),

                    controlSystem: controlSysResult.value,
                    controlSystemOther: controlSysResult.other,
                    controller: str(cell("controller", col)),

                    ipRating: str(cell("ipRating", col)),
                    service: matchService(cell("service", col)),
                    hangingBrackets: matchYesNoLoose(cell("hangingBrackets", col)),
                    stackingSystem: matchYesNoLoose(cell("stackingSystem", col)),
                    flightCases: matchYesNoLoose(cell("flightCases", col)),
                    accessories: str(cell("accessories", col)),

                    pricePerCabinetUsd: parseDecimal(cell("pricePerCabinet", col)),
                    pricePerMetreSquareUsd: parseDecimal(cell("pricePerMetreSquare", col)),
                    sellingPrice: parseDecimal(cell("sellingPrice", col)),
                    stockLocation: str(cell("stockLocation", col)),
                    stockPieces: parseInteger(cell("stockPieces", col)),
                    leadtimeDays: parseInteger(cell("leadtime", col)),
                    notes: str(cell("notes", col)),
                    levelOfQuality: matchEnum(cell("levelOfQuality", col), LEVELS),

                    // Imported refurbished products are inactive until images are added
                    isActive: false,
                    updatedAt: new Date(),
                };

                refurbishedData.slug = await generateUniqueRefurbishedSlug(serie);
                await db.insert(refurbishedProducts).values(refurbishedData);
                results.created++;
            } catch (rowErr) {
                const label = str(cell("serie", col)) || `Column ${col + 1}`;
                results.errors.push(`Refurbished "${label}": ${rowErr.message}`);
            }
        }

        const parts = [];
        if (results.created > 0) parts.push(`${results.created} created`);
        if (results.skipped > 0) parts.push(`${results.skipped} skipped (already exist)`);
        const successPart = parts.length > 0 ? parts.join(", ") : "0 refurbished products processed";
        const message =
            `Import complete: ${successPart} out of ${results.total} refurbished products.` +
            (results.errors.length > 0 ? ` ${results.errors.length} had errors.` : "");

        return successResponse(message, results);
    } catch (error) {
        console.error("POST /api/admin/refurbished-products/import error:", error);
        return errorResponse("Failed to import refurbished products", 500);
    }
}

import { db } from "@/lib/db";
import { products, categories } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth-helpers";
import { eq, ilike } from "drizzle-orm";
import * as XLSX from "xlsx";

// ──────────────────────────────────────────────────────────
// Enum look-ups (case-insensitive matching)
// "Other" is intentionally NOT in these arrays so that
// unrecognised values fall through to the "Other" + companion
// field logic.
// ──────────────────────────────────────────────────────────
const PRODUCT_TYPES = ["AIO Systems", "LED Display Single Cabinet"];
const DESIGNS = ["Fix", "Mobil"];
const SPECIAL_TYPES = ["Transparent", "Curved", "Floor"]; // Other → specialTypesOther
const APPLICATIONS = [
    "DOOH", "Indoor Signage", "Home Theater", "Stadium Scoreboard",
    "Video Cube", "Conference", "Stadium Ribbons", "Corporate Design",
    "Staging", "Virtual Production",
];
const PIXEL_CONFIGS = ["1R1G1B", "2R1G1B"];
const PIXEL_TECHS = ["Real", "Virtual"];
const LED_TECHS = ["SMD", "SMD+GOB", "IMD", "COB", "DIP", "LOB"]; // Other → ledTechnologyOther
const CHIP_BONDINGS = ["Gold Wire", "Copper Wire", "Flip-Chip"];
const COLOUR_DEPTHS = ["8", "10", "12"];
const CURRENT_GAINS = ["4", "8"];
const VIDEO_RATES = ["50/60", "120", "240"];
const CALIBRATION_METHODS = [ // Other → calibrationMethodOther
    "No Calibration", "Multiple Layers Chroma", "Multiple Layers Brightness",
    "Brightness", "Chroma",
];
const DRIVING_METHODS = ["Common Anode", "Common Cathode"];
const CONTROL_SYSTEMS = ["Colorlight", "Novastar", "Brompton", "LINSN"]; // Other → controlSystemOther
const GREYSCALES = ["<16", "16", "18+", "22+"]; // Other → greyscaleProcessingOther
const COOLINGS = ["Convection", "Fan"];
const SUPPORTS = ["Frontendside", "Backside", "Frontside and Backside"];

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────
function matchEnum(value, options) {
    if (!value || !value.toString().trim()) 
        return null;
    const v = value.toString().trim();
    const exact = options.find((o) => o === v);
    if (exact) 
        return exact;
    const lower = v.toLowerCase();
    const ci = options.find((o) => o.toLowerCase() === lower);
    if (ci) 
        return ci;
    const partial = options.find(
        (o) => lower.includes(o.toLowerCase()) || o.toLowerCase().includes(lower)
    );
    if (partial) 
        return partial;
    return null;
}

/**
 * Match an enum that supports "Other".
 * Returns { value, other } where:
 *   - value is the matched enum string (or "Other")
 *   - other is the raw text when "Other", otherwise null
 */
function matchEnumWithOther(rawValue, options) {
    if (!rawValue || !rawValue.toString().trim()) 
        return { value: null, other: null };
    const raw = rawValue.toString().trim();
    // If someone literally typed "Other" / "other" treat it as Other with no companion
    if (raw.toLowerCase() === "other") 
        return { value: "Other", other: null };
    const matched = matchEnum(raw, options);
    if (matched) 
        return { value: matched, other: null };
    // Not in enum → store "Other" + raw text
    return { value: "Other", other: raw };
}

function matchYesNo(value) {
    if (!value) 
        return null;
    const v = value.toString().trim().toLowerCase();
    if (v === "yes" || v === "y" || v === "true" || v === "1") 
        return "Yes";
    if (v === "no" || v === "n" || v === "false" || v === "0") 
        return "No";
    return null;
}

function parseNumber(value) {
    if (value === null || value === undefined || value === "") 
        return null;
    const s = value.toString().trim().replace(/,/g, "");
    const match = s.match(/-?[\d.]+/);
    if (!match) 
        return null;
    const num = parseFloat(match[0]);
    return isNaN(num) ? null : num;
}

function parseInteger(value) {
    const num = parseNumber(value);
    if (num === null) 
        return null;
    if (num > 2147483647 || num < -2147483648) 
        return null;
    return Math.round(num);
}

function parseDecimal(value) {
    const num = parseNumber(value);
    if (num === null) 
        return null;
    return num.toString();
}

function str(value) {
    if (value === null || value === undefined) 
        return null;
    const s = value.toString().trim();
    return s || null;
}

function parseScanRate(value) {
    if (!value) 
        return { numerator: 1, denominator: null };
    const s = value.toString().trim();
    const parts = s.split("/");
    if (parts.length === 2) {
        const num = parseInt(parts[0]) || 1;
        const den = parseInt(parts[1]);
        return { numerator: num, denominator: isNaN(den) ? null : den };
    }
    const single = parseInt(s);
    if (!isNaN(single)) 
        return { numerator: 1, denominator: single };
    return { numerator: 1, denominator: null };
}

function parseContrastRatio(value) {
    if (!value) 
        return { numerator: null, denominator: 1 };
    const s = value.toString().trim().replace(/,/g, "");
    const parts = s.split(":");
    if (parts.length === 2) {
        return {
            numerator: parseInt(parts[0]) || null,
            denominator: parseInt(parts[1]) || 1,
        };
    }
    const num = parseInt(s);
    return { numerator: isNaN(num) ? null : num, denominator: 1 };
}

// Greyscale has special parsing ("16 bpc/ 22bit+" → "22+")
function matchGreyscale(value) {
    if (!value) 
        return { value: null, other: null };
    const raw = value.toString().trim();
    if (raw.toLowerCase() === "other") 
        return { value: "Other", other: null };
    const v = raw.toLowerCase();
    if (v.includes("22")) 
        return { value: "22+", other: null };
    if (v.includes("18")) 
        return { value: "18+", other: null };
    if (v.includes("<16") || v.includes("< 16")) 
        return { value: "<16", other: null };
    if (v === "16" || v.startsWith("16")) 
        return { value: "16", other: null };
    const matched = matchEnum(raw, GREYSCALES);
    if (matched) 
        return { value: matched, other: null };
    return { value: "Other", other: raw };
}

function matchPixelTech(value) {
    if (!value) 
        return null;
    const v = value.toString().trim().toLowerCase();
    if (v.includes("virtual")) 
        return "Virtual";
    if (v.includes("real")) 
        return "Real";
    return matchEnum(value, PIXEL_TECHS);
}

function matchSupport(value) {
    if (!value) 
        return null;
    const v = value.toString().trim().toLowerCase();
    if (v.includes("frontside and backside") || v.includes("front and back")) 
        return "Frontside and Backside";
    if (v.includes("frontside") || v.includes("frontend") || v.includes("front"))
        return "Frontendside";
    if (v.includes("backside") || v.includes("back")) 
        return "Backside";
    return matchEnum(value, SUPPORTS);
}

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");

        if (!file || !(file instanceof File)) {
            return errorResponse("No file provided", 400);
        }

        const name = (file.name || "").toLowerCase();
        if (
            !name.endsWith(".csv") &&
            !name.endsWith(".xlsx") &&
            !name.endsWith(".xls") &&
            !name.endsWith(".xlsm")
        ) {
            return errorResponse("Invalid file type. Upload .csv, .xlsx, .xls, or .xlsm", 400);
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        if (!sheet) {
            return errorResponse("The uploaded file contains no sheets", 400);
        }

        const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

        if (data.length < 2) {
            return errorResponse("File has no data rows", 400);
        }

        const headerRow = data[0] || [];
        const productStartCol = 5; // Column F

        // Determine how many product columns exist
        let numProducts = 0;
        const productNameRow = data[1] || [];
        for (
            let col = productStartCol;
            col < Math.max(productNameRow.length, headerRow.length, 50);
            col++
        ) {
            if (productNameRow[col] && productNameRow[col].toString().trim()) {
                numProducts = col - productStartCol + 1;
            }
        }

        if (numProducts === 0) {
            return errorResponse(
                "No product data found. Product names should be in row 2 starting from column F.",
                400
            );
        }

        function cell(rowIdx, productCol) {
            const row = data[rowIdx];
            if (!row) return null;
            const val = row[productStartCol + productCol];
            if (val === undefined || val === null || val === "") return null;
            return val;
        }

        // Pre-fetch categories
        const allCategories = await db.select().from(categories);
        const categoryMap = {};
        for (const cat of allCategories) {
            categoryMap[cat.name.toLowerCase()] = cat.id;
        }

        const results = { created: 0, updated: 0, errors: [], total: numProducts };

        for (let p = 0; p < numProducts; p++) {
            try {
                const productName = str(cell(1, p));
                const productNumber = str(cell(2, p));

                if (!productName || !productNumber) {
                    results.errors.push(
                        `Column ${p + 1}: Missing product name or number, skipped.`
                    );
                    continue;
                }

                // ── Enum fields (with "Other" handling for 5 fields) ──
                const productType = matchEnum(cell(3, p), PRODUCT_TYPES);
                const design = matchEnum(cell(5, p), DESIGNS);
                const application = matchEnum(cell(7, p), APPLICATIONS);
                const pixelConfiguration = matchEnum(cell(9, p), PIXEL_CONFIGS);
                const pixelTechnology = matchPixelTech(cell(10, p));
                const chipBonding = matchEnum(cell(20, p), CHIP_BONDINGS);
                const colourDepth = matchEnum(cell(26, p), COLOUR_DEPTHS);
                const currentGainControl = matchEnum(cell(30, p), CURRENT_GAINS);
                const videoRate = matchEnum(cell(31, p), VIDEO_RATES);
                const drivingMethod = matchEnum(cell(40, p), DRIVING_METHODS);
                const cooling = matchEnum(cell(49, p), COOLINGS);
                const powerRedundancy = matchYesNo(cell(42, p));
                const memoryOnModule = matchYesNo(cell(43, p));
                const smartModule = matchYesNo(cell(44, p));
                const support = matchSupport(cell(56, p));

                // 5 enum fields with "Other" companion
                const specialTypesResult = matchEnumWithOther(cell(6, p), SPECIAL_TYPES);
                const ledTechResult = matchEnumWithOther(cell(18, p), LED_TECHS);
                const calibMethodResult = matchEnumWithOther(cell(33, p), CALIBRATION_METHODS);
                const controlSysResult = matchEnumWithOther(cell(45, p), CONTROL_SYSTEMS);
                const greyscaleResult = matchGreyscale(cell(27, p));

                // Validate required enums (these must resolve to a value)
                const missing = [];
                if (!productType) missing.push("Product Type");
                if (!design) missing.push("Design");
                if (!application) missing.push("Application");
                if (!pixelConfiguration) missing.push("Pixel Configuration");
                if (!pixelTechnology) missing.push("Pixel Technology");
                if (!chipBonding) missing.push("Chip Bonding");
                if (!colourDepth) missing.push("Colour Depth");
                if (!currentGainControl) missing.push("Current Gain Control");
                if (!videoRate) missing.push("Video Rate");
                if (!drivingMethod) missing.push("Driving Method");
                if (!cooling) missing.push("Cooling");
                if (!powerRedundancy) missing.push("Power Redundancy");
                if (!memoryOnModule) missing.push("Memory on Module");
                if (!smartModule) missing.push("Smart Module");

                // "Other"-capable fields: if raw cell was provided but enum+other couldn't resolve
                if (!specialTypesResult.value && str(cell(6, p))) missing.push("Special Types");
                if (!ledTechResult.value && str(cell(18, p))) missing.push("LED Technology");
                if (!calibMethodResult.value && str(cell(33, p))) missing.push("Calibration Method");
                if (!controlSysResult.value && str(cell(45, p))) missing.push("Control System");

                // For these required enum fields, allow "Other" to pass as valid
                const specialTypes = specialTypesResult.value || "Other";
                const ledTechnology = ledTechResult.value || "Other";
                const calibrationMethod = calibMethodResult.value || "Other";
                const controlSystem = controlSysResult.value || "Other";

                const pixelPitch = parseDecimal(cell(8, p));
                if (!pixelPitch) missing.push("Pixel Pitch");

                const refreshRate = parseInteger(cell(38, p));
                if (refreshRate === null) missing.push("Refresh Rate");

                const scanRate = parseScanRate(cell(39, p));
                if (scanRate.denominator === null) missing.push("Scan Rate");

                if (missing.length > 0) {
                    results.errors.push(
                        `Product "${productName}": Missing/invalid required fields: ${missing.join(", ")}`
                    );
                    continue;
                }

                // ── Area of Use (category lookup / auto-create) ──
                const areaOfUseRaw = str(cell(4, p));
                let areaOfUseId = null;
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
                            const existing = await db
                                .select()
                                .from(categories)
                                .where(ilike(categories.name, areaOfUseRaw))
                                .limit(1)
                                .then((r) => r[0]);
                            if (existing) {
                                categoryMap[existing.name.toLowerCase()] = existing.id;
                                areaOfUseId = existing.id;
                            }
                        }
                    }
                }

                const contrast = parseContrastRatio(cell(23, p));

                // ── Build product data object ──
                const productData = {
                    productName,
                    productNumber,
                    productType,
                    design,
                    application,
                    pixelPitch,
                    pixelConfiguration,
                    pixelTechnology,
                    chipBonding,
                    colourDepth,
                    currentGainControl,
                    videoRate,
                    drivingMethod,
                    cooling,
                    powerRedundancy,
                    memoryOnModule,
                    smartModule,
                    support,
                    areaOfUseId,

                    // 5 enum fields with "Other" companion
                    specialTypes,
                    specialTypesOther: specialTypesResult.other,
                    ledTechnology,
                    ledTechnologyOther: ledTechResult.other,
                    calibrationMethod,
                    calibrationMethodOther: calibMethodResult.other,
                    controlSystem,
                    controlSystemOther: controlSysResult.other,
                    greyscaleProcessing: greyscaleResult.value,
                    greyscaleProcessingOther: greyscaleResult.other,

                    // Text fields
                    brightnessValue: str(cell(22, p)),
                    viewingAngleHorizontal: str(cell(24, p)),
                    viewingAngleVertical: str(cell(25, p)),
                    brightnessControl: str(cell(29, p)),
                    whitePointCalibration: str(cell(32, p)),
                    dciP3Coverage: str(cell(34, p)),
                    inputVoltage: str(cell(35, p)),
                    receivingCard: str(cell(46, p)),
                    operatingTemperature: str(cell(47, p)),
                    operatingHumidity: str(cell(48, p)),
                    heatDissipation: str(cell(50, p)),
                    ipRating: str(cell(51, p)),
                    monitoringFunctionEn: str(cell(52, p)),
                    additionalCertification: str(cell(53, p)),
                    emc: str(cell(54, p)),
                    safety: str(cell(55, p)),
                    ledChipManufacturer: str(cell(19, p)),
                    ledModulesPerCabinet: str(cell(15, p)),

                    // Decimal fields
                    cabinetWidth: parseDecimal(cell(11, p)),
                    cabinetHeight: parseDecimal(cell(12, p)),
                    weightWithoutPackaging: parseDecimal(cell(17, p)),

                    // Integer fields
                    refreshRate,
                    scanRateNumerator: scanRate.numerator,
                    scanRateDenominator: scanRate.denominator,
                    contrastRatioNumerator: contrast.numerator,
                    contrastRatioDenominator: contrast.denominator,
                    cabinetResolutionHorizontal: parseInteger(cell(13, p)),
                    cabinetResolutionVertical: parseInteger(cell(14, p)),
                    pixelDensity: parseInteger(cell(16, p)),
                    ledLifespan: parseInteger(cell(21, p)),
                    numberOfColours: parseInteger(cell(28, p)),
                    mtbfPowerSupply: parseInteger(cell(41, p)),
                    powerConsumptionMax: parseInteger(cell(36, p)),
                    powerConsumptionTypical: parseInteger(cell(37, p)),
                    warrantyPeriod: parseInteger(cell(57, p)),

                    // Products from Excel import are inactive by default (no images/features)
                    isActive: false,

                    updatedAt: new Date(),
                };

                // ── Upsert: check if product number already exists ──
                const existing = await db
                    .select({ id: products.id })
                    .from(products)
                    .where(eq(products.productNumber, productNumber))
                    .limit(1)
                    .then((r) => r[0]);

                if (existing) {
                    // UPDATE existing product (don't overwrite productNumber, id, or isActive)
                    const { productNumber: _pn, isActive: _ia, ...updateData } = productData;
                    await db
                        .update(products)
                        .set(updateData)
                        .where(eq(products.id, existing.id));
                    results.updated++;
                } else {
                    // INSERT new product
                    await db.insert(products).values(productData);
                    results.created++;
                }
            } catch (productErr) {
                const pName = str(cell(1, p)) || `Column ${p + 1}`;
                results.errors.push(`Product "${pName}": ${productErr.message}`);
            }
        }

        const parts = [];
        if (results.created > 0) parts.push(`${results.created} created`);
        if (results.updated > 0) parts.push(`${results.updated} updated`);
        const successPart = parts.length > 0 ? parts.join(", ") : "0 products processed";
        const message =
            `Import complete: ${successPart} out of ${results.total} products.` +
            (results.errors.length > 0
                ? ` ${results.errors.length} product(s) had errors.`
                : "");

        return successResponse(message, {
            created: results.created,
            updated: results.updated,
            total: results.total,
            errors: results.errors,
        });
    } catch (err) {
        console.error("Bulk import error:", err);
        return errorResponse(err.message || "Import failed", 500);
    }
}

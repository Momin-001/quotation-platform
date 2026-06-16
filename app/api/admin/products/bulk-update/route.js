import { db } from "@/lib/db";
import { products, categories } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/helpers/auth-helpers";
import { eq } from "drizzle-orm";
import * as XLSX from "xlsx";

// ─── Enum constants ───────────────────────────────────────────
const PRODUCT_TYPES = ["AIO Systems", "LED Display Single Cabinet"];
const DESIGNS = ["Fix", "Mobil"];
const SPECIAL_TYPES = ["Transparent", "Curved", "Floor", "Other"];
const APPLICATIONS = [
    "DOOH", "Indoor Signage", "Home Theater", "Stadium Scoreboard",
    "Video Cube", "Conference", "Stadium Ribbons", "Corporate Design",
    "Staging", "Virtual Production",
];
const PIXEL_CONFIGS = ["1R1G1B", "2R1G1B"];
const PIXEL_TECHS = ["Real", "Virtual"];
const LED_TECHS = ["SMD", "SMD+GOB", "IMD", "COB", "DIP", "LOB", "Other"];
const CHIP_BONDINGS = ["Gold Wire", "Copper Wire", "Flip-Chip"];
const COLOUR_DEPTHS = ["8", "10", "12"];
const CURRENT_GAINS = ["4", "8"];
const VIDEO_RATES = ["50/60", "120", "240"];
const CALIBRATION_METHODS = [
    "No Calibration", "Multiple Layers Chroma", "Multiple Layers Brightness",
    "Brightness", "Chroma", "Other",
];
const DRIVING_METHODS = ["Common Anode", "Common Cathode"];
const CONTROL_SYSTEMS = ["Colorlight", "Novastar", "Brompton", "LINSN", "Other"];
const GREYSCALES = ["<16", "16", "18+", "22+", "Other"];
const COOLINGS = ["Convection", "Fan"];
const OPTIONAL_NO = ["Optional", "No"];
const SUPPORTS = ["Frontendside", "Backside", "Frontside and Backside"];

// ─── Parsers ──────────────────────────────────────────────────
function str(v) {
    if (v === null || v === undefined) return null;
    const s = v.toString().trim();
    return s || null;
}

function parseNumber(v) {
    if (v === null || v === undefined || v === "") return null;
    const s = v.toString().trim().replace(/,/g, "");
    const m = s.match(/-?[\d.]+/);
    if (!m) return null;
    const n = parseFloat(m[0]);
    return isNaN(n) ? null : n;
}

function parseInteger(v) {
    const n = parseNumber(v);
    if (n === null) return null;
    if (n > 2147483647 || n < -2147483648) return null;
    return Math.round(n);
}

function parseDecimal(v) {
    const n = parseNumber(v);
    return n === null ? null : n.toString();
}

function matchEnum(v, options) {
    if (!v || !v.toString().trim()) return null;
    const raw = v.toString().trim();
    const exact = options.find((o) => o === raw);
    if (exact) return exact;
    const lower = raw.toLowerCase();
    const ci = options.find((o) => o.toLowerCase() === lower);
    return ci || null;
}

function matchOptionalNo(v) {
    if (!v) return null;
    const s = v.toString().trim().toLowerCase();
    if (["optional"].includes(s)) return "Optional";
    if (["no", "n", "false", "0"].includes(s)) return "No";
    return null;
}

function matchGreyscale(v) {
    if (!v) return null;
    const raw = v.toString().trim();
    const lower = raw.toLowerCase();
    if (lower === "other") return "Other";
    if (lower.includes("22")) return "22+";
    if (lower.includes("18")) return "18+";
    if (lower.includes("<16") || lower.includes("< 16")) return "<16";
    if (lower === "16" || lower.startsWith("16")) return "16";
    return matchEnum(raw, GREYSCALES);
}

function parseScanRate(v) {
    if (!v) return { numerator: 1, denominator: null };
    const s = v.toString().trim();
    const parts = s.split("/");
    if (parts.length === 2) {
        const num = parseInt(parts[0]) || 1;
        const den = parseInt(parts[1]);
        return { numerator: num, denominator: isNaN(den) ? null : den };
    }
    const single = parseInt(s);
    return { numerator: 1, denominator: isNaN(single) ? null : single };
}

function parseContrastRatio(v) {
    if (!v) return { numerator: null, denominator: 1 };
    const s = v.toString().trim().replace(/,/g, "");
    const parts = s.split(":");
    if (parts.length === 2) {
        return { numerator: parseInt(parts[0]) || null, denominator: parseInt(parts[1]) || 1 };
    }
    const n = parseInt(s);
    return { numerator: isNaN(n) ? null : n, denominator: 1 };
}

function matchSupport(v) {
    if (!v) return null;
    const lower = v.toString().trim().toLowerCase();
    if (lower.includes("frontside and backside") || lower.includes("front and back")) return "Frontside and Backside";
    if (lower.includes("frontside") || lower.includes("frontend") || lower.includes("front")) return "Frontendside";
    if (lower.includes("backside") || lower.includes("back")) return "Backside";
    return matchEnum(v, SUPPORTS);
}

function matchPixelTech(v) {
    if (!v) return null;
    const lower = v.toString().trim().toLowerCase();
    if (lower.includes("virtual")) return "Virtual";
    if (lower.includes("real")) return "Real";
    return matchEnum(v, PIXEL_TECHS);
}

// ─── Column name → field builder ──────────────────────────────
// Returns a partial productData object from a single row value for a given column header.
function applyColumn(header, rawValue, update, categoryMap) {
    const h = header.trim().toLowerCase();
    const v = rawValue === undefined || rawValue === null || rawValue === "" ? null : rawValue;

    switch (h) {
        case "product name":
            update.productName = str(v) ?? update.productName;
            break;
        case "product description":
            update.productDescription = str(v);
            break;
        case "oem brand":
            update.oemBrand = str(v);
            break;
        case "category": {
            const name = str(v);
            if (name) {
                const id = categoryMap[name.toLowerCase()];
                if (id) update.areaOfUseId = id;
            }
            break;
        }
        case "product type":
            update.productType = matchEnum(v, PRODUCT_TYPES);
            break;
        case "design":
            update.design = matchEnum(v, DESIGNS);
            break;
        case "special types":
            update.specialTypes = matchEnum(v, SPECIAL_TYPES);
            break;
        case "special types other":
            update.specialTypesOther = str(v);
            break;
        case "application":
            update.application = v
                ? v.toString().split(",").map((s) => s.trim()).filter(Boolean)
                : [];
            break;
        case "pixel pitch":
            update.pixelPitch = parseDecimal(v);
            break;
        case "pixel configuration":
            update.pixelConfiguration = matchEnum(v, PIXEL_CONFIGS);
            break;
        case "pixel technology":
            update.pixelTechnology = matchPixelTech(v);
            break;
        case "cabinet width (mm)":
            update.cabinetWidth = parseDecimal(v);
            break;
        case "cabinet height (mm)":
            update.cabinetHeight = parseDecimal(v);
            break;
        case "cabinet resolution horizontal":
            update.cabinetResolutionHorizontal = parseInteger(v);
            break;
        case "cabinet resolution vertical":
            update.cabinetResolutionVertical = parseInteger(v);
            break;
        case "led modules per cabinet":
            update.ledModulesPerCabinet = str(v);
            break;
        case "pixel density":
            update.pixelDensity = parseInteger(v);
            break;
        case "weight without packaging (kg)":
            update.weightWithoutPackaging = parseDecimal(v);
            break;
        case "led technology":
            update.ledTechnology = matchEnum(v, LED_TECHS);
            break;
        case "led technology other":
            update.ledTechnologyOther = str(v);
            break;
        case "led chip manufacturer":
            update.ledChipManufacturer = str(v);
            break;
        case "chip bonding":
            update.chipBonding = matchEnum(v, CHIP_BONDINGS);
            break;
        case "led lifespan (hours)":
            update.ledLifespan = parseInteger(v);
            break;
        case "brightness value":
            update.brightnessValue = str(v);
            break;
        case "contrast ratio": {
            const cr = parseContrastRatio(v);
            update.contrastRatioNumerator = cr.numerator;
            update.contrastRatioDenominator = cr.denominator;
            break;
        }
        case "viewing angle horizontal":
            update.viewingAngleHorizontal = str(v);
            break;
        case "viewing angle vertical":
            update.viewingAngleVertical = str(v);
            break;
        case "colour depth (bit)":
            update.colourDepth = matchEnum(v, COLOUR_DEPTHS);
            break;
        case "greyscale processing":
            update.greyscaleProcessing = matchGreyscale(v);
            break;
        case "greyscale processing other":
            update.greyscaleProcessingOther = str(v);
            break;
        case "number of colours":
            update.numberOfColours = parseInteger(v);
            break;
        case "brightness control":
            update.brightnessControl = str(v);
            break;
        case "led driver":
            update.ledDriver = str(v);
            break;
        case "current gain control":
            update.currentGainControl = matchEnum(v, CURRENT_GAINS);
            break;
        case "video rate":
            update.videoRate = matchEnum(v, VIDEO_RATES);
            break;
        case "white point calibration":
            update.whitePointCalibration = str(v);
            break;
        case "calibration method":
            update.calibrationMethod = matchEnum(v, CALIBRATION_METHODS);
            break;
        case "calibration method other":
            update.calibrationMethodOther = str(v);
            break;
        case "dci-p3 coverage":
            update.dciP3Coverage = str(v);
            break;
        case "input voltage":
            update.inputVoltage = str(v);
            break;
        case "power consumption max (w)":
            update.powerConsumptionMax = parseInteger(v);
            break;
        case "power consumption typical (w)":
            update.powerConsumptionTypical = parseInteger(v);
            break;
        case "refresh rate (hz)":
            update.refreshRate = parseInteger(v);
            break;
        case "scan rate": {
            const sr = parseScanRate(v);
            update.scanRateNumerator = sr.numerator;
            update.scanRateDenominator = sr.denominator;
            break;
        }
        case "driving method":
            update.drivingMethod = matchEnum(v, DRIVING_METHODS);
            break;
        case "power supply":
            update.powerSupply = str(v);
            break;
        case "mtbf power supply (hours)":
            update.mtbfPowerSupply = parseInteger(v);
            break;
        case "power redundancy":
            update.powerRedundancy = matchOptionalNo(v);
            break;
        case "memory on module":
            update.memoryOnModule = matchOptionalNo(v);
            break;
        case "smart module":
            update.smartModule = matchOptionalNo(v);
            break;
        case "control system":
            update.controlSystem = matchEnum(v, CONTROL_SYSTEMS);
            break;
        case "control system other":
            update.controlSystemOther = str(v);
            break;
        case "receiving card":
            update.receivingCard = str(v);
            break;
        case "operating temperature":
            update.operatingTemperature = str(v);
            break;
        case "operating humidity":
            update.operatingHumidity = str(v);
            break;
        case "cooling":
            update.cooling = matchEnum(v, COOLINGS);
            break;
        case "heat dissipation":
            update.heatDissipation = str(v);
            break;
        case "ip rating":
            update.ipRating = str(v);
            break;
        case "monitoring function (en)":
            update.monitoringFunctionEn = str(v);
            break;
        case "additional certification":
            update.additionalCertification = str(v);
            break;
        case "emc":
            update.emc = str(v);
            break;
        case "safety":
            update.safety = str(v);
            break;
        case "support":
            update.support = matchSupport(v);
            break;
        case "warranty period (months)":
            update.warrantyPeriod = parseInteger(v);
            break;
        case "support during warranty (en)":
            update.supportDuringWarrantyEn = str(v);
            break;
        case "support after warranty (en)":
            update.supportAfterWarrantyEn = str(v);
            break;
        case "price per cabinet (usd)":
            update.pricePerCabinetUsd = parseDecimal(v);
            break;
        case "price per metre square (usd)":
            update.pricePerMetreSquareUsd = parseDecimal(v);
            break;
        case "profit margin (%)":
            update.profitMargin = parseDecimal(v);
            break;
        case "stock pieces":
            update.stockPieces = parseInteger(v);
            break;
        case "leadtime (days)":
            update.leadtimeDays = parseInteger(v);
            break;
        case "notes":
            update.notes = str(v);
            break;
        // Read-only / ignored: id, slug, product number, status, created at, last updated
        default:
            break;
    }
}

// ─── Main handler ─────────────────────────────────────────────
export async function POST(req) {
    try {
        const { user, error } = await getCurrentUser();
        if (error || !user) return errorResponse(error || "Unauthorized", 401);
        if (user.role !== "admin" && user.role !== "super_admin") return errorResponse("Forbidden", 403);

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

        // Row 0 = headers
        const headers = (data[0] || []).map((h) => (h ? h.toString() : ""));

        // Find the "ID" column index
        const idColIdx = headers.findIndex((h) => h.trim().toLowerCase() === "id");
        if (idColIdx === -1) {
            return errorResponse(
                "No 'ID' column found. The file must be the exported products Excel with an 'ID' column.",
                400
            );
        }

        // Pre-load all categories for name → id lookup
        const allCats = await db.select({ id: categories.id, name: categories.name }).from(categories);
        const categoryMap = {};
        for (const cat of allCats) categoryMap[cat.name.toLowerCase()] = cat.id;

        const dataRows = data.slice(1).filter((row) => {
            const id = row[idColIdx];
            return id && id.toString().trim();
        });

        const results = { updated: 0, skipped: 0, errors: [], total: dataRows.length };

        for (let i = 0; i < dataRows.length; i++) {
            const row = dataRows[i];
            const productId = str(row[idColIdx]);

            if (!productId) {
                results.skipped++;
                continue;
            }

            try {
                // Check product exists
                const existing = await db
                    .select({ id: products.id })
                    .from(products)
                    .where(eq(products.id, productId))
                    .limit(1)
                    .then((r) => r[0]);

                if (!existing) {
                    results.errors.push(`Row ${i + 2}: Product ID "${productId}" not found, skipped.`);
                    results.skipped++;
                    continue;
                }

                // Build update object by iterating each column
                const update = { updatedAt: new Date() };
                for (let col = 0; col < headers.length; col++) {
                    if (col === idColIdx) continue;
                    applyColumn(headers[col], row[col], update, categoryMap);
                }

                await db.update(products).set(update).where(eq(products.id, productId));
                results.updated++;
            } catch (rowErr) {
                results.errors.push(`Row ${i + 2} (ID: ${productId}): ${rowErr.message}`);
            }
        }

        const message =
            `Bulk update complete: ${results.updated} updated, ${results.skipped} skipped out of ${results.total} rows.` +
            (results.errors.length ? ` ${results.errors.length} row(s) had errors.` : "");

        return successResponse(message, results);
    } catch (err) {
        console.error("POST /api/admin/products/bulk-update error:", err);
        return errorResponse("Failed to process bulk update", 500);
    }
}

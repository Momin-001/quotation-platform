import { db } from "@/lib/db";
import { products, categories } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth-helpers";
import { eq, ilike } from "drizzle-orm";
import * as XLSX from "xlsx";

// ──────────────────────────────────────────────────────────
// ENUM DEFINITIONS (Case-insensitive matching)
// ──────────────────────────────────────────────────────────
const PRODUCT_TYPES = ["AIO Systems", "LED Display Single Cabinet"];
const DESIGNS = ["Fix", "Mobil"];
const SPECIAL_TYPES = ["Transparent", "Curved", "Floor"]; // Other → specialTypesOther
const APPLICATIONS = [
  "DOOH",
  "Indoor Signage",
  "Home Theater",
  "Stadium Scoreboard",
  "Video Cube",
  "Conference",
  "Stadium Ribbons",
  "Corporate Design",
  "Staging",
  "Virtual Production",
];
const PIXEL_CONFIGS = ["1R1G1B", "2R1G1B"];
const PIXEL_TECHS = ["Real", "Virtual"];
const LED_TECHS = ["SMD", "SMD+GOB", "IMD", "COB", "DIP", "LOB"]; // Other → ledTechnologyOther
const CHIP_BONDINGS = ["Gold Wire", "Copper Wire", "Flip-Chip"];
const COLOUR_DEPTHS = ["8", "10", "12"];
const CURRENT_GAINS = ["4", "8"];
const VIDEO_RATES = ["50/60", "120", "240"];
const CALIBRATION_METHODS = [
  "No Calibration",
  "Multiple Layers Chroma",
  "Multiple Layers Brightness",
  "Brightness",
  "Chroma",
];
const DRIVING_METHODS = ["Common Anode", "Common Cathode"];
const CONTROL_SYSTEMS = ["Colorlight", "Novastar", "Brompton", "LINSN"]; // Other → controlSystemOther
const GREYSCALES = ["<16", "16", "18+", "22+"]; // Other → greyscaleProcessingOther
const COOLINGS = ["Convection", "Fan"];
const SUPPORTS = ["Frontendside", "Backside", "Frontside and Backside"];

// ──────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ──────────────────────────────────────────────────────────

// --- String/Numeric Parsing ---
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

// --- Boolean / Enum Matching ---
function matchYesNo(value) {
  if (!value) return null;
  const v = value.toString().trim().toLowerCase();
  if (["yes", "y", "true", "1"].includes(v)) return "Yes";
  if (["no", "n", "false", "0"].includes(v)) return "No";
  return null;
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

// --- Enum Matching with “Other” handling ---
function matchEnumWithOther(rawValue, options) {
  if (!rawValue || !rawValue.toString().trim())
    return { value: null, other: null };

  const raw = rawValue.toString().trim();
  if (raw.toLowerCase() === "other") return { value: "Other", other: null };

  const matched = matchEnum(raw, options);
  if (matched) return { value: matched, other: null };

  return { value: "Other", other: raw };
}

// --- Specialized Parsers ---
function parseScanRate(value) {
  if (!value) return { numerator: 1, denominator: null };
  const s = value.toString().trim();
  const parts = s.split("/");
  if (parts.length === 2) {
    const num = parseInt(parts[0]) || 1;
    const den = parseInt(parts[1]);
    return { numerator: num, denominator: isNaN(den) ? null : den };
  }
  const single = parseInt(s);
  if (!isNaN(single)) return { numerator: 1, denominator: single };
  return { numerator: 1, denominator: null };
}

function parseContrastRatio(value) {
  if (!value) return { numerator: null, denominator: 1 };
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

// --- Specific Enum Helpers ---
function matchGreyscale(value) {
  if (!value) return { value: null, other: null };
  const raw = value.toString().trim();
  const v = raw.toLowerCase();

  if (v === "other") return { value: "Other", other: null };
  if (v.includes("22")) return { value: "22+", other: null };
  if (v.includes("18")) return { value: "18+", other: null };
  if (v.includes("<16") || v.includes("< 16")) return { value: "<16", other: null };
  if (v === "16" || v.startsWith("16")) return { value: "16", other: null };

  const matched = matchEnum(raw, GREYSCALES);
  return matched ? { value: matched, other: null } : { value: "Other", other: raw };
}

function matchPixelTech(value) {
  if (!value) return null;
  const v = value.toString().trim().toLowerCase();
  if (v.includes("virtual")) return "Virtual";
  if (v.includes("real")) return "Real";
  return matchEnum(value, PIXEL_TECHS);
}

function matchSupport(value) {
  if (!value) return null;
  const v = value.toString().trim().toLowerCase();
  if (v.includes("frontside and backside") || v.includes("front and back"))
    return "Frontside and Backside";
  if (v.includes("frontside") || v.includes("frontend") || v.includes("front"))
    return "Frontendside";
  if (v.includes("backside") || v.includes("back")) return "Backside";
  return matchEnum(value, SUPPORTS);
}

// ──────────────────────────────────────────────────────────
// MAIN IMPORT HANDLER
// ──────────────────────────────────────────────────────────
export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File))
      return errorResponse("No file provided", 400);

    const name = (file.name || "").toLowerCase();
    if (
      !name.endsWith(".csv") &&
      !name.endsWith(".xlsx") &&
      !name.endsWith(".xls") &&
      !name.endsWith(".xlsm")
    ) {
      return errorResponse(
        "Invalid file type. Upload .csv, .xlsx, .xls, or .xlsm",
        400
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!sheet) return errorResponse("The uploaded file contains no sheets", 400);

    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    if (data.length < 2) return errorResponse("File has no data rows", 400);

    const headerRow = data[0] || [];
    const productStartCol = 5; // Column F
    const productNameRow = data[1] || [];

    // Determine product count
    let numProducts = 0;
    for (let col = productStartCol; col < Math.max(productNameRow.length, headerRow.length, 50); col++) {
      if (productNameRow[col] && productNameRow[col].toString().trim()) {
        numProducts = col - productStartCol + 1;
      }
    }

    if (numProducts === 0)
      return errorResponse(
        "No product data found. Product names should be in row 2 starting from column F.",
        400
      );

    // Read specific cell
    function cell(rowIdx, productCol) {
      const row = data[rowIdx];
      if (!row) return null;
      const val = row[productStartCol + productCol];
      return val === undefined || val === null || val === "" ? null : val;
    }

    // Pre-fetch categories
    const allCategories = await db.select().from(categories);
    const categoryMap = {};
    for (const cat of allCategories)
      categoryMap[cat.name.toLowerCase()] = cat.id;

    const results = { created: 0, updated: 0, errors: [], total: numProducts };

    // ────────────────────────────
    // MAIN IMPORT LOOP
    // ────────────────────────────
    for (let p = 0; p < numProducts; p++) {
      try {
        // Sequential cell reads for readability
        const productName = str(cell(1, p));
        const productNumber = str(cell(2, p));
        const oemBrand = str(cell(3, p));
        const areaOfUseRaw = str(cell(5, p));

        if (!productName || !productNumber) {
          results.errors.push(`Column ${p + 1}: Missing product name or number, skipped.`);
          continue;
        }

        // Parse + match all relevant fields in row order
        const productType = matchEnum(cell(4, p), PRODUCT_TYPES);
        const design = matchEnum(cell(6, p), DESIGNS);
        const specialTypesResult = matchEnumWithOther(cell(7, p), SPECIAL_TYPES);
        const application = matchEnum(cell(8, p), APPLICATIONS);
        const pixelPitch = parseDecimal(cell(9, p));
        const pixelConfiguration = matchEnum(cell(10, p), PIXEL_CONFIGS);
        const pixelTechnology = matchPixelTech(cell(11, p));
        const cabinetWidth = parseDecimal(cell(12, p));
        const cabinetHeight = parseDecimal(cell(13, p));
        const cabinetResolutionHorizontal = parseInteger(cell(14, p));
        const cabinetResolutionVertical = parseInteger(cell(15, p));
        const ledModulesPerCabinet = str(cell(16, p));
        const pixelDensity = parseInteger(cell(17, p));
        const weightWithoutPackaging = parseDecimal(cell(18, p));
        const ledTechResult = matchEnumWithOther(cell(19, p), LED_TECHS);
        const ledChipManufacturer = str(cell(20, p));
        const chipBonding = matchEnum(cell(21, p), CHIP_BONDINGS);
        const ledLifespan = parseInteger(cell(22, p));
        const brightnessValue = str(cell(23, p));
        const contrast = parseContrastRatio(cell(24, p));
        const viewingAngleHorizontal = str(cell(25, p));
        const viewingAngleVertical = str(cell(26, p));
        const colourDepth = matchEnum(cell(27, p), COLOUR_DEPTHS);
        const greyscaleResult = matchGreyscale(cell(28, p));
        const numberOfColours = parseInteger(cell(29, p));
        const brightnessControl = str(cell(30, p));
        const ledDriver = str(cell(31, p));
        const currentGainControl = matchEnum(cell(32, p), CURRENT_GAINS);
        const videoRate = matchEnum(cell(33, p), VIDEO_RATES);
        const whitePointCalibration = str(cell(34, p));
        const calibMethodResult = matchEnumWithOther(cell(35, p), CALIBRATION_METHODS);
        const dciP3Coverage = str(cell(36, p));
        const inputVoltage = str(cell(37, p));
        const powerConsumptionMax = parseInteger(cell(38, p));
        const powerConsumptionTypical = parseInteger(cell(39, p));
        const refreshRate = parseInteger(cell(40, p));
        const scanRate = parseScanRate(cell(41, p));
        const drivingMethod = matchEnum(cell(42, p), DRIVING_METHODS);
        const powerSupply = str(cell(43, p));
        const mtbfPowerSupply = parseInteger(cell(44, p));
        const powerRedundancy = matchYesNo(cell(45, p));
        const memoryOnModule = matchYesNo(cell(46, p));
        const smartModule = matchYesNo(cell(47, p));
        const controlSysResult = matchEnumWithOther(cell(48, p), CONTROL_SYSTEMS);
        const receivingCard = str(cell(49, p));
        const operatingTemperature = str(cell(50, p));
        const operatingHumidity = str(cell(51, p));
        const cooling = matchEnum(cell(52, p), COOLINGS);
        const heatDissipation = str(cell(53, p));
        const ipRating = str(cell(54, p));
        const monitoringFunctionEn = str(cell(55, p));
        const additionalCertification = str(cell(56, p));
        const emc = str(cell(57, p));
        const safety = str(cell(58, p));
        const support = matchSupport(cell(59, p));
        const warrantyPeriod = parseInteger(cell(60, p));
        const pricePerCabinetUsd = parseDecimal(cell(63, p));
        const pricePerMetreSquareUsd = parseDecimal(cell(64, p));
        const stockPieces = parseInteger(cell(65, p));
        const leadtimeDays = parseInteger(cell(66, p));
        const notes = str(cell(67, p));

        // ── Validation ──
        const missing = [];
        // if (!productType) missing.push("Product Type");
        // if (!design) missing.push("Design");
        // if (!application) missing.push("Application");
        // if (!pixelConfiguration) missing.push("Pixel Configuration");
        // if (!pixelTechnology) missing.push("Pixel Technology");
        // if (!chipBonding) missing.push("Chip Bonding");
        // if (!colourDepth) missing.push("Colour Depth");
        // if (!currentGainControl) missing.push("Current Gain Control");
        // if (!videoRate) missing.push("Video Rate");
        // if (!drivingMethod) missing.push("Driving Method");
        // if (!cooling) missing.push("Cooling");
        // if (!powerRedundancy) missing.push("Power Redundancy");
        // if (!memoryOnModule) missing.push("Memory on Module");
        // if (!smartModule) missing.push("Smart Module");
        // if (!oemBrand) missing.push("OEM/Brand");
        // if (!ledDriver) missing.push("LED Driver");
        // if (!powerSupply) missing.push("Power Supply");
        // if (!pixelPitch) missing.push("Pixel Pitch");
        // if (refreshRate === null) missing.push("Refresh Rate");
        // if (scanRate.denominator === null) missing.push("Scan Rate");

        // if (!specialTypesResult.value && str(cell(7, p))) missing.push("Special Types");
        // if (!ledTechResult.value && str(cell(19, p))) missing.push("LED Technology");
        // if (!calibMethodResult.value && str(cell(35, p))) missing.push("Calibration Method");
        // if (!controlSysResult.value && str(cell(48, p))) missing.push("Control System");

        if (missing.length > 0) {
          results.errors.push(
            `Product "${productName}": Missing/invalid required fields: ${missing.join(", ")}`
          );
          continue;
        }

        // ── Category handling ──
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

        // ── Product data object ──
        const productData = {
          productName,
          productNumber,
          oemBrand,
          ledDriver,
          powerSupply,
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

          // Other-companion enums
          specialTypes: specialTypesResult.value || "Other",
          specialTypesOther: specialTypesResult.other,
          ledTechnology: ledTechResult.value || "Other",
          ledTechnologyOther: ledTechResult.other,
          calibrationMethod: calibMethodResult.value || "Other",
          calibrationMethodOther: calibMethodResult.other,
          controlSystem: controlSysResult.value || "Other",
          controlSystemOther: controlSysResult.other,
          greyscaleProcessing: greyscaleResult.value,
          greyscaleProcessingOther: greyscaleResult.other,

          // Strings
          brightnessValue,
          viewingAngleHorizontal,
          viewingAngleVertical,
          brightnessControl,
          whitePointCalibration,
          dciP3Coverage,
          inputVoltage,
          receivingCard,
          operatingTemperature,
          operatingHumidity,
          heatDissipation,
          ipRating,
          monitoringFunctionEn,
          additionalCertification,
          emc,
          safety,
          ledChipManufacturer,
          ledModulesPerCabinet,

          // Numerics
          cabinetWidth,
          cabinetHeight,
          weightWithoutPackaging,
          refreshRate,
          scanRateNumerator: scanRate.numerator,
          scanRateDenominator: scanRate.denominator,
          contrastRatioNumerator: contrast.numerator,
          contrastRatioDenominator: contrast.denominator,
          cabinetResolutionHorizontal,
          cabinetResolutionVertical,
          pixelDensity,
          ledLifespan,
          numberOfColours,
          mtbfPowerSupply,
          powerConsumptionMax,
          powerConsumptionTypical,
          warrantyPeriod,

          // Optional fields
          pricePerCabinetUsd: pricePerCabinetUsd || null,
          pricePerMetreSquareUsd: pricePerMetreSquareUsd || null,
          stockPieces: stockPieces ?? null,
          leadtimeDays: leadtimeDays ?? null,
          notes: notes || null,

          isActive: false,
          updatedAt: new Date(),
        };

        // ── UPSERT ──
        const existing = await db
          .select({ id: products.id })
          .from(products)
          .where(eq(products.productNumber, productNumber))
          .limit(1)
          .then((r) => r[0]);

        if (existing) {
          const { productNumber: _pn, isActive: _ia, ...updateData } = productData;
          await db.update(products).set(updateData).where(eq(products.id, existing.id));
          results.updated++;
        } else {
          await db.insert(products).values(productData);
          results.created++;
        }
      } catch (productErr) {
        const pName = str(cell(1, p)) || `Column ${p + 1}`;
        results.errors.push(`Product "${pName}": ${productErr.message}`);
      }
    }

    // ── Final response ──
    const summary = [];
    if (results.created > 0) summary.push(`${results.created} created`);
    if (results.updated > 0) summary.push(`${results.updated} updated`);
    const summaryText = summary.length ? summary.join(", ") : "0 products processed";
    const message = `Import complete: ${summaryText} out of ${results.total} products.` +
      (results.errors.length ? ` ${results.errors.length} product(s) had errors.` : "");

    return successResponse(message, results);
  } catch (err) {
    console.error("Bulk import error:", err);
    return errorResponse(err.message || "Import failed", 500);
  }
}
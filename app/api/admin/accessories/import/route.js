import { db } from "@/lib/db";
import { accessories, accessoryFeatures } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";
import * as XLSX from "xlsx";

const PRODUCT_GROUPS = ["Mechanics", "Service", "Software", "Maintenance"];

function matchProductGroup(value) {
    if (!value || !value.toString().trim()) return null;
    const raw = value.toString().trim().toLowerCase();
    const map = {
        mechanik: "Mechanics",
        mechanics: "Mechanics",
        service: "Service",
        software: "Software",
        maintenance: "Maintenance",
        wartung: "Maintenance",
    };
    if (map[raw]) return map[raw];
    const exact = PRODUCT_GROUPS.find((g) => g.toLowerCase() === raw);
    if (exact) return exact;
    const partial = PRODUCT_GROUPS.find(
        (g) => raw.includes(g.toLowerCase()) || g.toLowerCase().includes(raw)
    );
    return partial || null;
}

function str(value) {
    if (value === null || value === undefined) return null;
    const s = value.toString().trim();
    return s || null;
}

function parseDecimal(value) {
    if (value === null || value === undefined || value === "") return null;
    const s = value.toString().trim().replace(/,/g, "");
    const match = s.match(/-?[\d.]+/);
    if (!match) return null;
    const num = parseFloat(match[0]);
    return isNaN(num) ? null : num.toString();
}

function parseCommaSeparated(value) {
    if (value === null || value === undefined || value === "") return [];
    return value
        .toString()
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
}

/**
 * Accessory Excel layout (column-oriented / transposed):
 *   Column A = field labels (ITEM_EN), Column B = ITEM_DE, Column C = Example
 *   Starting from Column D (index 3), each column is one accessory.
 *
 *   Row 0  = header row (ITEM_EN, ITEM_DE, unit, Example...)
 *   Row 1  = Product Name
 *   Row 2  = Product Number
 *   Row 3  = Short Text
 *   Row 4  = Long Text
 *   Row 5  = Product Group
 *   Row 6  = Unit
 *   Row 7  = Manufacturer
 *   Row 8  = Supplier
 *   Row 9  = Purchase Price
 *   Row 10 = Retail Price
 *   Row 11 = Leadtime
 */
export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");

        if (!file || !(file instanceof File)) {
            return errorResponse("No file provided", 400);
        }

        const name = (file.name || "").toLowerCase();
        if (!name.endsWith(".csv") && !name.endsWith(".xlsx") && !name.endsWith(".xls") && !name.endsWith(".xlsm")) {
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

        // Field label → row index mapping (scan column A)
        const headerMappings = {
            productName: ["product name", "artikelbezeichnung", "item_en", "name"],
            productNumber: ["product number", "artikelnummer", "article number", "item number", "product_number"],
            shortText: ["short text", "kurztext", "short_text"],
            longText: ["long text", "langtext", "long_text"],
            features: ["features", "feature"],
            optionalField: ["optional field", "optional_field", "optional"],
            productGroup: ["product group", "warengruppe", "product_group", "group"],
            manufacturer: ["manufacturer", "hersteller"],
            supplier: ["supplier", "lieferant"],
            productDatasheetUrl: ["product datasheet", "datasheet", "product_datasheet_url", "product datasheet url"],
            purchasePrice: ["price per unit (purchase price)", "preis pro einheit ek", "purchase price", "purchase_price", "ek"],
            retailPrice: ["price per unit (retail price)", "preis pro einheit vk", "retail price", "retail_price", "vk"],
            unit: ["unit", "einheit"],
            leadTime: ["leadtime", "lieferzeit", "lead time", "lead_time"],
        };

        const fieldRowMap = {};
        for (let r = 1; r < data.length; r++) {
            const label = str(data[r]?.[0])?.toLowerCase() || "";
            for (const [field, aliases] of Object.entries(headerMappings)) {
                if (aliases.some((a) => label.includes(a))) {
                    fieldRowMap[field] = r;
                    break;
                }
            }
        }

        const nameRowIdx = fieldRowMap.productName;
        if (nameRowIdx === undefined) {
            return errorResponse("Could not find 'Product Name' field in the file", 400);
        }

        // Data columns start at D (index 3), skipping label columns A, B, C
        const dataStartCol = 3;

        const nameRow = data[nameRowIdx] || [];
        let numAccessories = 0;
        for (let col = dataStartCol; col < Math.max(nameRow.length, 50); col++) {
            if (nameRow[col] && nameRow[col].toString().trim()) {
                numAccessories = col - dataStartCol + 1;
            }
        }

        const results = { created: 0, skipped: 0, errors: [], total: numAccessories };

        if (numAccessories === 0) {
            return errorResponse("No accessory data found in the file.", 400);
        }

        function cell(field, accessoryCol) {
            const rowIdx = fieldRowMap[field];
            if (rowIdx === undefined) return null;
            const row = data[rowIdx];
            if (!row) return null;
            const val = row[dataStartCol + accessoryCol];
            if (val === undefined || val === null || val === "") return null;
            return val;
        }

        for (let a = 0; a < numAccessories; a++) {
            try {
                const productName = str(cell("productName", a));
                const productNumber = str(cell("productNumber", a));

                if (!productName || !productNumber) {
                    results.errors.push(`Column ${a + 1}: Missing product name or number, skipped.`);
                    continue;
                }

                const productGroup = matchProductGroup(cell("productGroup", a));
                if (!productGroup) {
                    results.errors.push(
                        `Accessory "${productName}": Invalid or missing product group "${cell("productGroup", a)}". Must be one of: ${PRODUCT_GROUPS.join(", ")}`
                    );
                    continue;
                }

                const featuresArray = parseCommaSeparated(cell("features", a));
                const optionalFieldArray = parseCommaSeparated(cell("optionalField", a));

                const accessoryData = {
                    productName,
                    productNumber,
                    shortText: str(cell("shortText", a)),
                    longText: str(cell("longText", a)),
                    productGroup,
                    unit: str(cell("unit", a)),
                    manufacturer: str(cell("manufacturer", a)),
                    supplier: str(cell("supplier", a)),
                    productDatasheetUrl: str(cell("productDatasheetUrl", a)),
                    purchasePrice: parseDecimal(cell("purchasePrice", a)),
                    retailPrice: parseDecimal(cell("retailPrice", a)),
                    leadTime: str(cell("leadTime", a)),
                    optionalField: optionalFieldArray.length > 0 ? optionalFieldArray : [],
                    isActive: true,
                    updatedAt: new Date(),
                };

                // Insert only — skip if product number already exists
                const [existing] = await db
                    .select({ id: accessories.id })
                    .from(accessories)
                    .where(eq(accessories.productNumber, productNumber))
                    .limit(1);

                if (existing) {
                    results.skipped++;
                    continue;
                }

                const [inserted] = await db.insert(accessories).values(accessoryData).returning();
                if (featuresArray.length > 0) {
                    await Promise.all(
                        featuresArray.map((feature) =>
                            db.insert(accessoryFeatures).values({
                                accessoryId: inserted.id,
                                feature: feature.trim(),
                            })
                        )
                    );
                }
                results.created++;
            } catch (accessoryErr) {
                const aName = str(cell("productName", a)) || `Column ${a + 1}`;
                results.errors.push(`Accessory "${aName}": ${accessoryErr.message}`);
            }
        }

        const parts = [];
        if (results.created > 0) parts.push(`${results.created} created`);
        if (results.skipped > 0) parts.push(`${results.skipped} skipped (already exist)`);
        const successPart = parts.length > 0 ? parts.join(", ") : "0 accessories processed";
        const message =
            `Import complete: ${successPart} out of ${results.total} accessories.` +
            (results.errors.length > 0 ? ` ${results.errors.length} had errors.` : "");

        return successResponse(message, {
            created: results.created,
            skipped: results.skipped,
            total: results.total,
            errors: results.errors,
        });
    } catch (err) {
        console.error("POST /api/admin/accessories/import error:", err);
        return errorResponse("Import failed", 500);
    }
}

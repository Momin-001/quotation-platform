import { db } from "@/lib/db";
import { accessories } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";
import * as XLSX from "xlsx";

const PRODUCT_GROUPS = ["Mechanics", "Service", "Software", "Maintenance"];

function matchProductGroup(value) {
    if (!value || !value.toString().trim()) return null;
    const raw = value.toString().trim().toLowerCase();
    // German → English mapping
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

/**
 * Accessory Excel layout (row-oriented):
 *   Row 1 = headers (ITEM_EN, ITEM_DE, unit, then product data columns)
 *   We search for column headers by matching known field names.
 *
 * Expected columns (case-insensitive matching):
 *   Product Name | Product Number | Short Text | Long Text |
 *   product group | Unit | Manufacturer | supplier |
 *   Price per unit (purchase price) | Price per unit (retail price) | Leadtime
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

        // Find header row: look for a row that contains "Product Name" or "ITEM_EN"
        let headerRowIdx = 0;
        const headerMappings = {
            productName: ["product name", "artikelbezeichnung", "item_en", "name"],
            productNumber: ["product number", "artikelnummer", "article number", "item number", "product_number"],
            shortText: ["short text", "kurztext", "short_text"],
            longText: ["long text", "langtext", "long_text"],
            productGroup: ["product group", "warengruppe", "product_group", "group"],
            // purchasePrice/retailPrice must be matched before unit (unit would match "price per unit")
            purchasePrice: ["price per unit (purchase price)", "preis pro einheit ek", "purchase price", "purchase_price", "ek"],
            retailPrice: ["price per unit (retail price)", "preis pro einheit vk", "retail price", "retail_price", "vk"],
            unit: ["unit", "einheit"],
            manufacturer: ["manufacturer", "hersteller"],
            supplier: ["supplier", "lieferant"],
            leadTime: ["leadtime", "lieferzeit", "lead time", "lead_time"],
        };

        // The file may be row-oriented where column A has field labels and remaining columns have data (like the screenshot)
        // OR it may be a standard table with headers in row 1.
        // Detect which format by checking if column A row 1 has "ITEM_EN" or "Product Name"
        const firstCellA = str(data[0]?.[0])?.toLowerCase() || "";

        let mode = "table"; // "table" = standard rows, "transposed" = labels in col A, data in cols after

        if (firstCellA === "item_en" || firstCellA === "headings") {
            // This looks like the screenshot format where col A has labels
            // Check if row 1 (0-indexed) is "Product Name"
            const secondCellA = str(data[1]?.[0])?.toLowerCase() || "";
            if (secondCellA.includes("product name") || secondCellA.includes("artikelbezeichnung")) {
                mode = "transposed";
            }
        }

        const results = { created: 0, updated: 0, errors: [], total: 0 };

        if (mode === "transposed") {
            // ── Transposed format (like the screenshot) ──
            // Column A = field labels, Columns D+ = accessory data (D is the Example/first data column)
            // Row 0 = header row (ITEM_EN, ITEM_DE, unit, Example...)
            // Row 1 = Product Name
            // Row 2 = Product Number
            // Row 3 = Short Text
            // Row 4 = Long Text
            // Row 5 = product group
            // Row 6 = Unit
            // Row 7 = Manufacturer
            // Row 8 = supplier
            // Row 9 = Purchase Price (Euro)
            // Row 10 = Retail Price (Euro)
            // Row 11 = Leadtime (Days)

            // Build a mapping of field name → row index by scanning column A
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

            // Find the data start column (skip label columns A, B, C)
            const dataStartCol = 3;

            // Count accessories by checking how many columns have data in the productName row
            const nameRowIdx = fieldRowMap.productName;
            if (nameRowIdx === undefined) {
                return errorResponse("Could not find 'Product Name' field in the file", 400);
            }

            const nameRow = data[nameRowIdx] || [];
            let numAccessories = 0;
            for (let col = dataStartCol; col < Math.max(nameRow.length, 50); col++) {
                if (nameRow[col] && nameRow[col].toString().trim()) {
                    numAccessories = col - dataStartCol + 1;
                }
            }

            results.total = numAccessories;

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

                    const accessoryData = {
                        productName,
                        productNumber,
                        shortText: str(cell("shortText", a)),
                        longText: str(cell("longText", a)),
                        productGroup,
                        unit: str(cell("unit", a)),
                        manufacturer: str(cell("manufacturer", a)),
                        supplier: str(cell("supplier", a)),
                        purchasePrice: parseDecimal(cell("purchasePrice", a)),
                        retailPrice: parseDecimal(cell("retailPrice", a)),
                        leadTime: str(cell("leadTime", a)),
                        isActive: true,
                        updatedAt: new Date(),
                    };

                    const [existing] = await db
                        .select({ id: accessories.id })
                        .from(accessories)
                        .where(eq(accessories.productNumber, productNumber))
                        .limit(1)
                       

                    if (existing) {
                        const { productNumber: _pn, isActive: _ia, ...updateData } = accessoryData;
                        await db.update(accessories).set(updateData).where(eq(accessories.id, existing.id));
                        results.updated++;
                    } else {
                        await db.insert(accessories).values(accessoryData);
                        results.created++;
                    }
                } catch (accessoryErr) {
                    const aName = str(cell("productName", a)) || `Column ${a + 1}`;
                    results.errors.push(`Accessory "${aName}": ${accessoryErr.message}`);
                }
            }
        } else {
            // ── Standard table format ──
            // Find header row by scanning first few rows for known column names
            for (let r = 0; r < Math.min(data.length, 5); r++) {
                const rowStr = (data[r] || []).map((v) => (v ? v.toString().toLowerCase() : "")).join(" ");
                if (
                    rowStr.includes("product name") ||
                    rowStr.includes("artikelbezeichnung") ||
                    rowStr.includes("product number")
                ) {
                    headerRowIdx = r;
                    break;
                }
            }

            const headers = (data[headerRowIdx] || []).map((h) =>
                h ? h.toString().trim().toLowerCase() : ""
            );

            // Map column indices to fields
            const colMap = {};
            for (let col = 0; col < headers.length; col++) {
                const h = headers[col];
                for (const [field, aliases] of Object.entries(headerMappings)) {
                    if (aliases.some((a) => h.includes(a) || a.includes(h))) {
                        colMap[field] = col;
                        break;
                    }
                }
            }

            if (colMap.productName === undefined && colMap.productNumber === undefined) {
                return errorResponse(
                    "Could not find 'Product Name' or 'Product Number' columns in the header row.",
                    400
                );
            }

            const dataRows = data.slice(headerRowIdx + 1).filter((row) => {
                const nameCol = colMap.productName ?? colMap.productNumber;
                return row[nameCol] && row[nameCol].toString().trim();
            });

            results.total = dataRows.length;

            for (let i = 0; i < dataRows.length; i++) {
                try {
                    const row = dataRows[i];
                    const get = (field) => {
                        const col = colMap[field];
                        if (col === undefined) return null;
                        const val = row[col];
                        if (val === undefined || val === null || val === "") return null;
                        return val;
                    };

                    const productName = str(get("productName"));
                    const productNumber = str(get("productNumber"));

                    if (!productName || !productNumber) {
                        results.errors.push(`Row ${headerRowIdx + 2 + i}: Missing product name or number, skipped.`);
                        continue;
                    }

                    const productGroup = matchProductGroup(get("productGroup"));
                    if (!productGroup) {
                        results.errors.push(
                            `Accessory "${productName}": Invalid or missing product group "${get("productGroup")}". Must be one of: ${PRODUCT_GROUPS.join(", ")}`
                        );
                        continue;
                    }

                    const accessoryData = {
                        productName,
                        productNumber,
                        shortText: str(get("shortText")),
                        longText: str(get("longText")),
                        productGroup,
                        unit: str(get("unit")),
                        manufacturer: str(get("manufacturer")),
                        supplier: str(get("supplier")),
                        purchasePrice: parseDecimal(get("purchasePrice")),
                        retailPrice: parseDecimal(get("retailPrice")),
                        leadTime: str(get("leadTime")),
                        isActive: true,
                        updatedAt: new Date(),
                    };

                    const [existing] = await db
                        .select({ id: accessories.id })
                        .from(accessories)
                        .where(eq(accessories.productNumber, productNumber))
                        .limit(1)

                    if (existing) {
                        const { productNumber: _pn, isActive: _ia, ...updateData } = accessoryData;
                        await db.update(accessories).set(updateData).where(eq(accessories.id, existing.id));
                        results.updated++;
                    } else {
                        await db.insert(accessories).values(accessoryData);
                        results.created++;
                    }
                } catch (accessoryErr) {
                    results.errors.push(`Row ${headerRowIdx + 2 + i}: ${accessoryErr.message}`);
                }
            }
        }

        const parts = [];
        if (results.created > 0) parts.push(`${results.created} created`);
        if (results.updated > 0) parts.push(`${results.updated} updated`);
        const successPart = parts.length > 0 ? parts.join(", ") : "0 accessories processed";
        const message =
            `Import complete: ${successPart} out of ${results.total} accessories.` +
            (results.errors.length > 0 ? ` ${results.errors.length} had errors.` : "");

        return successResponse(message, {
            created: results.created,
            updated: results.updated,
            total: results.total,
            errors: results.errors,
        });
    } catch (err) {
        console.error("Accessory bulk import error:", err);
        return errorResponse(err.message || "Import failed", 500);
    }
}

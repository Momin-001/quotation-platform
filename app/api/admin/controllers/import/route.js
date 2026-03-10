import { db } from "@/lib/db";
import { controllers } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";
import * as XLSX from "xlsx";

// Brand enum values (without "Other" so unrecognised values fall through)
const BRANDS = ["Colorlight", "Novastar", "Brompton", "LINSN"];

function matchBrand(value) {
    if (!value || !value.toString().trim()) return { value: null, other: null };
    const raw = value.toString().trim();
    if (raw.toLowerCase() === "other") return { value: "Other", other: null };
    const exact = BRANDS.find((b) => b.toLowerCase() === raw.toLowerCase());
    if (exact) return { value: exact, other: null };
    return { value: "Other", other: raw };
}

function parseInteger(value) {
    if (value === null || value === undefined || value === "") return null;
    const s = value.toString().trim().replace(/,/g, "");
    const match = s.match(/-?\d+/);
    if (!match) return null;
    const num = parseInt(match[0]);
    return isNaN(num) ? null : num;
}

function str(value) {
    if (value === null || value === undefined) return null;
    const s = value.toString().trim();
    return s || null;
}

function matchYesNo(value) {
    if (!value) return null;
    const v = value.toString().trim().toLowerCase();
    if (v === "yes" || v === "y" || v === "ja" || v === "true" || v === "1") return "Yes";
    if (v === "no" || v === "n" || v === "nein" || v === "false" || v === "0") return "No";
    return null;
}

/**
 * Controller Excel layout (column-oriented):
 *   Column A = Headings, Column B = SPEC_ITEM_EN, Column C = Example
 *   Starting from Column C (index 2), each column is one controller.
 *   Rows are 0-indexed after sheet_to_json with header:1.
 *   Row 0 = header row
 *   Row 1 = Brand Name
 *   Row 2 = Interface Name
 *   ...etc 
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

        // Column-oriented: product data starts at column C (index 2)
        const productStartCol = 2;

        // Determine how many controller columns exist by checking row index 1 (Brand Name row)
        const brandRow = data[1] || [];
        let numControllers = 0;
        for (let col = productStartCol; col < Math.max(brandRow.length, 50); col++) {
            if (brandRow[col] && brandRow[col].toString().trim()) {
                numControllers = col - productStartCol + 1;
            }
        }

        // Also check row 2 (Interface Name) in case brand is empty but interface has value
        const interfaceRow = data[2] || [];
        for (let col = productStartCol; col < Math.max(interfaceRow.length, 50); col++) {
            if (interfaceRow[col] && interfaceRow[col].toString().trim()) {
                const count = col - productStartCol + 1;
                if (count > numControllers) numControllers = count;
            }
        }

        if (numControllers === 0) {
            return errorResponse(
                "No controller data found. Data should start from column C.",
                400
            );
        }

        function cell(rowIdx, controllerCol) {
            const row = data[rowIdx];
            if (!row) return null;
            const val = row[productStartCol + controllerCol];
            if (val === undefined || val === null || val === "") return null;
            return val;
        }

        const results = { created: 0, updated: 0, errors: [], total: numControllers };

        for (let c = 0; c < numControllers; c++) {
            try {
                const interfaceName = str(cell(1, c));
                const controllerNumber = str(cell(2, c));
                const brandResult = matchBrand(cell(3, c));
                
                if (!interfaceName || !controllerNumber) {
                    results.errors.push(`Column ${c + 1}: Missing interface name or controller number, skipped.`);
                    continue;
                }
                
                const controllerData = {
                    interfaceName,
                    brandName: brandResult.value,
                    brandNameOther: brandResult.other,

                    // Capacity
                    controllerNumber,
                    pixelCapacity: parseInteger(cell(4, c)),
                    maxWidthHeight: parseInteger(cell(5, c)),

                    // Input Ports
                    dp12: parseInteger(cell(6, c)) ?? 0,
                    hdmi20: parseInteger(cell(7, c)) ?? 0,
                    hdmi13: parseInteger(cell(8, c)) ?? 0,
                    dviSingleLink: parseInteger(cell(9, c)) ?? 0,
                    sdi12g: parseInteger(cell(10, c)) ?? 0,
                    sdi3g: parseInteger(cell(11, c)) ?? 0,
                    opticalFiberIn10g: parseInteger(cell(12, c)) ?? 0,
                    usb30MediaPlayback: parseInteger(cell(13, c)) ?? 0,

                    // Output Ports
                    gigabitEthernetRj45: parseInteger(cell(14, c)) ?? 0,
                    opticalFiberOut10g: parseInteger(cell(15, c)) ?? 0,
                    output5g: matchYesNo(cell(16, c)),

                    // Monitoring
                    hdmi13Monitoring: parseInteger(cell(17, c)) ?? 0,
                    connector3dMiniDin4: parseInteger(cell(18, c)) ?? 0,

                    // Loop
                    hdmi20Loop: parseInteger(cell(19, c)) ?? 0,
                    sdi12gLoop: parseInteger(cell(20, c)) ?? 0,
                    sdi3gLoop: parseInteger(cell(21, c)) ?? 0,
                    dviLoop: parseInteger(cell(22, c)) ?? 0,

                    // Audio & Control
                    audioInput35mm: parseInteger(cell(23, c)) ?? 0,
                    audioOutput35mm: parseInteger(cell(24, c)) ?? 0,
                    ethernetControlPort: parseInteger(cell(25, c)) ?? 0,
                    usbTypeBPcControl: parseInteger(cell(26, c)) ?? 0,
                    usbTypeACascading: parseInteger(cell(27, c)) ?? 0,
                    genlockInLoop: parseInteger(cell(28, c)) ?? 0,
                    rs232: parseInteger(cell(29, c)) ?? 0,

                    // Features
                    maximumLayers: str(cell(30, c)),
                    layerScaling: matchYesNo(cell(31, c)),
                    hdrSupport: str(cell(32, c)),
                    colorDepthBit: parseInteger(cell(33, c)),
                    lowLatency: matchYesNo(cell(34, c)),
                    fibreConverterMode: matchYesNo(cell(35, c)),
                    vCanSupport: matchYesNo(cell(36, c)),
                    backupMode: str(cell(37, c)),
                    genlockSync: matchYesNo(cell(38, c)),
                    multiViewerMvr: matchYesNo(cell(39, c)),
                    usbPlayback: matchYesNo(cell(40, c)),
                    support3d: matchYesNo(cell(41, c)),
                    downloadUrl: str(cell(42, c)),
                    pricePerControllerUsd: parseFloat(cell(43, c)) ?? 0,
                    stockPieces: parseInteger(cell(44, c)) ?? 0,
                    leadtimeDays: parseInteger(cell(45, c)) ?? 0,

                    // Excel-imported controllers are inactive until they have images
                    isActive: false,
                    updatedAt: new Date(),
                };

                // Upsert by interfaceName
                const [existing] = await db
                    .select({ id: controllers.id })
                    .from(controllers)
                    .where(eq(controllers.controllerNumber, controllerNumber))
                    .limit(1)
                    

                if (existing) {
                    const { isActive: _ia, ...updateData } = controllerData;
                    await db.update(controllers).set(updateData).where(eq(controllers.id, existing.id));
                    results.updated++;
                } else {
                    await db.insert(controllers).values(controllerData);
                    results.created++;
                }
            } catch (controllerErr) {
                const cName = str(cell(2, c)) || `Column ${c + 1}`;
                results.errors.push(`Controller "${cName}": ${controllerErr.message}`);
            }
        }

        const parts = [];
        if (results.created > 0) parts.push(`${results.created} created`);
        if (results.updated > 0) parts.push(`${results.updated} updated`);
        const successPart = parts.length > 0 ? parts.join(", ") : "0 controllers processed";
        const message =
            `Import complete: ${successPart} out of ${results.total} controllers.` +
            (results.errors.length > 0 ? ` ${results.errors.length} had errors.` : "");

        return successResponse(message, {
            created: results.created,
            updated: results.updated,
            total: results.total,
            errors: results.errors,
        });
    } catch (err) {
        console.error("Controller bulk import error:", err);
        return errorResponse(err.message || "Import failed", 500);
    }
}

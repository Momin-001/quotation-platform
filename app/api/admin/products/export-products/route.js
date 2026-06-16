import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { db } from "@/lib/db";
import { products, categories } from "@/db/schema";
import { errorResponse } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/helpers/auth-helpers";
import { desc, eq } from "drizzle-orm";

function fmtScanRate(numerator, denominator) {
    if (!denominator) return "";
    const num = numerator ?? 1;
    return num === 1 ? `1/${denominator}` : `${num}/${denominator}`;
}

function fmtContrastRatio(numerator, denominator) {
    if (!numerator) return "";
    return `${numerator}:${denominator ?? 1}`;
}

function formatExportRow(p) {
    return {
        "ID": p.id ?? "",
        "Slug": p.slug ?? "",
        "Product Name": p.productName ?? "",
        "Product Number": p.productNumber ?? "",
        "Product Description": p.productDescription ?? "",
        "OEM Brand": p.oemBrand ?? "",
        "Category": p.categoryName ?? "",
        "Product Type": p.productType ?? "",
        "Design": p.design ?? "",
        "Special Types": p.specialTypes ?? "",
        "Special Types Other": p.specialTypesOther ?? "",
        "Application": Array.isArray(p.application) ? p.application.join(", ") : (p.application ?? ""),
        "Pixel Pitch": p.pixelPitch ?? "",
        "Pixel Configuration": p.pixelConfiguration ?? "",
        "Pixel Technology": p.pixelTechnology ?? "",
        "Cabinet Width (mm)": p.cabinetWidth ?? "",
        "Cabinet Height (mm)": p.cabinetHeight ?? "",
        "Cabinet Resolution Horizontal": p.cabinetResolutionHorizontal ?? "",
        "Cabinet Resolution Vertical": p.cabinetResolutionVertical ?? "",
        "LED Modules Per Cabinet": p.ledModulesPerCabinet ?? "",
        "Pixel Density": p.pixelDensity ?? "",
        "Weight Without Packaging (kg)": p.weightWithoutPackaging ?? "",
        "LED Technology": p.ledTechnology ?? "",
        "LED Technology Other": p.ledTechnologyOther ?? "",
        "LED Chip Manufacturer": p.ledChipManufacturer ?? "",
        "Chip Bonding": p.chipBonding ?? "",
        "LED Lifespan (hours)": p.ledLifespan ?? "",
        "Brightness Value": p.brightnessValue ?? "",
        "Contrast Ratio": fmtContrastRatio(p.contrastRatioNumerator, p.contrastRatioDenominator),
        "Viewing Angle Horizontal": p.viewingAngleHorizontal ?? "",
        "Viewing Angle Vertical": p.viewingAngleVertical ?? "",
        "Colour Depth (bit)": p.colourDepth ?? "",
        "Greyscale Processing": p.greyscaleProcessing ?? "",
        "Greyscale Processing Other": p.greyscaleProcessingOther ?? "",
        "Number of Colours": p.numberOfColours ?? "",
        "Brightness Control": p.brightnessControl ?? "",
        "LED Driver": p.ledDriver ?? "",
        "Current Gain Control": p.currentGainControl ?? "",
        "Video Rate": p.videoRate ?? "",
        "White Point Calibration": p.whitePointCalibration ?? "",
        "Calibration Method": p.calibrationMethod ?? "",
        "Calibration Method Other": p.calibrationMethodOther ?? "",
        "DCI-P3 Coverage": p.dciP3Coverage ?? "",
        "Input Voltage": p.inputVoltage ?? "",
        "Power Consumption Max (W)": p.powerConsumptionMax ?? "",
        "Power Consumption Typical (W)": p.powerConsumptionTypical ?? "",
        "Refresh Rate (Hz)": p.refreshRate ?? "",
        "Scan Rate": fmtScanRate(p.scanRateNumerator, p.scanRateDenominator),
        "Driving Method": p.drivingMethod ?? "",
        "Power Supply": p.powerSupply ?? "",
        "MTBF Power Supply (hours)": p.mtbfPowerSupply ?? "",
        "Power Redundancy": p.powerRedundancy ?? "",
        "Memory on Module": p.memoryOnModule ?? "",
        "Smart Module": p.smartModule ?? "",
        "Control System": p.controlSystem ?? "",
        "Control System Other": p.controlSystemOther ?? "",
        "Receiving Card": p.receivingCard ?? "",
        "Operating Temperature": p.operatingTemperature ?? "",
        "Operating Humidity": p.operatingHumidity ?? "",
        "Cooling": p.cooling ?? "",
        "Heat Dissipation": p.heatDissipation ?? "",
        "IP Rating": p.ipRating ?? "",
        "Monitoring Function (EN)": p.monitoringFunctionEn ?? "",
        "Additional Certification": p.additionalCertification ?? "",
        "EMC": p.emc ?? "",
        "Safety": p.safety ?? "",
        "Support": p.support ?? "",
        "Warranty Period (months)": p.warrantyPeriod ?? "",
        "Support During Warranty (EN)": p.supportDuringWarrantyEn ?? "",
        "Support After Warranty (EN)": p.supportAfterWarrantyEn ?? "",
        "Price Per Cabinet (USD)": p.pricePerCabinetUsd ?? "",
        "Price Per Metre Square (USD)": p.pricePerMetreSquareUsd ?? "",
        "Profit Margin (%)": p.profitMargin ?? "",
        "Stock Pieces": p.stockPieces ?? "",
        "Leadtime (Days)": p.leadtimeDays ?? "",
        "Notes": p.notes ?? "",
        "Created At": p.createdAt ? new Date(p.createdAt).toISOString() : "",
        "Last Updated": p.updatedAt ? new Date(p.updatedAt).toISOString() : "",
    };
}

export async function GET() {
    try {
        const { user, error } = await getCurrentUser();
        if (error || !user) return errorResponse(error || "Unauthorized", 401);
        if (user.role !== "admin" && user.role !== "super_admin") return errorResponse("Forbidden", 403);

        const allProducts = await db
            .select({
                id: products.id,
                slug: products.slug,
                productName: products.productName,
                productNumber: products.productNumber,
                productDescription: products.productDescription,
                oemBrand: products.oemBrand,
                categoryName: categories.name,
                productType: products.productType,
                design: products.design,
                specialTypes: products.specialTypes,
                specialTypesOther: products.specialTypesOther,
                application: products.application,
                pixelPitch: products.pixelPitch,
                pixelConfiguration: products.pixelConfiguration,
                pixelTechnology: products.pixelTechnology,
                cabinetWidth: products.cabinetWidth,
                cabinetHeight: products.cabinetHeight,
                cabinetResolutionHorizontal: products.cabinetResolutionHorizontal,
                cabinetResolutionVertical: products.cabinetResolutionVertical,
                ledModulesPerCabinet: products.ledModulesPerCabinet,
                pixelDensity: products.pixelDensity,
                weightWithoutPackaging: products.weightWithoutPackaging,
                ledTechnology: products.ledTechnology,
                ledTechnologyOther: products.ledTechnologyOther,
                ledChipManufacturer: products.ledChipManufacturer,
                chipBonding: products.chipBonding,
                ledLifespan: products.ledLifespan,
                brightnessValue: products.brightnessValue,
                contrastRatioNumerator: products.contrastRatioNumerator,
                contrastRatioDenominator: products.contrastRatioDenominator,
                viewingAngleHorizontal: products.viewingAngleHorizontal,
                viewingAngleVertical: products.viewingAngleVertical,
                colourDepth: products.colourDepth,
                greyscaleProcessing: products.greyscaleProcessing,
                greyscaleProcessingOther: products.greyscaleProcessingOther,
                numberOfColours: products.numberOfColours,
                brightnessControl: products.brightnessControl,
                ledDriver: products.ledDriver,
                currentGainControl: products.currentGainControl,
                videoRate: products.videoRate,
                whitePointCalibration: products.whitePointCalibration,
                calibrationMethod: products.calibrationMethod,
                calibrationMethodOther: products.calibrationMethodOther,
                dciP3Coverage: products.dciP3Coverage,
                inputVoltage: products.inputVoltage,
                powerConsumptionMax: products.powerConsumptionMax,
                powerConsumptionTypical: products.powerConsumptionTypical,
                refreshRate: products.refreshRate,
                scanRateNumerator: products.scanRateNumerator,
                scanRateDenominator: products.scanRateDenominator,
                drivingMethod: products.drivingMethod,
                powerSupply: products.powerSupply,
                mtbfPowerSupply: products.mtbfPowerSupply,
                powerRedundancy: products.powerRedundancy,
                memoryOnModule: products.memoryOnModule,
                smartModule: products.smartModule,
                controlSystem: products.controlSystem,
                controlSystemOther: products.controlSystemOther,
                receivingCard: products.receivingCard,
                operatingTemperature: products.operatingTemperature,
                operatingHumidity: products.operatingHumidity,
                cooling: products.cooling,
                heatDissipation: products.heatDissipation,
                ipRating: products.ipRating,
                monitoringFunctionEn: products.monitoringFunctionEn,
                additionalCertification: products.additionalCertification,
                emc: products.emc,
                safety: products.safety,
                support: products.support,
                warrantyPeriod: products.warrantyPeriod,
                supportDuringWarrantyEn: products.supportDuringWarrantyEn,
                supportAfterWarrantyEn: products.supportAfterWarrantyEn,
                pricePerCabinetUsd: products.pricePerCabinetUsd,
                pricePerMetreSquareUsd: products.pricePerMetreSquareUsd,
                profitMargin: products.profitMargin,
                stockPieces: products.stockPieces,
                leadtimeDays: products.leadtimeDays,
                notes: products.notes,
                createdAt: products.createdAt,
                updatedAt: products.updatedAt,
            })
            .from(products)
            .leftJoin(categories, eq(products.areaOfUseId, categories.id))
            .orderBy(desc(products.createdAt));

        const rows = allProducts.map(formatExportRow);
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

        const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
        const filename = `products-${new Date().toISOString().slice(0, 10)}.xlsx`;

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });
    } catch (err) {
        console.error("GET /api/admin/products/export-products error:", err);
        return errorResponse("Failed to export products", 500);
    }
}

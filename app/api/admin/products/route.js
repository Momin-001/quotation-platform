import { db } from "@/lib/db";
import { products, productImages, productCertificates, productFeatures, certificates } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { desc, eq } from "drizzle-orm";
import cloudinary from "@/lib/cloudinary";

// GET /api/admin/products - Fetch all products
export async function GET() {
    try {
        const allProducts = await db
            .select({
                id: products.id,
                productName: products.productName,
                productNumber: products.productNumber,
                productType: products.productType,
                pixelPitch: products.pixelPitch,
                brightnessValue: products.brightnessValue,
                areaOfUseId: products.areaOfUseId,
                isActive: products.isActive,
                createdAt: products.createdAt,
                updatedAt: products.updatedAt,
            })
            .from(products)
            .orderBy(desc(products.createdAt));

        return successResponse("Products fetched successfully", allProducts);
    } catch (error) {
        return errorResponse(error.message || "Failed to fetch products");
    }
}

// POST /api/admin/products - Create a new product
export async function POST(request) {
    try {
        const formData = await request.formData();
        const fieldsJson = formData.get("fields");
        const body = JSON.parse(fieldsJson);
        
        // Extract all product fields
        const productData = {
            // String fields
            productName: body.productName?.toString().trim() || "",
            productNumber: body.productNumber?.toString().trim() || "",
            viewingAngleHorizontal: body.viewingAngleHorizontal?.toString().trim() || null,
            viewingAngleVertical: body.viewingAngleVertical?.toString().trim() || null,
            brightnessControl: body.brightnessControl?.toString().trim() || null,
            dciP3Coverage: body.dciP3Coverage?.toString().trim() || null,
            operatingTemperature: body.operatingTemperature?.toString().trim() || null,
            operatingHumidity: body.operatingHumidity?.toString().trim() || null,
            ipRating: body.ipRating?.toString().trim() || null,
            ledModulesPerCabinet: body.ledModulesPerCabinet?.toString().trim() || null,
            ledChipManufacturer: body.ledChipManufacturer?.toString().trim() || null,
            whitePointCalibration: body.whitePointCalibration?.toString().trim() || null,
            brightnessValue: body.brightnessValue?.toString().trim() || null,
            inputVoltage: body.inputVoltage?.toString().trim() || null,
            receivingCard: body.receivingCard?.toString().trim() || null,
            heatDissipation: body.heatDissipation?.toString().trim() || null,
            monitoringFunctionEn: body.monitoringFunctionEn?.toString().trim() || null,
            monitoringFunctionDe: body.monitoringFunctionDe?.toString().trim() || null,
            additionalCertification: body.additionalCertification?.toString().trim() || null,
            emc: body.emc?.toString().trim() || null,
            safety: body.safety?.toString().trim() || null,
            supportDuringWarrantyEn: body.supportDuringWarrantyEn?.toString().trim() || null,
            supportDuringWarrantyDe: body.supportDuringWarrantyDe?.toString().trim() || null,
            supportAfterWarrantyEn: body.supportAfterWarrantyEn?.toString().trim() || null,
            supportAfterWarrantyDe: body.supportAfterWarrantyDe?.toString().trim() || null,
            
            // ENUM fields
            productType: body.productType?.toString() || "",
            design: body.design?.toString() || "",
            specialTypes: body.specialTypes?.toString() || "",
            specialTypesOther: body.specialTypesOther?.toString().trim() || null,
            application: body.application?.toString() || "",
            pixelConfiguration: body.pixelConfiguration?.toString() || "",
            pixelTechnology: body.pixelTechnology?.toString() || "",
            ledTechnology: body.ledTechnology?.toString() || "",
            ledTechnologyOther: body.ledTechnologyOther?.toString().trim() || null,
            chipBonding: body.chipBonding?.toString() || "",
            colourDepth: body.colourDepth?.toString() || "",
            currentGainControl: body.currentGainControl?.toString() || "",
            videoRate: body.videoRate?.toString() || "",
            calibrationMethod: body.calibrationMethod?.toString() || "",
            calibrationMethodOther: body.calibrationMethodOther?.toString().trim() || null,
            drivingMethod: body.drivingMethod?.toString() || "",
            controlSystem: body.controlSystem?.toString() || "",
            controlSystemOther: body.controlSystemOther?.toString().trim() || null,
            cooling: body.cooling?.toString() || "",
            powerRedundancy: body.powerRedundancy?.toString() || "",
            memoryOnModule: body.memoryOnModule?.toString() || "",
            smartModule: body.smartModule?.toString() || "",
            support: body.support?.toString() || null,
            
            // Foreign Key
            areaOfUseId: body.areaOfUseId?.toString() || null,
            
            // Decimal fields
            pixelPitch: body.pixelPitch?.toString() || "",
            cabinetWidth: body.cabinetWidth?.toString() || null,
            cabinetHeight: body.cabinetHeight?.toString() || null,
            weightWithoutPackaging: body.weightWithoutPackaging?.toString() || null,
            
            // Integer fields
            refreshRate: body.refreshRate ? parseInt(body.refreshRate) : null,
            scanRateDenominator: body.scanRateDenominator ? parseInt(body.scanRateDenominator) : null,
            contrastRatioNumerator: body.contrastRatioNumerator ? parseInt(body.contrastRatioNumerator) : null,
            cabinetResolutionHorizontal: body.cabinetResolutionHorizontal ? parseInt(body.cabinetResolutionHorizontal) : null,
            cabinetResolutionVertical: body.cabinetResolutionVertical ? parseInt(body.cabinetResolutionVertical) : null,
            pixelDensity: body.pixelDensity ? parseInt(body.pixelDensity) : null,
            ledLifespan: body.ledLifespan ? parseInt(body.ledLifespan) : null,
            greyscaleProcessing: body.greyscaleProcessing?.toString() || "",
            greyscaleProcessingOther: body.greyscaleProcessingOther?.toString().trim() || null,
            numberOfColours: body.numberOfColours ? parseInt(body.numberOfColours) : null,
            mtbfPowerSupply: body.mtbfPowerSupply ? parseInt(body.mtbfPowerSupply) : null,
            powerConsumptionMax: body.powerConsumptionMax ? parseInt(body.powerConsumptionMax) : null,
            powerConsumptionTypical: body.powerConsumptionTypical ? parseInt(body.powerConsumptionTypical) : null,
            warrantyPeriod: body.warrantyPeriod ? parseInt(body.warrantyPeriod) : null,
            
            // Products added via form are active by default (admin adds images manually)
            isActive: true,
        };

        // Validate required fields
        if (!productData.productName || !productData.productNumber) {
            return errorResponse("Product name and product number are required", 400);
        }

        // Create product
        const newProduct = await db
            .insert(products)
            .values(productData)
            .returning();

        const productId = newProduct[0].id;

        // Handle product images via FormData
        const imageFiles = formData.getAll("images");
        if (imageFiles && imageFiles.length > 0) {
            const imageUploadPromises = imageFiles.map(async (file, index) => {
                if (file && file.size > 0) {
                    const bytes = await file.arrayBuffer();
                    const buffer = Buffer.from(bytes);
                    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;

                    const uploadResult = await cloudinary.uploader.upload(base64Image, {
                        folder: "products/images",
                        resource_type: "image",
                    });

                    return db.insert(productImages).values({
                        productId,
                        imageUrl: uploadResult.secure_url,
                        imageOrder: index,
                    });
                }
            });

            await Promise.all(imageUploadPromises.filter(Boolean));
        } else {
            // No images uploaded from form — set isActive to false
            await db.update(products).set({ isActive: false }).where(eq(products.id, productId));
        }

        // Handle product certificates (selected from existing certificates)
        const selectedCertificates = body.productCertificates;
        if (selectedCertificates && selectedCertificates.length > 0) {
            const certificateIds = selectedCertificates.filter(id => id && id !== "");
            if (certificateIds.length > 0) {
                const certificatePromises = certificateIds.map(certificateId => 
                    db.insert(productCertificates).values({
                        productId,
                        certificateId: certificateId.toString(),
                    })
                );
                await Promise.all(certificatePromises);
            }
        }

        // Handle product features
        const features = body.features;
        if (features && Array.isArray(features) && features.length > 0) {
            const featurePromises = features
                .filter(feature => feature && feature.trim() !== "")
                .map(feature => 
                    db.insert(productFeatures).values({
                        productId,
                        feature: feature.trim(),
                    })
                );
            await Promise.all(featurePromises);
        }

        return successResponse("Product created successfully", newProduct[0]);
    } catch (error) {
        return errorResponse(error.message || "Failed to create product");
    }
}

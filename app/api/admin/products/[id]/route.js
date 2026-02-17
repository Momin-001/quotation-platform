import { db } from "@/lib/db";
import { products, productImages, productCertificates, productFeatures, certificates } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";
import cloudinary from "@/lib/cloudinary";

// GET /api/admin/products/[id] - Fetch a single product with all details
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        // Get product
        const product = await db
            .select()
            .from(products)
            .where(eq(products.id, id))
            .limit(1)
            .then((r) => r[0]);

        if (!product) {
            return errorResponse("Product not found", 404);
        }

        // Get product images
        const images = await db
            .select({
                id: productImages.id,
                imageUrl: productImages.imageUrl,
                imageOrder: productImages.imageOrder,
            })
            .from(productImages)
            .where(eq(productImages.productId, id))
            .orderBy(productImages.imageOrder);

        // Get product features
        const features = await db
            .select({
                id: productFeatures.id,
                feature: productFeatures.feature,
            })
            .from(productFeatures)
            .where(eq(productFeatures.productId, id));

        // Get product certificates
        const productCerts = await db
            .select({
                id: certificates.id,
                name: certificates.name,
                imageUrl: certificates.imageUrl,
            })
            .from(productCertificates)
            .innerJoin(certificates, eq(productCertificates.certificateId, certificates.id))
            .where(eq(productCertificates.productId, id));

        return successResponse("Product fetched successfully", {
            ...product,
            images,
            features,
            certificates: productCerts,
        });
    } catch (error) {
        return errorResponse(error.message || "Failed to fetch product");
    }
}

// PUT /api/admin/products/[id] - Update a product
export async function PUT(request, { params }) {
    try {
        const { id } = await params;

        // Check if product exists
        const existing = await db
            .select({ id: products.id })
            .from(products)
            .where(eq(products.id, id))
            .limit(1)
            .then((r) => r[0]);

        if (!existing) {
            return errorResponse("Product not found", 404);
        }

        const formData = await request.formData();
        const fieldsJson = formData.get("fields");
        const body = JSON.parse(fieldsJson);

        // Build product update data
        const productData = {
            productName: body.productName?.toString().trim() || "",
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
            
            areaOfUseId: body.areaOfUseId?.toString() || null,
            
            pixelPitch: body.pixelPitch?.toString() || "",
            cabinetWidth: body.cabinetWidth?.toString() || null,
            cabinetHeight: body.cabinetHeight?.toString() || null,
            weightWithoutPackaging: body.weightWithoutPackaging?.toString() || null,
            
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
            
            updatedAt: new Date(),
        };

        // Update product fields
        await db.update(products).set(productData).where(eq(products.id, id));

        // Handle removed images
        const removedImageIds = body.removedImageIds || [];
        if (removedImageIds.length > 0) {
            for (const imageId of removedImageIds) {
                // Get image URL before deleting to remove from Cloudinary
                const img = await db
                    .select({ imageUrl: productImages.imageUrl })
                    .from(productImages)
                    .where(eq(productImages.id, imageId))
                    .limit(1)
                    .then((r) => r[0]);
                
                if (img?.imageUrl) {
                    try {
                        // Extract public_id from Cloudinary URL
                        const urlParts = img.imageUrl.split("/");
                        const fileName = urlParts[urlParts.length - 1].split(".")[0];
                        const folder = urlParts[urlParts.length - 2];
                        await cloudinary.uploader.destroy(`${folder}/${fileName}`);
                    } catch (e) {
                        // Non-critical: continue even if Cloudinary cleanup fails
                        console.error("Cloudinary cleanup failed:", e.message);
                    }
                }
                
                await db.delete(productImages).where(eq(productImages.id, imageId));
            }
        }

        // Handle new image uploads
        const imageFiles = formData.getAll("images");
        if (imageFiles && imageFiles.length > 0) {
            // Get current max image order
            const maxOrder = await db
                .select({ imageOrder: productImages.imageOrder })
                .from(productImages)
                .where(eq(productImages.productId, id))
                .orderBy(productImages.imageOrder)
                .then((rows) => rows.length > 0 ? Math.max(...rows.map(r => r.imageOrder)) + 1 : 0);

            const imageUploadPromises = imageFiles.map(async (file, index) => {
                if (file && file.size > 0) {
                    const bytes = await file.arrayBuffer();
                    const buffer = Buffer.from(bytes);
                    const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;

                    const uploadResult = await cloudinary.uploader.upload(base64Image, {
                        folder: "products/images",
                        resource_type: "image",
                    });

                    return db.insert(productImages).values({
                        productId: id,
                        imageUrl: uploadResult.secure_url,
                        imageOrder: maxOrder + index,
                    });
                }
            });

            await Promise.all(imageUploadPromises.filter(Boolean));
        }

        // Handle certificates - replace all
        await db.delete(productCertificates).where(eq(productCertificates.productId, id));
        const selectedCertificates = body.productCertificates || [];
        if (selectedCertificates.length > 0) {
            const certificateIds = selectedCertificates.filter((cid) => cid && cid !== "");
            if (certificateIds.length > 0) {
                const certificatePromises = certificateIds.map((certificateId) =>
                    db.insert(productCertificates).values({
                        productId: id,
                        certificateId: certificateId.toString(),
                    })
                );
                await Promise.all(certificatePromises);
            }
        }

        // Handle features - replace all
        await db.delete(productFeatures).where(eq(productFeatures.productId, id));
        const features = body.features || [];
        if (features.length > 0) {
            const featurePromises = features
                .filter((feature) => feature && feature.trim() !== "")
                .map((feature) =>
                    db.insert(productFeatures).values({
                        productId: id,
                        feature: feature.trim(),
                    })
                );
            await Promise.all(featurePromises);
        }

        return successResponse("Product updated successfully");
    } catch (error) {
        return errorResponse(error.message || "Failed to update product");
    }
}

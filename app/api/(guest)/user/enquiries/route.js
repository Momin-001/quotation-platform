import { db } from "@/lib/db";
import { enquiries, enquiryItems, enquiryFiles } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/helpers/auth-helpers";
import cloudinary from "@/lib/cloudinary";

// Shared endpoint for both cart and LEDitor enquiries.
// Cart sends JSON ({ message, items }); LEDitor sends multipart/form-data
// with a "payload" JSON part (items carry isCustom + custom_* fields) plus
// optional file attachments. Per-item `isCustom` distinguishes the two flows.
export async function POST(req) {
    try {
        const { user, error } = await getCurrentUser();
        if (error) {
            return errorResponse(error, 401);
        }

        const contentType = req.headers.get("content-type") || "";
        let message, projectName, items, files = [];

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            const payloadStr = formData.get("payload");
            if (!payloadStr) {
                return errorResponse("Missing payload", 400);
            }
            const payload = JSON.parse(payloadStr);
            message = payload.message;
            projectName = payload.projectName;
            items = payload.items;
            files = formData.getAll("files") || [];
        } else {
            const body = await req.json();
            message = body.message;
            projectName = body.projectName;
            items = body.items;
        }

        const trimmedProjectName =
            typeof projectName === "string" && projectName.trim() ? projectName.trim() : null;

        if (!message || !items || !Array.isArray(items) || items.length === 0) {
            return errorResponse("Message and at least one product item are required", 400);
        }

        // Create enquiry
        const [enquiry] = await db
            .insert(enquiries)
            .values({
                userId: user.id,
                message: message.trim(),
                projectName: trimmedProjectName,
                status: "pending",
            })
            .returning();

        // Create enquiry items
        const itemsToInsert = items.map((item, index) => ({
            enquiryId: enquiry.id,
            productSourceType: item.productSourceType || "product",
            productId: item.productSourceType === "refurbished" ? null : (item.productId ?? null),
            refurbishedProductId:
                item.productSourceType === "refurbished" ? (item.refurbishedProductId ?? item.productId ?? null) : null,
            quantity: item.quantity || 1,
            itemType: item.itemType || (index === 0 ? "main" : "alternative"),
            itemOrder: index,
            controllerId: item.controllerId || item.additionalController?.id || null,
            isCustom: item.isCustom || false,
            ...(item.isCustom && {
                customTotalResolutionH: item.customTotalResolutionH || null,
                customTotalResolutionV: item.customTotalResolutionV || null,
                customWeight: item.customWeight || null,
                customDisplayArea: item.customDisplayArea || null,
                customScreenWidth: item.customScreenWidth || null,
                customScreenHeight: item.customScreenHeight || null,
                customPowerConsumptionMax: item.customPowerConsumptionMax || null,
                customPowerConsumptionTyp: item.customPowerConsumptionTyp || null,
                customTotalCabinets: item.customTotalCabinets || null,
                customServiceAccess: item.customServiceAccess || null,
                customMountingMethod: item.customMountingMethod || null,
                customOperatingHours: item.customOperatingHours || null,
                customPowerRedundancy: item.customPowerRedundancy || null,
                customIpRating: item.customIpRating || null,
                customInstallationAndService: item.customInstallationAndService || null,
                customStructuralWidth: item.customStructuralWidth || null,
                customStructuralHeight: item.customStructuralHeight || null,
                customStructuralDepth: item.customStructuralDepth || null,
                customViewingDistanceMin: item.customViewingDistanceMin || null,
                customViewingDistanceMax: item.customViewingDistanceMax || null,
                customControllerConfig: item.customControllerConfig || null,
                customNetworkConnection: item.customNetworkConnection || null,
                customSignalSourceInputs: item.customSignalSourceInputs || null,
                customAdditionalServices: item.customAdditionalServices || null,
            }),
        }));

        await db.insert(enquiryItems).values(itemsToInsert).returning();

        // Upload files to Cloudinary and save references
        if (files.length > 0) {
            for (const file of files) {
                if (!file || !file.size) continue;
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

                const uploadResult = await cloudinary.uploader.upload(base64, {
                    folder: "QuotationPlatform/enquiry-files",
                    resource_type: "raw",
                });

                await db.insert(enquiryFiles).values({
                    enquiryId: enquiry.id,
                    fileUrl: uploadResult.secure_url,
                    publicId: uploadResult.public_id,
                    fileName: file.name || "file",
                });
            }
        }

        return successResponse(
            "Enquiry submitted successfully",
            { enquiryId: enquiry.id }
        );
    } catch (error) {
        console.error("POST /api/user/enquiries error:", error);
        return errorResponse("Failed to create enquiry", 500);
    }
}


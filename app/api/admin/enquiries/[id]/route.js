import { db } from "@/lib/db";
import { enquiries, enquiryItems, enquiryItemAccessories, enquiryFiles, users, products, productImages, quotations, controllers, accessories } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq, desc, asc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-helpers";

// Format enquiry ID: Enquiry #YYYY-XXXX (last 4 chars of UUID)
function formatEnquiryId(enquiryId, createdAt) {
    const year = new Date(createdAt).getFullYear();
    const number = enquiryId.slice(-4).toUpperCase();
    return `Enquiry #${year}-${number}`;
}

export async function GET(req, { params }) {
    try {
        // Verify admin access
        const { user, error } = await getCurrentUser();
        if (error || !user) {
            return errorResponse("Unauthorized", 401);
        }
        if (user.role !== "admin" && user.role !== "super_admin") {
            return errorResponse("Forbidden: Admin access required", 403);
        }

        const { id } = await params;

        if (!id) {
            return errorResponse("Enquiry ID is required", 400);
        }

        // Fetch enquiry with user info
        const enquiry = await db
            .select({
                id: enquiries.id,
                userId: enquiries.userId,
                message: enquiries.message,
                status: enquiries.status,
                createdAt: enquiries.createdAt,
                updatedAt: enquiries.updatedAt,
                customerName: users.fullName,
                customerEmail: users.email,
                customerCompany: users.companyName,
                customerPhone: users.phoneNumber,
            })
            .from(enquiries)
            .innerJoin(users, eq(enquiries.userId, users.id))
            .where(eq(enquiries.id, id))
            .limit(1)
            .then((res) => res[0]);

        if (!enquiry) {
            return errorResponse("Enquiry not found", 404);
        }

        // Fetch enquiry items with product and controller details
        const itemsData = await db
            .select({
                id: enquiryItems.id,
                productId: enquiryItems.productId,
                quantity: enquiryItems.quantity,
                itemType: enquiryItems.itemType,
                itemOrder: enquiryItems.itemOrder,
                controllerId: enquiryItems.controllerId,
                isCustom: enquiryItems.isCustom,
                customLedTechnology: enquiryItems.customLedTechnology,
                customBrightnessValue: enquiryItems.customBrightnessValue,
                customPixelPitch: enquiryItems.customPixelPitch,
                customRefreshRate: enquiryItems.customRefreshRate,
                customResolutionHorizontal: enquiryItems.customResolutionHorizontal,
                customResolutionVertical: enquiryItems.customResolutionVertical,
                customCabinetWidth: enquiryItems.customCabinetWidth,
                customCabinetHeight: enquiryItems.customCabinetHeight,
                customScreenWidth: enquiryItems.customScreenWidth,
                customScreenHeight: enquiryItems.customScreenHeight,
                customTotalResolutionH: enquiryItems.customTotalResolutionH,
                customTotalResolutionV: enquiryItems.customTotalResolutionV,
                customWeight: enquiryItems.customWeight,
                customDisplayArea: enquiryItems.customDisplayArea,
                customDimension: enquiryItems.customDimension,
                customPowerConsumptionMax: enquiryItems.customPowerConsumptionMax,
                customPowerConsumptionTyp: enquiryItems.customPowerConsumptionTyp,
                customTotalCabinets: enquiryItems.customTotalCabinets,
                customServiceAccess: enquiryItems.customServiceAccess,
                customMountingMethod: enquiryItems.customMountingMethod,
                customOperatingHours: enquiryItems.customOperatingHours,
                customPowerRedundancy: enquiryItems.customPowerRedundancy,
                customIpRating: enquiryItems.customIpRating,
                productName: products.productName,
                productNumber: products.productNumber,
                pixelPitch: products.pixelPitch,
                cabinetResolutionHorizontal: products.cabinetResolutionHorizontal,
                cabinetResolutionVertical: products.cabinetResolutionVertical,
            })
            .from(enquiryItems)
            .innerJoin(products, eq(enquiryItems.productId, products.id))
            .where(eq(enquiryItems.enquiryId, id))
            .orderBy(asc(enquiryItems.itemOrder));

        // Fetch first image and controller details for each product
        const items = await Promise.all(
            itemsData.map(async (item) => {
                const images = await db
                    .select({ imageUrl: productImages.imageUrl })
                    .from(productImages)
                    .where(eq(productImages.productId, item.productId))
                    .orderBy(productImages.imageOrder)
                    .limit(1);
                
                let controller = null;
                if (item.controllerId) {
                    const [ctrl] = await db
                        .select({
                            id: controllers.id,
                            productName: controllers.interfaceName,
                            brandName: controllers.brandName,
                        })
                        .from(controllers)
                        .where(eq(controllers.id, item.controllerId))
                        .limit(1);
                    if (ctrl) {
                        controller = {
                            ...ctrl,
                            imageUrl: null,
                            sourceType: "controller",
                            productNumber: ctrl.brandName || ctrl.id?.slice(0, 8) || "N/A",
                        };
                    }
                }
                
                // Fetch accessories linked to this enquiry item
                const itemAccessories = await db
                    .select({
                        id: accessories.id,
                        productName: accessories.productName,
                        productNumber: accessories.productNumber,
                        productGroup: accessories.productGroup,
                        quantity: enquiryItemAccessories.quantity,
                    })
                    .from(enquiryItemAccessories)
                    .innerJoin(accessories, eq(enquiryItemAccessories.accessoryId, accessories.id))
                    .where(eq(enquiryItemAccessories.enquiryItemId, item.id));

                return {
                    ...item,
                    imageUrl: images[0]?.imageUrl || null,
                    controller,
                    accessories: itemAccessories,
                };
            })
        );

        // Fetch enquiry files
        const files = await db
            .select()
            .from(enquiryFiles)
            .where(eq(enquiryFiles.enquiryId, id))
            .orderBy(asc(enquiryFiles.createdAt));

        // Fetch quotations for this enquiry
        const enquiryQuotations = await db
            .select()
            .from(quotations)
            .where(eq(quotations.enquiryId, id))
            .orderBy(desc(quotations.createdAt));

        // Format enquiry ID
        const enquiryId = formatEnquiryId(enquiry.id, enquiry.createdAt);

        return successResponse("Enquiry fetched successfully", {
            ...enquiry,
            enquiryId,
            items,
            files,
            quotations: enquiryQuotations,
        });
    } catch (error) {
        console.error("Error fetching enquiry:", error);
        return errorResponse(error.message || "Failed to fetch enquiry");
    }
}

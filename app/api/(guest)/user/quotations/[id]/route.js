import { db } from "@/lib/db";
import { 
    quotations, 
    quotationItems, 
    quotationOptionalItems,
    quotationAdditionalItems,
    products, 
    productImages,
    controllers,
    accessories,
    enquiries,
    enquiryItems,
} from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq, desc, and, ne } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-helpers";

// Helper to get first product image
async function getProductImage(productId) {
    const images = await db
        .select({ imageUrl: productImages.imageUrl })
        .from(productImages)
        .where(eq(productImages.productId, productId))
        .orderBy(productImages.imageOrder)
        .limit(1);
    return images[0]?.imageUrl || null;
}

// Helper to get first controller image
async function getControllerImage(controllerId) {
    const images = await db
        .select({ imageUrl: productImages.imageUrl })
        .from(productImages)
        .where(eq(productImages.controllerId, controllerId))
        .orderBy(productImages.imageOrder)
        .limit(1);
    return images[0]?.imageUrl || null;
}

// Helper to get product details (LED)
async function getProductDetails(productId) {
    const [product] = await db
        .select({
            id: products.id,
            productName: products.productName,
            productNumber: products.productNumber,
            pixelPitch: products.pixelPitch,
        })
        .from(products)
        .where(eq(products.id, productId))
        .limit(1);
    
    if (product) {
        const imageUrl = await getProductImage(productId);
        return { ...product, imageUrl, sourceType: "product" };
    }
    return null;
}

// Helper to get controller details
async function getControllerDetails(controllerId) {
    const [controller] = await db
        .select({
            id: controllers.id,
            productName: controllers.interfaceName,
            brandName: controllers.brandName,
        })
        .from(controllers)
        .where(eq(controllers.id, controllerId))
        .limit(1);
    
    if (controller) {
        const imageUrl = await getControllerImage(controllerId);
        return {
            ...controller,
            productNumber: controller.brandName || controller.id?.slice(0, 8) || "N/A",
            imageUrl: imageUrl || null,
            sourceType: "controller",
        };
    }
    return null;
}

// Helper to get accessory details
async function getAccessoryDetails(accessoryId) {
    const [accessory] = await db
        .select({
            id: accessories.id,
            productName: accessories.productName,
            productNumber: accessories.productNumber,
            productGroup: accessories.productGroup,
        })
        .from(accessories)
        .where(eq(accessories.id, accessoryId))
        .limit(1);
    
    if (accessory) {
        return { ...accessory, imageUrl: null, sourceType: "accessory" };
    }
    return null;
}

// Resolve polymorphic optional item product
async function getOptionalItemProduct(opt) {
    const sourceType = opt.itemSourceType || "product";
    if (sourceType === "controller" && opt.controllerId) {
        return await getControllerDetails(opt.controllerId);
    }
    if (sourceType === "accessory" && opt.accessoryId) {
        return await getAccessoryDetails(opt.accessoryId);
    }
    if (opt.productId) {
        return await getProductDetails(opt.productId);
    }
    return null;
}

export async function GET(req, { params }) {
    try {
        const { user, error } = await getCurrentUser();
        if (error) {
            return errorResponse(error, 401);
        }

        const { id } = await params;

        if (!id) {
            return errorResponse("Quotation ID is required", 400);
        }

        // Fetch quotation
        const quotation = await db
            .select()
            .from(quotations)
            .where(and(eq(quotations.id, id), ne(quotations.status, "draft")))
            .limit(1)
            .then((res) => res[0]);

        if (!quotation) {
            return errorResponse("Quotation not found", 404);
        }

        // Verify the quotation belongs to user's enquiry
        const enquiry = await db
            .select()
            .from(enquiries)
            .where(and(
                eq(enquiries.id, quotation.enquiryId),
                eq(enquiries.userId, user.id)
            ))
            .limit(1)
            .then((res) => res[0]);

        if (!enquiry) {
            return errorResponse("Unauthorized", 403);
        }

        // Check if there's a newer non-draft quotation for the same enquiry
        const newerQuotation = await db
            .select({ id: quotations.id, createdAt: quotations.createdAt })
            .from(quotations)
            .where(and(
                eq(quotations.enquiryId, quotation.enquiryId),
                ne(quotations.id, quotation.id),
                ne(quotations.status, "draft")
            ))
            .orderBy(desc(quotations.createdAt))
            .limit(1);

        const hasNewerQuotation = newerQuotation.length > 0 && 
            new Date(newerQuotation[0].createdAt) > new Date(quotation.createdAt);

        // Chat disabled logic:
        // - rejected → disabled
        // - closed AND enquiry is NOT expired (closed due to new quotation) → disabled
        // - Everything else → enabled
        let chatDisabled = false;
        let chatDisabledReason = null;

        if (quotation.status === "rejected") {
            chatDisabled = true;
            chatDisabledReason = "Chat is closed because the quotation was rejected";
        } else if (quotation.status === "closed" && enquiry.status !== "expired") {
            chatDisabled = true;
            chatDisabledReason = "Chat is closed because a newer quotation exists";
        }

        // Buttons disabled logic:
        // Buttons are enabled only when status is "pending" or "revision_requested"
        // AND there's no newer quotation
        const actionableStatuses = ["pending", "revision_requested"];
        const buttonsDisabled = !actionableStatuses.includes(quotation.status) || hasNewerQuotation;
        
        let buttonsDisabledReason = null;
        if (hasNewerQuotation) {
            buttonsDisabledReason = "A newer quotation exists for this enquiry";
        } else if (!actionableStatuses.includes(quotation.status)) {
            buttonsDisabledReason = `Quotation has been ${quotation.status.replace("_", " ")}`;
        }

        // Fetch quotation items with product details and optional items
        const items = await db
            .select()
            .from(quotationItems)
            .where(eq(quotationItems.quotationId, id))
            .orderBy(quotationItems.itemOrder);

        // Fetch enquiry_items to merge LEDitor custom fields onto products
        const enquiryItemRows = await db
            .select({
                productId: enquiryItems.productId,
                itemType: enquiryItems.itemType,
                isCustom: enquiryItems.isCustom,
                customTotalResolutionH: enquiryItems.customTotalResolutionH,
                customTotalResolutionV: enquiryItems.customTotalResolutionV,
                customWeight: enquiryItems.customWeight,
                customDisplayArea: enquiryItems.customDisplayArea,
                customScreenWidth: enquiryItems.customScreenWidth,
                customScreenHeight: enquiryItems.customScreenHeight,
                customPowerConsumptionMax: enquiryItems.customPowerConsumptionMax,
                customPowerConsumptionTyp: enquiryItems.customPowerConsumptionTyp,
                customTotalCabinets: enquiryItems.customTotalCabinets,
            })
            .from(enquiryItems)
            .where(eq(enquiryItems.enquiryId, quotation.enquiryId));

        const enquiryItemByKey = new Map();
        const enquiryItemByProductId = new Map();
        for (const row of enquiryItemRows) {
            if (!row.productId) continue;
            const key = `${row.productId}|${row.itemType || "main"}`;
            if (!enquiryItemByKey.has(key)) enquiryItemByKey.set(key, row);
            if (!enquiryItemByProductId.has(row.productId)) enquiryItemByProductId.set(row.productId, row);
        }

        // Build items with product details, optional items, and additional items
        const itemsWithDetails = await Promise.all(
            items.map(async (item) => {
                const baseProduct = await getProductDetails(item.productId);
                const matchingEnquiryItem =
                    enquiryItemByKey.get(`${item.productId}|${item.itemType}`) ||
                    enquiryItemByProductId.get(item.productId) ||
                    null;
                const product = baseProduct
                    ? {
                        ...baseProduct,
                        isCustom: !!matchingEnquiryItem?.isCustom,
                        customTotalResolutionH: matchingEnquiryItem?.customTotalResolutionH ?? null,
                        customTotalResolutionV: matchingEnquiryItem?.customTotalResolutionV ?? null,
                        customWeight: matchingEnquiryItem?.customWeight ?? null,
                        customDisplayArea: matchingEnquiryItem?.customDisplayArea ?? null,
                        customScreenWidth: matchingEnquiryItem?.customScreenWidth ?? null,
                        customScreenHeight: matchingEnquiryItem?.customScreenHeight ?? null,
                        customPowerConsumptionMax: matchingEnquiryItem?.customPowerConsumptionMax ?? null,
                        customPowerConsumptionTyp: matchingEnquiryItem?.customPowerConsumptionTyp ?? null,
                        customTotalCabinets: matchingEnquiryItem?.customTotalCabinets ?? null,
                    }
                    : null;
                
                // Fetch optional items
                const optionalItemsData = await db
                    .select()
                    .from(quotationOptionalItems)
                    .where(eq(quotationOptionalItems.quotationItemId, item.id))
                    .orderBy(quotationOptionalItems.itemOrder);
                const optionalItems = await Promise.all(
                    optionalItemsData.map(async (opt) => ({
                        ...opt,
                        product: await getOptionalItemProduct(opt),
                    }))
                );

                // Fetch additional items (controllers)
                const additionalItemsData = await db
                    .select()
                    .from(quotationAdditionalItems)
                    .where(eq(quotationAdditionalItems.quotationItemId, item.id))
                    .orderBy(quotationAdditionalItems.itemOrder);
                const additionalItems = await Promise.all(
                    additionalItemsData.map(async (add) => {
                        const product = await getControllerDetails(add.controllerId);
                        return {
                            ...add,
                            product,
                            quantity: add.quantity,
                            unitPrice: add.unitPrice,
                            discountPercentage: add.discountPercentage,
                            description: add.description,
                        };
                    })
                );

                return {
                    ...item,
                    product,
                    optionalItems,
                    additionalItems,
                };
            })
        );

        // Separate main product and alternative product
        const mainProduct = itemsWithDetails.find(item => item.itemType === "main") || itemsWithDetails[0];
        const alternativeProduct = itemsWithDetails.find(item => item.itemType === "alternative") || itemsWithDetails[1] || null;

        return successResponse("Quotation fetched successfully", {
            ...quotation,
            enquiry: {
                id: enquiry.id,
                message: enquiry.message,
                status: enquiry.status,
            },
            mainProduct,
            alternativeProduct,
            chatDisabled,
            chatDisabledReason,
            buttonsDisabled,
            buttonsDisabledReason,
        });
    } catch (error) {
        console.error("GET /api/user/quotations/[id] error:", error);
        return errorResponse("Failed to fetch quotation", 500);
    }
}

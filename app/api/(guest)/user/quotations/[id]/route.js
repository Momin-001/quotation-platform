import { db } from "@/lib/db";
import { 
    quotations, 
    quotationItems, 
    quotationOptionalItems,
    products, 
    productImages,
    controllers,
    accessories,
    enquiries 
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

// Helper to get product details (LED)
async function getProductDetails(productId) {
    const product = await db
        .select({
            id: products.id,
            productName: products.productName,
            productNumber: products.productNumber,
            pixelPitch: products.pixelPitch,
        })
        .from(products)
        .where(eq(products.id, productId))
        .limit(1);
    
    if (product[0]) {
        const imageUrl = await getProductImage(productId);
        return { ...product[0], imageUrl, sourceType: "product" };
    }
    return null;
}

// Helper to get controller details
async function getControllerDetails(controllerId) {
    const controller = await db
        .select({
            id: controllers.id,
            productName: controllers.productName,
            productNumber: controllers.productNumber,
            brandName: controllers.brandName,
        })
        .from(controllers)
        .where(eq(controllers.id, controllerId))
        .limit(1);
    
    if (controller[0]) {
        return { ...controller[0], imageUrl: null, sourceType: "controller" };
    }
    return null;
}

// Helper to get accessory details
async function getAccessoryDetails(accessoryId) {
    const accessory = await db
        .select({
            id: accessories.id,
            productName: accessories.productName,
            productNumber: accessories.productNumber,
            productGroup: accessories.productGroup,
        })
        .from(accessories)
        .where(eq(accessories.id, accessoryId))
        .limit(1);
    
    if (accessory[0]) {
        return { ...accessory[0], imageUrl: null, sourceType: "accessory" };
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
            .where(eq(quotations.id, id))
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

        // Build items with product details and optional items
        const itemsWithDetails = await Promise.all(
            items.map(async (item) => {
                const product = await getProductDetails(item.productId);
                
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

                return {
                    ...item,
                    product,
                    optionalItems,
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
        console.error("Error fetching quotation:", error);
        return errorResponse(error.message || "Failed to fetch quotation");
    }
}

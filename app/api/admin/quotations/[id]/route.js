import { db } from "@/lib/db";
import { 
    quotations, 
    quotationItems, 
    quotationOptionalItems,
    products, 
    productImages,
    controllers,
    accessories,
    enquiries,
    users
} from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq, desc, and, ne, or } from "drizzle-orm";
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

// Helper to get product details (LED product)
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

// Helper to resolve optional item's product details based on source type
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

        // Fetch enquiry with customer info
        const enquiry = await db
            .select({
                id: enquiries.id,
                message: enquiries.message,
                status: enquiries.status,
                createdAt: enquiries.createdAt,
                customerName: users.fullName,
                customerEmail: users.email,
                customerPhone: users.phoneNumber,
                customerCompany: users.companyName,
            })
            .from(enquiries)
            .innerJoin(users, eq(enquiries.userId, users.id))
            .where(eq(enquiries.id, quotation.enquiryId))
            .limit(1)
            .then((res) => res[0]);

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
            enquiry,
            items: itemsWithDetails,
            mainProduct,
            alternativeProduct,
            chatDisabled,
            chatDisabledReason,
        });
    } catch (error) {
        console.error("Error fetching quotation:", error);
        return errorResponse(error.message || "Failed to fetch quotation");
    }
}

// PUT /api/admin/quotations/[id] - Update a quotation (for editing drafts)
export async function PUT(req, { params }) {
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
        const body = await req.json();
        const { status, items } = body;

        if (!id) {
            return errorResponse("Quotation ID is required", 400);
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return errorResponse("At least one item is required", 400);
        }

        // Fetch existing quotation
        const existingQuotation = await db
            .select()
            .from(quotations)
            .where(eq(quotations.id, id))
            .limit(1)
            .then((res) => res[0]);

        if (!existingQuotation) {
            return errorResponse("Quotation not found", 404);
        }

        // Only allow editing drafts
        if (existingQuotation.status !== "draft") {
            return errorResponse("Only draft quotations can be edited", 400);
        }

        // Validate items
        for (const item of items) {
            if (!item.productId || !item.unitPrice) {
                return errorResponse("Each item must have a product and unit price", 400);
            }
        }

        const newStatus = status || "draft";
        const isSendingToUser = newStatus === "pending";

        // If sending to user, close all previous active quotations
        if (isSendingToUser) {
            await db
                .update(quotations)
                .set({ 
                    status: "closed",
                    updatedAt: new Date(),
                })
                .where(
                    and(
                        eq(quotations.enquiryId, existingQuotation.enquiryId),
                        ne(quotations.id, id),
                        or(
                            eq(quotations.status, "pending"),
                            eq(quotations.status, "revision_requested")
                        )
                    )
                );
        }

        // Delete existing items and optional items
        const existingItems = await db
            .select({ id: quotationItems.id })
            .from(quotationItems)
            .where(eq(quotationItems.quotationId, id));

        for (const item of existingItems) {
            await db
                .delete(quotationOptionalItems)
                .where(eq(quotationOptionalItems.quotationItemId, item.id));
        }

        await db
            .delete(quotationItems)
            .where(eq(quotationItems.quotationId, id));

        // Create new quotation items
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            
            const newItem = await db
                .insert(quotationItems)
                .values({
                    quotationId: id,
                    productId: item.productId,
                    quantity: item.quantity || 1,
                    unitPrice: item.unitPrice.toString(),
                    taxPercentage: (item.taxPercentage || 0).toString(),
                    discountPercentage: (item.discountPercentage || 0).toString(),
                    description: item.description || null,
                    itemType: item.itemType || (i === 0 ? "main" : "alternative"),
                    itemOrder: i,
                })
                .returning();

            const quotationItemId = newItem[0].id;

            // Create optional items (polymorphic: product, controller, or accessory)
            if (item.optionalItems && Array.isArray(item.optionalItems)) {
                for (let j = 0; j < item.optionalItems.length; j++) {
                    const optItem = item.optionalItems[j];
                    const sourceId = optItem.sourceId || optItem.productId;
                    const sourceType = optItem.sourceType || "product";
                    
                    if (sourceId && optItem.unitPrice) {
                        const optionalData = {
                            quotationItemId,
                            itemSourceType: sourceType,
                            productId: sourceType === "product" ? sourceId : null,
                            controllerId: sourceType === "controller" ? sourceId : null,
                            accessoryId: sourceType === "accessory" ? sourceId : null,
                            quantity: optItem.quantity || 1,
                            unitPrice: optItem.unitPrice.toString(),
                            taxPercentage: (optItem.taxPercentage || 0).toString(),
                            discountPercentage: (optItem.discountPercentage || 0).toString(),
                            description: optItem.description || null,
                            itemOrder: j,
                        };
                        await db.insert(quotationOptionalItems).values(optionalData);
                    }
                }
            }
        }

        // Update quotation status
        await db
            .update(quotations)
            .set({ 
                status: newStatus,
                updatedAt: new Date(),
            })
            .where(eq(quotations.id, id));

        // Update enquiry status if sending to user
        if (isSendingToUser) {
            const enquiry = await db
                .select({ status: enquiries.status })
                .from(enquiries)
                .where(eq(enquiries.id, existingQuotation.enquiryId))
                .limit(1)
                .then((res) => res[0]);

            if (enquiry && (enquiry.status === "pending" || enquiry.status === "expired")) {
                await db
                    .update(enquiries)
                    .set({ status: "in_progress", updatedAt: new Date() })
                    .where(eq(enquiries.id, existingQuotation.enquiryId));
            }
        }

        return successResponse(
            isSendingToUser ? "Quotation sent to customer successfully" : "Draft updated successfully",
            {
                id,
                status: newStatus,
            }
        );
    } catch (error) {
        console.error("Error updating quotation:", error);
        return errorResponse(error.message || "Failed to update quotation");
    }
}

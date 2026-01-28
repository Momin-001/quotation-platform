import { db } from "@/lib/db";
import { 
    quotations, 
    quotationItems, 
    quotationOptionalItems,
    products, 
    productImages,
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

// Helper to get product details
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
        return { ...product[0], imageUrl };
    }
    return null;
}

// Calculate item total
function calculateItemTotal(unitPrice, quantity, taxPercentage, discountPercentage) {
    const basePrice = parseFloat(unitPrice || 0) * parseInt(quantity || 1);
    const taxAmount = basePrice * (parseFloat(taxPercentage || 0) / 100);
    const discountAmount = basePrice * (parseFloat(discountPercentage || 0) / 100);
    return basePrice + taxAmount - discountAmount;
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

        // Check if there's a newer quotation for the same enquiry (chat disabled)
        const newerQuotation = await db
            .select({ id: quotations.id, createdAt: quotations.createdAt })
            .from(quotations)
            .where(and(
                eq(quotations.enquiryId, quotation.enquiryId),
                ne(quotations.id, quotation.id)
            ))
            .orderBy(desc(quotations.createdAt))
            .limit(1);

        const hasNewerQuotation = newerQuotation.length > 0 && 
            new Date(newerQuotation[0].createdAt) > new Date(quotation.createdAt);

        // Chat is disabled if: there's a newer quotation OR status is accepted/rejected/revision_requested
        const chatDisabled = hasNewerQuotation || 
            ["accepted", "rejected", "revision_requested"].includes(quotation.status);

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
                        product: await getProductDetails(opt.productId),
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

        // Calculate total
        let grandTotal = 0;
        itemsWithDetails.forEach((item) => {
            grandTotal += calculateItemTotal(item.unitPrice, item.quantity, item.taxPercentage, item.discountPercentage);
            
            item.optionalItems?.forEach((opt) => {
                grandTotal += calculateItemTotal(opt.unitPrice, opt.quantity, opt.taxPercentage, opt.discountPercentage);
            });
        });

        return successResponse("Quotation fetched successfully", {
            ...quotation,
            enquiry: {
                id: enquiry.id,
                message: enquiry.message,
                status: enquiry.status,
            },
            items: itemsWithDetails,
            mainProduct,
            alternativeProduct,
            calculatedTotal: grandTotal.toFixed(2),
            chatDisabled,
            chatDisabledReason: hasNewerQuotation 
                ? "A newer quotation exists for this enquiry" 
                : chatDisabled 
                    ? `Quotation has been ${quotation.status.replace("_", " ")}`
                    : null,
        });
    } catch (error) {
        console.error("Error fetching quotation:", error);
        return errorResponse(error.message || "Failed to fetch quotation");
    }
}

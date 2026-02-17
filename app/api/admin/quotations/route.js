import { db } from "@/lib/db";
import { 
    quotations, 
    quotationItems, 
    quotationOptionalItems,
    enquiries,
    users
} from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq, desc, asc, ilike, or, and, sql } from "drizzle-orm";
// Helper function to generate quotation number
function generateQuotationNumber() {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 900000) + 100000;
    return `Q-${year}-${randomNum}`;
}

// GET /api/admin/quotations - Get all quotations with search, filter, and pagination
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        const status = searchParams.get("status") || "";
        const sortBy = searchParams.get("sortBy") || "desc";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const offset = (page - 1) * limit;

        // Base query - join with enquiries and users
        let query = db
            .select({
                id: quotations.id,
                quotationNumber: quotations.quotationNumber,
                status: quotations.status,
                createdAt: quotations.createdAt,
                updatedAt: quotations.updatedAt,
                enquiryId: quotations.enquiryId,
                customerName: users.fullName,
                customerEmail: users.email,
            })
            .from(quotations)
            .innerJoin(enquiries, eq(quotations.enquiryId, enquiries.id))
            .innerJoin(users, eq(enquiries.userId, users.id));

        // Build where conditions
        const whereConditions = [];
        
        if (search.trim()) {
            whereConditions.push(
                or(
                    ilike(quotations.quotationNumber, `%${search}%`),
                    ilike(users.fullName, `%${search}%`),
                    ilike(users.email, `%${search}%`),
                )
            );
        }

        if (status && status !== "all") {
            whereConditions.push(eq(quotations.status, status));
        }

        // Apply where conditions
        if (whereConditions.length > 0) {
            for (const condition of whereConditions) {
                query = query.where(condition);
            }
        }

        // Apply ordering
        const orderDirection = sortBy === "asc" ? asc(quotations.createdAt) : desc(quotations.createdAt);
        query = query.orderBy(orderDirection);

        // Get total count for pagination
        let countQuery = db
            .select({ count: sql`count(*)` })
            .from(quotations)
            .innerJoin(enquiries, eq(quotations.enquiryId, enquiries.id))
            .innerJoin(users, eq(enquiries.userId, users.id));

        if (whereConditions.length > 0) {
            for (const condition of whereConditions) {
                countQuery = countQuery.where(condition);
            }
        }

        const totalResult = await countQuery;
        const total = parseInt(totalResult[0]?.count || 0);

        // Apply pagination
        query = query.limit(limit).offset(offset);

        const allQuotations = await query;

        const totalPages = Math.ceil(total / limit);
        const hasMore = page < totalPages;

        return successResponse("Quotations fetched successfully", {
            quotations: allQuotations,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasMore,
            }
        });
    } catch (error) {
        console.error("Error fetching quotations:", error);
        return errorResponse(error.message || "Failed to fetch quotations");
    }
}

// Enquiry statuses that allow quotation creation
const allowedEnquiryStatuses = ["pending", "in_progress", "expired"];

// POST /api/admin/quotations - Create/Save a quotation (new simplified structure)
export async function POST(request) {
    try {
        const body = await request.json();
        const { enquiryId, status, items } = body;

        // Validate required fields
        if (!enquiryId) {
            return errorResponse("Enquiry ID is required", 400);
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return errorResponse("At least one item is required", 400);
        }

        // Check if enquiry exists
        const existingEnquiry = await db
            .select()
            .from(enquiries)
            .where(eq(enquiries.id, enquiryId))
            .limit(1);

        if (existingEnquiry.length === 0) {
            return errorResponse("Enquiry not found", 404);
        }

        const enquiry = existingEnquiry[0];

        // Check if enquiry status allows quotation creation
        if (!allowedEnquiryStatuses.includes(enquiry.status)) {
            return errorResponse(
                `Cannot create quotation for ${enquiry.status} enquiry.`, 
                400
            );
        }

        // Validate items and calculate totals
        for (const item of items) {
            if (!item.productId || !item.unitPrice) {
                return errorResponse("Each item must have a product and unit price", 400);
            }
        }

        // Determine the quotation status
        const quotationStatus = status || "draft";
        const isSendingToUser = quotationStatus === "pending";

        // If sending to user (not draft), close all previous active quotations
        if (isSendingToUser) {
            await db
                .update(quotations)
                .set({ 
                    status: "closed",
                    updatedAt: new Date(),
                })
                .where(
                    and(
                        eq(quotations.enquiryId, enquiryId),
                        or(
                            eq(quotations.status, "pending"),
                            eq(quotations.status, "revision_requested")
                        )
                    )
                );
        }

        // Create quotation
        const quotationNumber = generateQuotationNumber();
        const newQuotation = await db
            .insert(quotations)
            .values({
                enquiryId,
                quotationNumber,
                status: quotationStatus,
            })
            .returning();

        const quotationId = newQuotation[0].id;

        // Create quotation items (main and alternative as separate items)
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            
            const newItem = await db
                .insert(quotationItems)
                .values({
                    quotationId,
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

            // Create optional items for this quotation item (polymorphic: product, controller, or accessory)
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

        // Update enquiry status to in_progress if it's pending or expired (only when sending to user)
        if (isSendingToUser && (enquiry.status === "pending" || enquiry.status === "expired")) {
            await db
                .update(enquiries)
                .set({ status: "in_progress", updatedAt: new Date() })
                .where(eq(enquiries.id, enquiryId));
        }

        return successResponse(
            isSendingToUser ? "Quotation sent to customer successfully" : "Quotation draft saved successfully", 
            {
                id: quotationId,
                quotationNumber,
                status: quotationStatus,
            }
        );
    } catch (error) {
        console.error("Error saving quotation:", error);
        return errorResponse(error.message || "Failed to save quotation");
    }
}

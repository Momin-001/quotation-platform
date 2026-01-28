import { db } from "@/lib/db";
import { 
    quotations, 
    quotationItems, 
    quotationOptionalItems,
    enquiries,
    users
} from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq, desc, asc, ilike, or, sql } from "drizzle-orm";

// Helper function to generate quotation number
function generateQuotationNumber() {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 900000) + 100000;
    return `Q-${year}-${randomNum}`;
}

// Helper function to calculate item total
function calculateItemTotal(unitPrice, quantity, taxPercentage, discountPercentage) {
    const basePrice = parseFloat(unitPrice) * parseInt(quantity);
    const taxAmount = basePrice * (parseFloat(taxPercentage) / 100);
    const discountAmount = basePrice * (parseFloat(discountPercentage) / 100);
    return basePrice + taxAmount - discountAmount;
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
                description: quotations.description,
                status: quotations.status,
                totalAmount: quotations.totalAmount,
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
                    ilike(quotations.description, `%${search}%`)
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

// POST /api/admin/quotations - Create/Save a quotation (new simplified structure)
export async function POST(request) {
    try {
        const body = await request.json();
        const { enquiryId, description, status, items } = body;

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

        // Calculate total amount
        let totalAmount = 0;

        // Validate items and calculate totals
        for (const item of items) {
            if (!item.productId || !item.unitPrice) {
                return errorResponse("Each item must have a product and unit price", 400);
            }

            const itemTotal = calculateItemTotal(
                item.unitPrice,
                item.quantity || 1,
                item.taxPercentage || 0,
                item.discountPercentage || 0
            );
            totalAmount += itemTotal;

            // Add optional items to total
            if (item.optionalItems && Array.isArray(item.optionalItems)) {
                for (const optItem of item.optionalItems) {
                    if (optItem.productId && optItem.unitPrice) {
                        const optTotal = calculateItemTotal(
                            optItem.unitPrice,
                            optItem.quantity || 1,
                            optItem.taxPercentage || 0,
                            optItem.discountPercentage || 0
                        );
                        totalAmount += optTotal;
                    }
                }
            }
        }

        // Create quotation
        const quotationNumber = generateQuotationNumber();
        const newQuotation = await db
            .insert(quotations)
            .values({
                enquiryId,
                quotationNumber,
                description: description || null,
                status: status || "draft",
                totalAmount: totalAmount.toFixed(2),
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

            // Create optional items for this quotation item
            if (item.optionalItems && Array.isArray(item.optionalItems)) {
                for (let j = 0; j < item.optionalItems.length; j++) {
                    const optItem = item.optionalItems[j];
                    if (optItem.productId && optItem.unitPrice) {
                        await db.insert(quotationOptionalItems).values({
                            quotationItemId,
                            productId: optItem.productId,
                            quantity: optItem.quantity || 1,
                            unitPrice: optItem.unitPrice.toString(),
                            taxPercentage: (optItem.taxPercentage || 0).toString(),
                            discountPercentage: (optItem.discountPercentage || 0).toString(),
                            description: optItem.description || null,
                            itemOrder: j,
                        });
                    }
                }
            }
        }

        // Update enquiry status to in_progress if it's pending
        if (existingEnquiry[0].status === "pending") {
            await db
                .update(enquiries)
                .set({ status: "in_progress", updatedAt: new Date() })
                .where(eq(enquiries.id, enquiryId));
        }

        return successResponse("Quotation saved successfully", {
            id: quotationId,
            quotationNumber,
            totalAmount: totalAmount.toFixed(2),
        });
    } catch (error) {
        console.error("Error saving quotation:", error);
        return errorResponse(error.message || "Failed to save quotation");
    }
}

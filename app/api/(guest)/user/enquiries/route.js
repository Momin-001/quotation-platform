import { db } from "@/lib/db";
import { enquiries, enquiryItems, quotations, products } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq, desc, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function POST(req) {
    try {
        const {user, error} = await getCurrentUser();
        if (error) {
            return errorResponse(error, 401);
        }
        const body = await req.json();
        const { message, items } = body;

        if (!message || !items || !Array.isArray(items) || items.length === 0) {
            return errorResponse("Message and at least one product item are required", 400);
        }

        // Create enquiry
        const [enquiry] = await db
            .insert(enquiries)
            .values({
                userId: user.id,
                message: message.trim(),
                status: "pending",
            })
            .returning();

        // Create enquiry items
        const itemsToInsert = items.map((item) => ({
            enquiryId: enquiry.id,
            productId: item.productId,
            quantity: item.quantity || 1,
        }));

        await db.insert(enquiryItems).values(itemsToInsert);

        return successResponse(
            "Enquiry submitted successfully",
            { enquiryId: enquiry.id }
        );
    } catch (error) {
        return errorResponse(error.message || "Failed to create enquiry");
    }
}

export async function GET(req) {
    try {
        const {user, error} = await getCurrentUser();
        if (error) {
            return errorResponse(error, 401);
        }
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");

        let whereConditions = eq(enquiries.userId, user.id);
        
        if (status) {
            whereConditions = and(whereConditions, eq(enquiries.status, status));
        }

        const userEnquiries = await db
            .select()
            .from(enquiries)
            .where(whereConditions)
            .orderBy(desc(enquiries.createdAt));

        // Fetch quotations and product info for each enquiry
        const enquiriesWithQuotations = await Promise.all(
            userEnquiries.map(async (enquiry) => {
                // Fetch quotations
                const enquiryQuotations = await db
                    .select()
                    .from(quotations)
                    .where(eq(quotations.enquiryId, enquiry.id))
                    .orderBy(desc(quotations.createdAt));

                // Fetch enquiry items with product info
                const items = await db
                    .select({
                        id: enquiryItems.id,
                        productId: enquiryItems.productId,
                        quantity: enquiryItems.quantity,
                        productName: products.productName,
                        productNumber: products.productNumber,
                    })
                    .from(enquiryItems)
                    .innerJoin(products, eq(enquiryItems.productId, products.id))
                    .where(eq(enquiryItems.enquiryId, enquiry.id));

                return {
                    ...enquiry,
                    quotations: enquiryQuotations,
                    items: items,
                };
            })
        );

        return successResponse("Enquiries fetched successfully", enquiriesWithQuotations);
    } catch (error) {
        return errorResponse(error.message || "Failed to fetch enquiries");
    }
}

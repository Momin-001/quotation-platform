import { db } from "@/lib/db";
import { quotations, enquiries } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq, desc, and, inArray } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function GET(req) {
    try {
        const { user, error } = await getCurrentUser();
        if (error) {
            return errorResponse(error, 401);
        }

        // Fetch all enquiries for this user
        const userEnquiries = await db
            .select({ id: enquiries.id })
            .from(enquiries)
            .where(eq(enquiries.userId, user.id));

        if (userEnquiries.length === 0) {
            return successResponse("Quotations fetched successfully", {
                quotations: [],
                pendingCount: 0,
            });
        }

        const enquiryIds = userEnquiries.map((e) => e.id);

        // Fetch all quotations for user's enquiries
        const allQuotations = await db
            .select()
            .from(quotations)
            .where(inArray(quotations.enquiryId, enquiryIds))
            .orderBy(desc(quotations.createdAt));

        // Count pending quotations (status: pending)
        const pendingCount = allQuotations.filter(
            (q) => q.status === "pending"
        ).length;

        return successResponse("Quotations fetched successfully", {
            quotations: allQuotations,
            pendingCount,
        });
    } catch (error) {
        console.error("Error fetching quotations:", error);
        return errorResponse(error.message || "Failed to fetch quotations");
    }
}

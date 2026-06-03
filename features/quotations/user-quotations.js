import { db } from "@/lib/db";
import { enquiries, quotations } from "@/db/schema";
import { eq, ne } from "drizzle-orm";

/**
 * Fetch quotations for the authenticated user (server page or API).
 */
export async function fetchUserQuotations(userId) {
    const userEnquiries = await db.query.enquiries.findMany({
        where: eq(enquiries.userId, userId),
        columns: {},
        with: {
            quotations: {
                where: ne(quotations.status, "draft"),
                columns: {
                    id: true,
                    enquiryId: true,
                    createdAt: true,
                    status: true,
                    quotationNumber: true,
                },
            },
        },
    });

    const allQuotations = userEnquiries.flatMap((enquiry) => enquiry.quotations);

    return {
        quotations: allQuotations,
        pendingCount: allQuotations.filter((quotation) => quotation.status === "pending")
            .length,
    };
}

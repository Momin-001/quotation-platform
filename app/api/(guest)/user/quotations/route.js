import { db } from "@/lib/db";
import { quotations, enquiries } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq, desc, and, inArray, ne } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function GET(req) {
    try {
        const { user, error } = await getCurrentUser();
        if (error) {
            return errorResponse(error, 401);
        }
        
        // Fetch all enquiries for this user
        const userEnquiries = await db.query.enquiries.findMany({
            where: eq(enquiries.userId, user.id),
            columns: {},
            with: {
                quotations: {
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
        
        const formattedData = {
            quotations: allQuotations,
            pendingCount : allQuotations.filter((quotation) => quotation.status === "pending").length,
        };
        
        return successResponse("Quotations fetched successfully", formattedData);
    } catch (error) {
        console.error("Error fetching quotations:", error);
        return errorResponse(error.message || "Failed to fetch quotations");
    }
}

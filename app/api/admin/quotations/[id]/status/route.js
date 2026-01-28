import { db } from "@/lib/db";
import { quotations, enquiries } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-helpers";

// Valid statuses
const validStatuses = ["draft", "pending", "accepted", "rejected", "revision_requested", "expired", "completed"];

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
        const { status } = body;

        if (!id) {
            return errorResponse("Quotation ID is required", 400);
        }

        if (!status || !validStatuses.includes(status)) {
            return errorResponse(`Invalid status. Valid statuses: ${validStatuses.join(", ")}`, 400);
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

        // Update quotation status
        await db
            .update(quotations)
            .set({ 
                status,
                updatedAt: new Date(),
            })
            .where(eq(quotations.id, id));

        // Update enquiry status based on quotation status
        let enquiryStatus = null;
        if (status === "pending") {
            enquiryStatus = "in_progress";
        } else if (status === "accepted" || status === "completed") {
            enquiryStatus = "completed";
        } else if (status === "rejected") {
            enquiryStatus = "cancelled";
        }

        if (enquiryStatus) {
            await db
                .update(enquiries)
                .set({ 
                    status: enquiryStatus,
                    updatedAt: new Date(),
                })
                .where(eq(enquiries.id, quotation.enquiryId));
        }

        return successResponse("Quotation status updated successfully", {
            quotationId: id,
            newStatus: status,
        });
    } catch (error) {
        console.error("Error updating quotation status:", error);
        return errorResponse(error.message || "Failed to update quotation status");
    }
}

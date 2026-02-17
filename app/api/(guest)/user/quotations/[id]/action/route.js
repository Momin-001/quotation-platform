import { db } from "@/lib/db";
import { quotations, enquiries } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq, and, desc, ne } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-helpers";

// Valid status transitions for user actions
const validActions = {
    accept: "accepted",
    reject: "rejected",
    request_revision: "revision_requested",
};

// Statuses that allow user actions
const actionableStatuses = ["pending", "revision_requested"];

export async function POST(req, { params }) {
    try {
        const { user, error } = await getCurrentUser();
        if (error) {
            return errorResponse(error, 401);
        }

        const { id } = await params;
        const body = await req.json();
        const { action } = body;

        if (!id) {
            return errorResponse("Quotation ID is required", 400);
        }

        if (!action || !validActions[action]) {
            return errorResponse("Invalid action. Valid actions: accept, reject, request_revision", 400);
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

        // Check if there's a newer quotation (this one might be closed)
        const newerQuotation = await db
            .select({ id: quotations.id })
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

        if (hasNewerQuotation) {
            return errorResponse("A newer quotation exists. Please use the latest quotation.", 400);
        }

        // Check if action is allowed based on current status
        // Allow actions from both "pending" and "revision_requested" statuses
        if (!actionableStatuses.includes(quotation.status)) {
            return errorResponse(`Cannot ${action.replace("_", " ")} a quotation that is ${quotation.status.replace("_", " ")}`, 400);
        }

        const newStatus = validActions[action];

        // Update quotation status
        await db
            .update(quotations)
            .set({ 
                status: newStatus,
                updatedAt: new Date(),
            })
            .where(eq(quotations.id, id));

        // Update enquiry status based on action
        let enquiryStatus = enquiry.status;
        if (action === "accept") {
            enquiryStatus = "completed";
        } else if (action === "reject") {
            enquiryStatus = "cancelled";
        }
        // For request_revision, enquiry stays in_progress (no change needed)

        if (enquiryStatus !== enquiry.status) {
            await db
                .update(enquiries)
                .set({ 
                    status: enquiryStatus,
                    updatedAt: new Date(),
                })
                .where(eq(enquiries.id, quotation.enquiryId));
        }

        return successResponse(`Quotation ${action.replace("_", " ")}ed successfully`, {
            quotationId: id,
            newStatus,
            enquiryStatus,
        });
    } catch (error) {
        console.error("Error updating quotation:", error);
        return errorResponse(error.message || "Failed to update quotation");
    }
}

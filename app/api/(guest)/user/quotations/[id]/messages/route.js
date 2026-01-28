import { db } from "@/lib/db";
import { quotations, enquiries, quotationMessages } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq, and, desc, ne } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-helpers";

// GET - Fetch messages for a quotation
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

        // Fetch quotation and verify ownership
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

        // Fetch messages
        const messages = await db
            .select()
            .from(quotationMessages)
            .where(eq(quotationMessages.quotationId, id))
            .orderBy(quotationMessages.createdAt);

        // Check if chat is disabled
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

        const chatDisabled = hasNewerQuotation || 
            ["accepted", "rejected", "revision_requested"].includes(quotation.status);

        return successResponse("Messages fetched successfully", {
            messages,
            chatDisabled,
        });
    } catch (error) {
        console.error("Error fetching messages:", error);
        return errorResponse(error.message || "Failed to fetch messages");
    }
}

// POST - Send a message
export async function POST(req, { params }) {
    try {
        const { user, error } = await getCurrentUser();
        if (error) {
            return errorResponse(error, 401);
        }

        const { id } = await params;
        const body = await req.json();
        const { message } = body;

        if (!id) {
            return errorResponse("Quotation ID is required", 400);
        }

        if (!message || !message.trim()) {
            return errorResponse("Message is required", 400);
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

        // Check if chat is disabled
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

        const chatDisabled = hasNewerQuotation || 
            ["accepted", "rejected", "revision_requested"].includes(quotation.status);

        if (chatDisabled) {
            return errorResponse("Chat is disabled for this quotation", 400);
        }

        // Insert message
        const [newMessage] = await db
            .insert(quotationMessages)
            .values({
                quotationId: id,
                senderId: user.id,
                senderRole: "user",
                message: message.trim(),
            })
            .returning();

        return successResponse("Message sent successfully", newMessage);
    } catch (error) {
        console.error("Error sending message:", error);
        return errorResponse(error.message || "Failed to send message");
    }
}

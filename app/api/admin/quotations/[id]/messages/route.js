import { db } from "@/lib/db";
import { quotations, quotationMessages } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq, and, desc, ne } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-helpers";

// GET - Fetch messages for a quotation (Admin)
export async function GET(req, { params }) {
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

// POST - Send a message (Admin)
export async function POST(req, { params }) {
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
                senderRole: "admin",
                message: message.trim(),
            })
            .returning();

        return successResponse("Message sent successfully", newMessage);
    } catch (error) {
        console.error("Error sending message:", error);
        return errorResponse(error.message || "Failed to send message");
    }
}

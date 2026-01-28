import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { faqs } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";

// PATCH /api/admin/faqs/[id] - Update a FAQ
export async function PATCH(request, { params }) {
    try {
        const resolvedParams = await params;
        const { id } = resolvedParams;
        const body = await request.json();
        const { titleEn, titleDe, descriptionEn, descriptionDe } = body;

        // Validate required fields if provided
        if (titleEn !== undefined && !titleEn.trim() || titleDe !== undefined && !titleDe.trim() || descriptionEn !== undefined && !descriptionEn.trim() || descriptionDe !== undefined && !descriptionDe.trim()) {
            return errorResponse("All fields are required", 400);
        }

        const updateData = {};
        if (titleEn !== undefined) updateData.titleEn = titleEn.trim();
        if (titleDe !== undefined) updateData.titleDe = titleDe.trim();
        if (descriptionEn !== undefined) updateData.descriptionEn = descriptionEn.trim();
        if (descriptionDe !== undefined) updateData.descriptionDe = descriptionDe.trim();
        updateData.updatedAt = new Date();

        const updatedFaq = await db
            .update(faqs)
            .set(updateData)
            .where(eq(faqs.id, id))
            .returning();

        if (!updatedFaq || updatedFaq.length === 0) {
            return errorResponse("FAQ not found", 404);
        }

        return successResponse("FAQ updated successfully", updatedFaq[0]);
    } catch (error) {
        return errorResponse(error.message || "Failed to update FAQ");
    }
}

// DELETE /api/admin/faqs/[id] - Delete a FAQ
export async function DELETE(request, { params }) {
    try {
        const resolvedParams = await params;
        const { id } = await resolvedParams;

        const deletedFaq = await db
            .delete(faqs)
            .where(eq(faqs.id, id))
            .returning();

        if (!deletedFaq || deletedFaq.length === 0) {
            return errorResponse("FAQ not found", 404);
        }

        return successResponse("FAQ deleted successfully", deletedFaq[0]);
    } catch (error) {
        return errorResponse(error.message || "Failed to delete FAQ");
    }
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";

// PATCH /api/admin/categories/[id] - Update a category
export async function PATCH(request, { params }) {
    try {
        const resolvedParams = await params;
        const { id } = resolvedParams;
        const body = await request.json();
        const { name, description } = body;

        if (!name || !name.trim()) {
            return errorResponse("Category name is required", 400);
        }

        const updatedCategory = await db
            .update(categories)
            .set({
                name: name.trim(),
                description: description?.trim() || null,
                updatedAt: new Date(),
            })
            .where(eq(categories.id, id))
            .returning();

        if (updatedCategory.length === 0) {
            return errorResponse("Category not found", 404);
        }

        return successResponse("Category updated successfully", updatedCategory[0]);
    } catch (error) {
        return errorResponse(error.message || "Failed to update category");
    }
}

// DELETE /api/admin/categories/[id] - Delete a category
export async function DELETE(request, { params }) {
    try {
        const resolvedParams = await params;
        const { id } = resolvedParams;

        const deletedCategory = await db
            .delete(categories)
            .where(eq(categories.id, id))
            .returning();

        if (deletedCategory.length === 0) {
            return errorResponse("Category not found", 404);
        }

        return successResponse("Category deleted successfully");
    } catch (error) {
        return errorResponse(error.message || "Failed to delete category");
    }
}

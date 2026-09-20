import { db } from "@/lib/db";
import { productGroups } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { and, eq, ne } from "drizzle-orm";

// PATCH /api/admin/product-groups/[id]
export async function PATCH(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();

        const updateData = { updatedAt: new Date() };

        if (body.name !== undefined) {
            const name = body.name?.toString().trim();
            if (!name) return errorResponse("Group name is required", 400);

            const [clash] = await db
                .select({ id: productGroups.id })
                .from(productGroups)
                .where(and(eq(productGroups.name, name), ne(productGroups.id, id)))
                .limit(1);
            if (clash) return errorResponse("A group with this name already exists", 409);

            updateData.name = name;
        }

        if (body.description !== undefined) {
            updateData.description = body.description?.toString().trim() || null;
        }

        const [updated] = await db
            .update(productGroups)
            .set(updateData)
            .where(eq(productGroups.id, id))
            .returning();

        if (!updated) return errorResponse("Product group not found", 404);

        return successResponse("Product group updated successfully", updated);
    } catch (error) {
        console.error("PATCH /api/admin/product-groups/[id] error:", error);
        return errorResponse("Failed to update product group", 500);
    }
}

// DELETE /api/admin/product-groups/[id]
// Products keep existing; their group_id is set to null by the FK rule.
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        const [deleted] = await db
            .delete(productGroups)
            .where(eq(productGroups.id, id))
            .returning();

        if (!deleted) return errorResponse("Product group not found", 404);

        return successResponse("Product group deleted successfully", deleted);
    } catch (error) {
        console.error("DELETE /api/admin/product-groups/[id] error:", error);
        return errorResponse("Failed to delete product group", 500);
    }
}

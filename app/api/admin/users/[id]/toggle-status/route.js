import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";

export async function PATCH(req, { params }) {
    try {
        const resolvedParams = await params;
        const { id } = resolvedParams;
        const body = await req.json();
        const { isActive } = body;

        if (typeof isActive !== 'boolean') {
            return errorResponse("Invalid status type", 400);
        }

        const updatedUser = await db
            .update(users)
            .set({ isActive })
            .where(eq(users.id, id))
            .returning();

        if (!updatedUser || updatedUser.length === 0) {
            return errorResponse("User not found", 404);
        }

        const { password: _, ...userWithoutPassword } = updatedUser[0];

        return successResponse("User status updated successfully", userWithoutPassword);
    } catch (error) {
        return errorResponse(error.message || "Failed to update user status");
    }
}

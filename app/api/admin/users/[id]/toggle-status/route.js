import { db } from "@/lib/db";
import { users } from "@/drizzle/schema/users";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";

export async function PATCH(req, { params }) {
    try {
        const { id } = await params; // await params in Next.js 15
        const body = await req.json();
        const { isActive } = body;

        if (typeof isActive !== 'boolean') {
            return errorResponse("Invalid status", 400);
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

        return successResponse(userWithoutPassword, "User status updated successfully");
    } catch (error) {
        console.error("Error updating user status:", error);
        return errorResponse("Failed to update user status", 500);
    }
}

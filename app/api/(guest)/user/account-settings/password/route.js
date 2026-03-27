import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth-helpers";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\W_]{8,}$/;

export async function PATCH(req) {
    try {
        const { user, error } = await getCurrentUser();
        if (error || !user) {
            return errorResponse(error || "Unauthorized", 401);
        }

        const body = await req.json();
        const { currentPassword, newPassword, confirmPassword } = body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return errorResponse("All password fields are required", 400);
        }

        if (newPassword !== confirmPassword) {
            return errorResponse("New password and confirm password do not match", 400);
        }

        if (!PASSWORD_RULE.test(newPassword)) {
            return errorResponse(
                "New password must be at least 8 characters and include letters and numbers",
                400
            );
        }

        const dbUser = await db
            .select()
            .from(users)
            .where(eq(users.id, user.id))
            .then((res) => res[0]);

        if (!dbUser || !dbUser.password) {
            return errorResponse("User password is not set", 400);
        }

        const isCurrentValid = await bcrypt.compare(currentPassword, dbUser.password);
        if (!isCurrentValid) {
            return errorResponse("Current password is incorrect", 400);
        }

        const hashed = await bcrypt.hash(newPassword, 10);

        await db
            .update(users)
            .set({ password: hashed })
            .where(eq(users.id, user.id));

        return successResponse("Password changed successfully");
    } catch (error) {
        return errorResponse(error.message || "Failed to change password");
    }
}


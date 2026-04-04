import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { SMTP_USER } from "@/lib/constants";
import { createEmailTransporter } from "@/lib/email-transporter";

function generateInitialPassword(length = 10) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

export async function PATCH(req, { params }) {
    try {
        const resolvedParams = await params;
        const { id } = resolvedParams;
        const body = await req.json();
        const { isActive } = body;

        if (typeof isActive !== 'boolean') {
            return errorResponse("Invalid status type", 400);
        }

        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.id, id))
            .then((res) => res[0]);

        if (!existingUser) {
            return errorResponse("User not found", 404);
        }

        const activatingFirstTime =
            !existingUser.isActive &&
            isActive === true &&
            !existingUser.password;

        let transporter = null;

        if (activatingFirstTime) {
            transporter = createEmailTransporter();
            if (!transporter || !SMTP_USER) {
                return errorResponse("Email service is not configured. Please contact the administrator.", 500);
            }
        }

        const updatePayload = { isActive };
        let initialPassword = null;

        if (activatingFirstTime) {
            initialPassword = generateInitialPassword();
            updatePayload.password = await bcrypt.hash(initialPassword, 10);
        }

        const updatedUser = await db
            .update(users)
            .set(updatePayload)
            .where(eq(users.id, id))
            .returning();

        if (!updatedUser || updatedUser.length === 0) {
            return errorResponse("User not found", 404);
        }

        if (activatingFirstTime) {
            await transporter.sendMail({
                from: SMTP_USER,
                to: updatedUser[0].email,
                subject: "Your account has been approved",
                html: `
                    <h2>Hello ${updatedUser[0].fullName},</h2>
                    <p>Your account has been approved by the administrator.</p>
                    <p>You can now log in using your email and this initial password:</p>
                    <p><strong>${initialPassword}</strong></p>
                    <p>Please change your password after your first login.</p>
                `,
            });
        }

        const { password: _, ...userWithoutPassword } = updatedUser[0];

        return successResponse("User status updated successfully", userWithoutPassword);
    } catch (error) {
        return errorResponse(error.message || "Failed to update user status");
    }
}

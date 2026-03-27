import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } from "@/lib/constants";

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

        if (activatingFirstTime && (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD)) {
            return errorResponse("Email service is not configured. Configure SMTP before approving users.", 500);
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
            const transporter = nodemailer.createTransport({
                host: SMTP_HOST,
                port: parseInt(SMTP_PORT, 10),
                secure: parseInt(SMTP_PORT, 10) === 465,
                auth: {
                    user: SMTP_USER,
                    pass: SMTP_PASSWORD,
                },
            });

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

import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { errorResponse, successResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { JWT_SECRET, BASE_URL, SMTP_USER } from "@/lib/constants";
import { createEmailTransporter } from "@/lib/email-transporter";

const GENERIC_MESSAGE =
    "If an account exists for this email, you will receive password reset instructions shortly.";

export async function POST(req) {
    try {
        const body = await req.json();
        const email = typeof body.email === "string" ? body.email.trim() : "";

        if (!email) {
            return errorResponse("Email is required", 400);
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return errorResponse("Invalid email format", 400);
        }

        const user = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .then((res) => res[0]);

        // Do not reveal whether the email exists; only send when user can reset (has a password).
        if (!user || !user.password) {
            return successResponse(GENERIC_MESSAGE);
        }

        const transporter = createEmailTransporter();
        if (!transporter || !SMTP_USER) {
            return errorResponse("Email service is not configured. Please contact the administrator.", 500);
        }

        const token = jwt.sign(
            { sub: user.id, purpose: "password-reset" },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        const base = (BASE_URL || "").replace(/\/$/, "");
        if (!base) {
            return errorResponse("Server URL is not configured (NEXT_PUBLIC_BASE_URL).", 500);
        }

        const resetUrl = `${base}/reset-password?token=${encodeURIComponent(token)}`;

        await transporter.sendMail({
            from: SMTP_USER,
            to: user.email,
            subject: "Reset your password",
            html: `
                <h2>Password reset</h2>
                <p>Hello ${user.fullName || ""},</p>
                <p>We received a request to reset the password for your account.</p>
                <p><a href="${resetUrl}">Click here to set a new password</a></p>
                <p>This link expires in one hour. If you did not request this, you can ignore this email.</p>
            `,
        });

        return successResponse(GENERIC_MESSAGE);
    } catch (error) {
        return errorResponse(error.message || "Failed to process request");
    }
}

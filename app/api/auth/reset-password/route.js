import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { errorResponse, successResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { JWT_SECRET } from "@/lib/constants";

const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\W_]{8,}$/;

function verifyResetToken(token) {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || decoded.purpose !== "password-reset" || !decoded.sub) {
        throw new Error("INVALID_TOKEN");
    }
    return decoded.sub;
}

/** GET — check token before showing the reset form (optional; POST still verifies). */
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get("token") || "";
        if (!token) {
            return errorResponse("Reset link is missing the token.", 400);
        }
        verifyResetToken(token);
        return successResponse("Token is valid", { valid: true });
    } catch {
        return errorResponse("This reset link is invalid or has expired.", 400);
    }
}

/** POST — set new password using token from email link. */
export async function POST(req) {
    try {
        const body = await req.json();
        const { token, password, confirmPassword } = body;

        if (!token || typeof token !== "string") {
            return errorResponse("Reset token is required", 400);
        }
        if (!password || !confirmPassword) {
            return errorResponse("Password and confirmation are required", 400);
        }
        if (password !== confirmPassword) {
            return errorResponse("Passwords do not match", 400);
        }
        if (!PASSWORD_RULE.test(password)) {
            return errorResponse(
                "Password must be at least 8 characters and include letters and numbers",
                400
            );
        }

        let userId;
        try {
            userId = verifyResetToken(token);
        } catch {
            return errorResponse("This reset link is invalid or has expired.", 400);
        }

        const user = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .then((res) => res[0]);

        if (!user) {
            return errorResponse("This reset link is invalid or has expired.", 400);
        }

        const hashed = await bcrypt.hash(password, 10);
        await db.update(users).set({ password: hashed }).where(eq(users.id, userId));

        return successResponse("Your password has been updated. You can now sign in.");
    } catch (error) {
        return errorResponse(error.message || "Failed to reset password");
    }
}

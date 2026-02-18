import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { errorResponse, successResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET, NODE_ENV } from "@/lib/constants";
import { cookies } from "next/headers";

export async function POST(req) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return errorResponse("All fields are required", 400);
        }

        const user = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .then((res) => res[0]);

        if (!user) {
            return errorResponse("Invalid credentials", 401);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return errorResponse("Invalid credentials", 401);
        }

        if (!user.isActive && user.role !== 'admin' && user.role !== 'super_admin') {
            return errorResponse("Your account is pending activation by admin.", 403);
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        const cookieStore = await cookies();
        cookieStore.set("token", token, {
            httpOnly: true,
            secure: NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",

        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        return successResponse("Login successful", userWithoutPassword);
    } catch (error) {
        return errorResponse(error.message || "Failed to login");
    }
}

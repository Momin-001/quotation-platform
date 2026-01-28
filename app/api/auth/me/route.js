import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { errorResponse, successResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@/lib/constants";
import { cookies } from "next/headers";

export async function GET(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return errorResponse("Unauthorized", 401);
        }

        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return errorResponse("Invalid token", 401);
        }

        const user = await db
            .select()
            .from(users)
            .where(eq(users.id, decoded.id))
            .then((res) => res[0]);

        if (!user) {
            return errorResponse("User not found", 404);
        }

        const { password: _, ...userWithoutPassword } = user;

        return successResponse("User retrieved successfully", userWithoutPassword);
    } catch (error) {
        return errorResponse(error.message || "Failed to get user");
    }
}

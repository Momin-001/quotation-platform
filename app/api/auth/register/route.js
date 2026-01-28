import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { errorResponse, successResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        const body = await req.json();
        const { fullName, email, password, companyName, phoneNumber } = body;

        if (!fullName || !email || !password) {
            return errorResponse("All fields are required", 400);
        }

        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .then((res) => res[0]);

        if (existingUser) {
            return errorResponse("User already exists", 409);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await db
            .insert(users)
            .values({
                fullName,
                email,
                password: hashedPassword,
                companyName,
                phoneNumber,
                role: "user",
            })
            .returning();

        return successResponse("User created successfully", newUser[0]);
    } catch (error) {
        return errorResponse(error.message || "Failed to create user");
    }
}

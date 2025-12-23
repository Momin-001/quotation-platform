import { db } from "@/lib/db";
import { users } from "@/drizzle/schema/users";
import { errorResponse, successResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        const body = await req.json();
        const { fullName, email, password, companyName, phoneNumber } = body;

        if (!fullName || !email || !password) {
            return errorResponse("Missing required fields", 400);
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

        return successResponse(newUser[0], "User created successfully");
    } catch (error) {
        console.error("Signup error:", error);
        return errorResponse("Internal Server Error", 500);
    }
}

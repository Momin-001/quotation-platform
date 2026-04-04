import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { errorResponse, successResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";

export async function POST(req) {
    try {
        const body = await req.json();
        const {
            fullName,
            companyName,
            companyAddress,
            email,
            phoneNumber,
            commercialRegisterNumber,
            privacyAccepted,
        } = body;

        if (!fullName || !companyName || !companyAddress || !email || !phoneNumber) {
            return errorResponse("All fields are required", 400);
        }

        if (!privacyAccepted) {
            return errorResponse("Privacy policy must be accepted", 400);
        }

        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .then((res) => res[0]);

        if (existingUser) {
            return errorResponse("User with this email already exists", 409);
        }

        const newUser = await db
            .insert(users)
            .values({
                fullName,
                companyName,
                companyAddress,
                email,
                phoneNumber,
                commercialRegisterNumber: commercialRegisterNumber || null,
                password: null,
                role: "user",
                isActive: false,
            })
            .returning();

        return successResponse("Registration successful! Please wait for admin approval.", newUser[0]);
    } catch (error) {
        return errorResponse(error.message || "Failed to create user");
    }
}

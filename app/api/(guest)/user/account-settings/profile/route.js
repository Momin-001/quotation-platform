import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth-helpers";
import { eq, and, ne } from "drizzle-orm";

export async function GET() {
    try {
        const { user, error } = await getCurrentUser();
        if (error || !user) {
            return errorResponse(error || "Unauthorized", 401);
        }

        const profile = await db
            .select()
            .from(users)
            .where(eq(users.id, user.id))
            .then((res) => res[0]);

        if (!profile) {
            return errorResponse("User not found", 404);
        }

        const { password: _, ...safeProfile } = profile;
        return successResponse("Profile fetched successfully", safeProfile);
    } catch (error) {
        return errorResponse(error.message || "Failed to fetch profile");
    }
}

export async function PUT(req) {
    try {
        const { user, error } = await getCurrentUser();
        if (error || !user) {
            return errorResponse(error || "Unauthorized", 401);
        }

        const body = await req.json();
        const {
            fullName,
            companyName,
            companyAddress,
            email,
            phoneNumber,
            commercialRegisterNumber,
        } = body;

        if (!fullName || !companyName || !companyAddress || !email || !phoneNumber) {
            return errorResponse("Please fill all required fields", 400);
        }

        const emailInUse = await db
            .select()
            .from(users)
            .where(and(eq(users.email, email.trim()), ne(users.id, user.id)))
            .then((res) => res[0]);

        if (emailInUse) {
            return errorResponse("Email is already in use", 409);
        }

        const updated = await db
            .update(users)
            .set({
                fullName: fullName.trim(),
                companyName: companyName.trim(),
                companyAddress: companyAddress.trim(),
                email: email.trim(),
                phoneNumber: phoneNumber.trim(),
                commercialRegisterNumber: commercialRegisterNumber?.trim() || null,
            })
            .where(eq(users.id, user.id))
            .returning();

        const { password: _, ...safeProfile } = updated[0];
        return successResponse("Profile updated successfully", safeProfile);
    } catch (error) {
        return errorResponse(error.message || "Failed to update profile");
    }
}


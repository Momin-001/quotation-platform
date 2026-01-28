import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { errorResponse, successResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";  
import { verifySuperAdmin } from "@/lib/auth-helpers";

export async function POST(req) {
    try {
        // Verify super_admin access
        const { isSuperAdmin, error } = await verifySuperAdmin();
        if (!isSuperAdmin) {
            return errorResponse(error || "Forbidden: Super admin access required", 403);
        }

        const body = await req.json();
        const { fullName, email, password, companyName, phoneNumber } = body;

        // Validate required fields
        if (!fullName || !email || !password || !phoneNumber) {
            return errorResponse("Full name, email, password, and phone number are required", 400);
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return errorResponse("Invalid email format", 400);
        }

        // Validate password length
        if (password.length < 6) {
            return errorResponse("Password must be at least 6 characters", 400);
        }

        // Check if user already exists
        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .then((res) => res[0]);

        if (existingUser) {
            return errorResponse("User with this email already exists", 409);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new admin user
        const newAdmin = await db
            .insert(users)
            .values({
                fullName,
                email,
                password: hashedPassword,
                companyName: companyName || null,
                phoneNumber: phoneNumber, // Required field
                role: "admin", // Always set to "admin" when created by super_admin
                isActive: true, // Admins are active by default
            })
            .returning();

        // Remove password from response
        const { password: _, ...adminWithoutPassword } = newAdmin[0];

        return successResponse("Admin user created successfully", adminWithoutPassword);
    } catch (error) {
        return errorResponse(error.message || "Failed to create admin user");
    }
}


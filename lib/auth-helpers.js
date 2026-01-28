import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@/lib/constants";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCurrentUser() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return { user: null, error: "Unauthorized" };
        }

        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return { user: null, error: "Invalid token" };
        }

        const user = await db
            .select()
            .from(users)
            .where(eq(users.id, decoded.id))
            .then((res) => res[0]);

        if (!user) {
            return { user: null, error: "User not found" };
        }

        return { user, error: null };
    } catch (error) {
        console.error("Error getting current user:", error);
        return { user: null, error: "Internal Server Error" };
    }
}

export async function verifySuperAdmin() {
    const { user, error } = await getCurrentUser();
    
    if (error || !user) {
        return { isSuperAdmin: false, user: null, error: error || "Unauthorized" };
    }

    if (user.role !== "super_admin") {
        return { isSuperAdmin: false, user, error: "Forbidden: Super admin access required" };
    }

    return { isSuperAdmin: true, user, error: null };
}


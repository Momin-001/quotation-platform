import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { desc, ilike, or, ne, and } from "drizzle-orm";
import { verifySuperAdmin } from "@/lib/helpers/auth-helpers";

export async function GET(req) {
    try {
        // Verify super_admin access
        const { isSuperAdmin } = await verifySuperAdmin();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";

        const offset = (page - 1) * limit;

        // If super_admin, show all users (including admins). Otherwise, exclude admins and super_admins
        let whereClause;
        if (isSuperAdmin) {
            // Super admin can see all users except other super_admins
            whereClause = ne(users.role, 'super_admin');
        } else {
            // Regular admin can only see regular users
            whereClause = and(
                ne(users.role, 'admin'),
                ne(users.role, 'super_admin')
            );
        }

        if (search) {
            whereClause = and(
                whereClause,
                or(
                    ilike(users.fullName, `%${search}%`),
                    ilike(users.email, `%${search}%`)
                )
            );
        }

        // Note: Drizzle doesn't support .count() easily with query builder in one go without distinct query
        // For infinite scroll, we just return the data. Client detects end when data.length < limit.

        const data = await db
            .select()
            .from(users)
            .where(whereClause)
            .orderBy(desc(users.createdAt))
            .limit(limit)
            .offset(offset);

        // Remove passwords
        const sanitizedData = data.map(user => {
            const { password, ...rest } = user;
            return rest;
        });

        return successResponse("Users fetched successfully", sanitizedData);
    } catch (error) {
        console.error("GET /api/admin/users error:", error);
        return errorResponse("Failed to fetch users", 500);
    }
}

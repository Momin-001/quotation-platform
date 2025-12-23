import { db } from "@/lib/db";
import { users } from "@/drizzle/schema/users";
import { successResponse, errorResponse } from "@/lib/api-response";
import { desc, ilike, or, ne, and } from "drizzle-orm";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";

        const offset = (page - 1) * limit;

        let whereClause = ne(users.role, 'admin');

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

        return successResponse(sanitizedData, "Users fetched successfully");
    } catch (error) {
        console.error("Error fetching users:", error);
        return errorResponse("Failed to fetch users", 500);
    }
}

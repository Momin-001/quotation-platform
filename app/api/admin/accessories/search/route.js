import { db } from "@/lib/db";
import { accessories } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { desc, ilike, or, eq, and, sql } from "drizzle-orm";

// GET /api/admin/accessories/search - Searchable accessories with pagination
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const offset = (page - 1) * limit;

        const activeOnly = eq(accessories.isActive, true);
        const whereClause = search.trim()
            ? and(
                  activeOnly,
                  or(
                      ilike(accessories.productName, `%${search}%`),
                      ilike(accessories.productNumber, `%${search}%`)
                  )
              )
            : activeOnly;

        const accessoriesList = await db
            .select({
                id: accessories.id,
                productName: accessories.productName,
                productNumber: accessories.productNumber,
                productGroup: accessories.productGroup,
                retailPrice: accessories.retailPrice,
            })
            .from(accessories)
            .where(whereClause)
            .orderBy(desc(accessories.createdAt))
            .limit(limit)
            .offset(offset);

        const items = accessoriesList.map((a) => ({
            ...a,
            imageUrl: null,
            sourceType: "accessory",
            displayLabel: `[${a.productGroup}] ${a.productName}`,
            subtitle: a.productNumber,
        }));

        const totalResult = await db
            .select({ count: sql`count(*)` })
            .from(accessories)
            .where(whereClause);

        const total = parseInt(totalResult[0]?.count || 0);
        const totalPages = Math.ceil(total / limit);
        const hasMore = page < totalPages;

        return successResponse("Accessories fetched successfully", {
            items,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasMore,
            },
        });
    } catch (error) {
        console.error("GET /api/admin/accessories/search error:", error);
        return errorResponse("Failed to fetch accessories", 500);
    }
}

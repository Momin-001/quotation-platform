import { db } from "@/lib/db";
import { controllers } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { desc, ilike, or, eq, and, sql } from "drizzle-orm";

// GET /api/admin/controllers/search - Searchable controllers with pagination
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const offset = (page - 1) * limit;

        const activeOnly = eq(controllers.isActive, true);
        const searchPattern = `%${search.trim()}%`;
        const searchOr = search.trim()
            ? or(
                  ilike(controllers.interfaceName, searchPattern),
                  ilike(controllers.controllerNumber, searchPattern),
                  ilike(controllers.brandNameOther, searchPattern),
                  sql`(${controllers.brandName})::text ILIKE ${searchPattern}`
              )
            : undefined;
        const whereClause = searchOr ? and(activeOnly, searchOr) : activeOnly;

        const controllersList = await db
            .select({
                id: controllers.id,
                productName: controllers.interfaceName,
                brandName: controllers.brandName,
                controllerNumber: controllers.controllerNumber,
                pricePerControllerUsd: controllers.pricePerControllerUsd,
            })
            .from(controllers)
            .where(whereClause)
            .orderBy(desc(controllers.createdAt))
            .limit(limit)
            .offset(offset);

        const items = controllersList.map((c) => ({
            ...c,
            productNumber: c.controllerNumber || c.brandName || c.id?.slice(0, 8),
            imageUrl: null,
            sourceType: "controller",
            displayLabel: `[Controller] ${c.productName}`,
            subtitle: c.brandName || "N/A",
        }));

        const totalResult = await db
            .select({ count: sql`count(*)` })
            .from(controllers)
            .where(whereClause);

        const total = parseInt(totalResult[0]?.count || 0);
        const totalPages = Math.ceil(total / limit);
        const hasMore = page < totalPages;

        return successResponse("Controllers fetched successfully", {
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
        console.error("GET /api/admin/controllers/search error:", error);
        return errorResponse("Failed to fetch controllers", 500);
    }
}

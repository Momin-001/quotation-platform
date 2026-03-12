import { db } from "@/lib/db";
import { accessories } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq, ilike, or, and, asc } from "drizzle-orm";

// GET /api/accessories - Search accessories (public, for Leditor dropdown)
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search") || "";

        const conditions = [eq(accessories.isActive, true)];

        if (search.trim()) {
            conditions.push(
                or(
                    ilike(accessories.productName, `%${search.trim()}%`),
                    ilike(accessories.productNumber, `%${search.trim()}%`),
                    ilike(accessories.productGroup, `%${search.trim()}%`),
                )
            );
        }

        const allAccessories = await db
            .select({
                id: accessories.id,
                productName: accessories.productName,
                productNumber: accessories.productNumber,
                productGroup: accessories.productGroup,
                unit: accessories.unit,
            })
            .from(accessories)
            .where(and(...conditions))
            .orderBy(asc(accessories.productName))
            .limit(50);

        return successResponse("Accessories fetched successfully", allAccessories);
    } catch (error) {
        return errorResponse(error.message || "Failed to fetch accessories");
    }
}

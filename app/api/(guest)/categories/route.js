import { db } from "@/lib/db";
import { categories } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { asc } from "drizzle-orm";

export async function GET() {
    try {
        const allCategories = await db
            .select({
                id: categories.id,
                name: categories.name,
                titleEn: categories.titleEn,
                titleDe: categories.titleDe,
                descriptionEn: categories.descriptionEn,
                descriptionDe: categories.descriptionDe,
                imageUrl: categories.imageUrl,
                features: categories.features,
            })
            .from(categories)
            .orderBy(asc(categories.name));

        return successResponse("Categories fetched successfully", allCategories);
    } catch (error) {
        console.error("GET /api/categories error:", error);
        return errorResponse("Failed to fetch categories", 500);
    }
}

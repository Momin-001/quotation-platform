import { db } from "@/lib/db";
import { categories } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import {
    HOMEPAGE_SHOWCASE_CATEGORY_NAMES,
    orderShowcaseCategories,
} from "@/lib/helpers/category-helpers";
import { or, ilike } from "drizzle-orm";

const showcaseNameFilters = HOMEPAGE_SHOWCASE_CATEGORY_NAMES.map((name) =>
    ilike(categories.name, name)
);

export async function GET() {
    try {
        const rows = await db
            .select({
                id: categories.id,
                name: categories.name,
                slug: categories.slug,
                titleEn: categories.titleEn,
                titleDe: categories.titleDe,
                descriptionEn: categories.descriptionEn,
                descriptionDe: categories.descriptionDe,
                imageUrl: categories.imageUrl,
                features: categories.features,
            })
            .from(categories)
            .where(or(...showcaseNameFilters));

        const data = orderShowcaseCategories(rows);

        return successResponse("Showcase categories fetched successfully", data);
    } catch (error) {
        console.error("GET /api/categories/showcase error:", error);
        return errorResponse("Failed to fetch showcase categories", 500);
    }
}

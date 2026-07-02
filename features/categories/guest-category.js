import { cache } from "react";
import { db } from "@/lib/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";

const CATEGORY_COLUMNS = {
    id: categories.id,
    name: categories.name,
    slug: categories.slug,
    titleEn: categories.titleEn,
    titleDe: categories.titleDe,
    descriptionEn: categories.descriptionEn,
    descriptionDe: categories.descriptionDe,
};

/**
 * Resolve a category by its slug for the category listing pages.
 * Cached per request so generateMetadata and the page share one query.
 */
export const fetchCategoryBySlug = cache(async function fetchCategoryBySlug(slug) {
    if (!slug) return null;
    const [category] = await db
        .select(CATEGORY_COLUMNS)
        .from(categories)
        .where(eq(categories.slug, slug))
        .limit(1);
    return category ?? null;
});

/** All category slugs for sitemap generation. */
export async function fetchCategorySlugsForSitemap() {
    return db
        .select({ slug: categories.slug, updatedAt: categories.updatedAt })
        .from(categories);
}

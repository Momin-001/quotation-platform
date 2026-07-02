import { db } from "@/lib/db";
import { categories } from "@/db/schema";
import { eq, ne, and } from "drizzle-orm";
import { slugify } from "@/lib/helpers/slugify";

export { slugify };

/** Check whether a slug is already used by another category. */
export async function isCategorySlugTaken(slug, excludeCategoryId) {
    const conditions = [eq(categories.slug, slug)];
    if (excludeCategoryId) {
        conditions.push(ne(categories.id, excludeCategoryId));
    }

    const existing = await db
        .select({ id: categories.id })
        .from(categories)
        .where(and(...conditions))
        .limit(1);

    return existing.length > 0;
}

/**
 * Generate a unique slug from the category name, appending -2, -3, ... if needed.
 */
export async function generateUniqueCategorySlug(name, { excludeCategoryId } = {}) {
    const baseSlug = slugify(name);
    if (!baseSlug) return "";

    let candidate = baseSlug;
    let counter = 2;
    while (await isCategorySlugTaken(candidate, excludeCategoryId)) {
        candidate = `${baseSlug}-${counter}`;
        counter += 1;
    }
    return candidate;
}

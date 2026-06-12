import { db } from "@/lib/db";
import { products } from "@/db/schema";
import { eq, ne, and } from "drizzle-orm";
import { slugify } from "@/lib/helpers/slugify";

export { slugify };

/** Check whether a slug is already used by another product. */
export async function isProductSlugTaken(slug, excludeProductId) {
    const conditions = [eq(products.slug, slug)];
    if (excludeProductId) {
        conditions.push(ne(products.id, excludeProductId));
    }

    const existing = await db
        .select({ id: products.id })
        .from(products)
        .where(and(...conditions))
        .limit(1);

    return existing.length > 0;
}

/**
 * Generate a unique slug from the product name, appending -2, -3, ... if needed.
 * Used by bulk import, where collisions must be resolved automatically.
 */
export async function generateUniqueProductSlug(productName, { excludeProductId } = {}) {
    const baseSlug = slugify(productName);
    if (!baseSlug) return "";

    let candidate = baseSlug;
    let counter = 2;
    while (await isProductSlugTaken(candidate, excludeProductId)) {
        candidate = `${baseSlug}-${counter}`;
        counter += 1;
    }
    return candidate;
}

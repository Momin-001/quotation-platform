import { db } from "@/lib/db";
import { refurbishedProducts } from "@/db/schema";
import { eq, ne, and } from "drizzle-orm";
import { slugify } from "@/lib/helpers/slugify";

export { slugify };

/** Check whether a slug is already used by another refurbished product. */
export async function isRefurbishedSlugTaken(slug, excludeId) {
    const conditions = [eq(refurbishedProducts.slug, slug)];
    if (excludeId) {
        conditions.push(ne(refurbishedProducts.id, excludeId));
    }

    const existing = await db
        .select({ id: refurbishedProducts.id })
        .from(refurbishedProducts)
        .where(and(...conditions))
        .limit(1);

    return existing.length > 0;
}

import { db } from "@/lib/db";
import { blogs } from "@/db/schema";
import { eq, ne, and } from "drizzle-orm";
import { slugify } from "@/lib/helpers/slugify";

export { slugify };

/** Check whether a slug is already used by another blog. */
export async function isBlogSlugTaken(slug, excludeBlogId) {
    const conditions = [eq(blogs.slug, slug)];
    if (excludeBlogId) {
        conditions.push(ne(blogs.id, excludeBlogId));
    }

    const existing = await db
        .select({ id: blogs.id })
        .from(blogs)
        .where(and(...conditions))
        .limit(1);

    return existing.length > 0;
}

/**
 * Generate a unique slug from the blog title, appending -2, -3, ... if needed.
 * Returns "" when the title has no slug-able characters.
 */
export async function generateUniqueBlogSlug(title, { excludeBlogId } = {}) {
    const baseSlug = slugify(title);
    if (!baseSlug) return "";

    let candidate = baseSlug;
    let counter = 2;
    while (await isBlogSlugTaken(candidate, excludeBlogId)) {
        candidate = `${baseSlug}-${counter}`;
        counter += 1;
    }
    return candidate;
}

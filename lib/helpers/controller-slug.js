import { db } from "@/lib/db";
import { controllers } from "@/db/schema";
import { eq, ne, and } from "drizzle-orm";
import { slugify } from "@/lib/helpers/slugify";

export { slugify };

/** Check whether a slug is already used by another controller. */
export async function isControllerSlugTaken(slug, excludeControllerId) {
    const conditions = [eq(controllers.slug, slug)];
    if (excludeControllerId) {
        conditions.push(ne(controllers.id, excludeControllerId));
    }

    const existing = await db
        .select({ id: controllers.id })
        .from(controllers)
        .where(and(...conditions))
        .limit(1);

    return existing.length > 0;
}

/**
 * Generate a unique slug from the controller interface name, appending
 * -2, -3, ... on collision. Returns "" when the name has no slug-able characters.
 */
export async function generateUniqueControllerSlug(interfaceName, { excludeControllerId } = {}) {
    const baseSlug = slugify(interfaceName);
    if (!baseSlug) return "";

    let candidate = baseSlug;
    let counter = 2;
    while (await isControllerSlugTaken(candidate, excludeControllerId)) {
        candidate = `${baseSlug}-${counter}`;
        counter += 1;
    }
    return candidate;
}

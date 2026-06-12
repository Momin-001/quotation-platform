import { products } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const UMLAUT_MAP = {
    ä: "ae",
    ö: "oe",
    ü: "ue",
    ß: "ss",
    Ä: "ae",
    Ö: "oe",
    Ü: "ue",
};

/** Convert product name to URL slug (client + server). */
export function slugifyProductName(name) {
    if (!name || typeof name !== "string") return "";

    let value = name.trim();
    for (const [char, replacement] of Object.entries(UMLAUT_MAP)) {
        value = value.split(char).join(replacement);
    }

    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/-{2,}/g, "-");
}

export function isUuid(value) {
    return typeof value === "string" && UUID_REGEX.test(value);
}

/** Guest routes: lookup by slug, or by legacy UUID in the URL segment. */
export function getGuestProductParamCondition(param) {
    if (isUuid(param)) {
        return eq(products.id, param);
    }
    return eq(products.slug, param);
}

/** Pick a unique slug during backfill only (appends -2, -3, …). */
export function resolveUniqueSlugForBackfill(baseSlug, usedSlugs) {
    if (!baseSlug) return "";
    if (!usedSlugs.has(baseSlug)) {
        usedSlugs.add(baseSlug);
        return baseSlug;
    }
    let counter = 2;
    while (usedSlugs.has(`${baseSlug}-${counter}`)) {
        counter += 1;
    }
    const unique = `${baseSlug}-${counter}`;
    usedSlugs.add(unique);
    return unique;
}

export async function isProductSlugAvailable(db, slug, { excludeProductId } = {}) {
    if (!slug) return false;

    const conditions = [eq(products.slug, slug)];
    if (excludeProductId) {
        conditions.push(ne(products.id, excludeProductId));
    }

    const existing = await db
        .select({ id: products.id })
        .from(products)
        .where(excludeProductId ? and(...conditions) : conditions[0])
        .limit(1);

    return existing.length === 0;
}

export async function assertProductSlugAvailable(db, slug, { excludeProductId } = {}) {
    const available = await isProductSlugAvailable(db, slug, { excludeProductId });
    if (!available) {
        const error = new Error("A product with this URL slug already exists");
        error.statusCode = 409;
        throw error;
    }
}

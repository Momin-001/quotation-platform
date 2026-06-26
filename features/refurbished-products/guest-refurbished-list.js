import { db } from "@/lib/db";
import { refurbishedProducts } from "@/db/schema";
import { desc, eq, and, sql } from "drizzle-orm";

/** Columns needed for guest refurbished cards (listing grid). Admin-only price/notes are excluded. */
const LISTING_COLUMNS = {
    id: true,
    slug: true,
    serie: true,
    productNumber: true,
    productDescription: true,
    oemBrand: true,
    sellingPrice: true,
    levelOfQuality: true,
    design: true,
    specialTypes: true,
};

const LISTING_RELATIONS = {
    areaOfUse: { columns: { name: true } },
    images: { columns: { imageUrl: true } },
};

/** Flatten Drizzle rows to the shape used by the refurbished listing UI/API. */
export function formatGuestRefurbishedListing(rows) {
    return rows.map((p) => ({
        id: p.id,
        slug: p.slug,
        serie: p.serie,
        productName: p.serie, // alias for card reuse
        productNumber: p.productNumber,
        productDescription: p.productDescription,
        oemBrand: p.oemBrand,
        sellingPrice: p.sellingPrice,
        levelOfQuality: p.levelOfQuality,
        design: p.design,
        specialTypes: p.specialTypes,
        areaOfUse: p.areaOfUse?.name ?? null,
        images: (p.images ?? []).map((image) => image.imageUrl),
    }));
}

/** Fetch active refurbished products for the listing page (server or API). */
export async function fetchGuestRefurbishedListing({ limit = 10, offset = 0, whereClause } = {}) {
    const where = whereClause ?? and(eq(refurbishedProducts.isActive, true));

    const rows = await db.query.refurbishedProducts.findMany({
        where,
        orderBy: desc(refurbishedProducts.createdAt),
        limit,
        offset,
        columns: LISTING_COLUMNS,
        with: LISTING_RELATIONS,
    });

    return formatGuestRefurbishedListing(rows);
}

/** Pixel-pitch min/max across active refurbished products, for the listing range filter. */
export async function fetchRefurbishedPixelPitchBounds() {
    const [row] = await db
        .select({
            min: sql`MIN(${refurbishedProducts.pixelPitch})`,
            max: sql`MAX(${refurbishedProducts.pixelPitch})`,
        })
        .from(refurbishedProducts)
        .where(eq(refurbishedProducts.isActive, true));

    const min = row?.min != null ? Number(row.min) : 0.1;
    const max = row?.max != null ? Number(row.max) : 30;
    // Guard against equal/invalid bounds so the slider stays usable
    return {
        pixelPitchMin: Number.isFinite(min) ? min.toFixed(2) : "0.10",
        pixelPitchMax: Number.isFinite(max) && max > min ? max.toFixed(2) : (min + 1).toFixed(2),
    };
}

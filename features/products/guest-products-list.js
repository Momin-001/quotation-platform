import { db } from "@/lib/db";
import { products } from "@/db/schema";
import { desc, eq, and } from "drizzle-orm";

/** Columns needed for guest product cards (listing grid). */
const LISTING_COLUMNS = {
    id: true,
    slug: true,
    productName: true,
    productNumber: true,
    productDescription: true,
    oemBrand: true,
};

const LISTING_RELATIONS = {
    areaOfUse: {
        columns: {
            name: true,
        },
    },
    images: {
        columns: {
            imageUrl: true,
        },
    },
};

/**
 * Format raw Drizzle product rows for the guest listing UI / API.
 * Strips relation nesting to the flat shape expected by ProductCard.
 */
export function formatGuestProductsListing(rows) {
    return rows.map((product) => ({
        id: product.id,
        slug: product.slug,
        productName: product.productName,
        productNumber: product.productNumber,
        productDescription: product.productDescription,
        oemBrand: product.oemBrand,
        areaOfUse: product.areaOfUse?.name ?? null,
        images: (product.images ?? []).map((image) => image.imageUrl),
    }));
}

/**
 * Fetch active guest products for the listing page (server or API).
 */
export async function fetchGuestProductsListing({
    limit = 10,
    offset = 0,
    whereClause,
} = {}) {
    const where = whereClause ?? and(eq(products.isActive, true));

    const rows = await db.query.products.findMany({
        where,
        orderBy: desc(products.createdAt),
        limit,
        offset,
        columns: LISTING_COLUMNS,
        with: LISTING_RELATIONS,
    });

    return formatGuestProductsListing(rows);
}

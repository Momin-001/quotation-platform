import { db } from "@/lib/db";
import { blogs } from "@/db/schema";
import { desc } from "drizzle-orm";

/** Columns needed for guest blog cards (listing grid). */
const LISTING_COLUMNS = {
    id: blogs.id,
    title: blogs.title,
    slug: blogs.slug,
    authorName: blogs.authorName,
    mainImageUrl: blogs.mainImageUrl,
    createdAt: blogs.createdAt,
};

/**
 * Fetch blogs for the guest listing page, homepage section, or API.
 * @param {{ limit?: number }} options — omit or 0 for all rows
 */
export async function fetchGuestBlogsListing({ limit = 0 } = {}) {
    let query = db.select(LISTING_COLUMNS).from(blogs).orderBy(desc(blogs.createdAt));

    if (limit > 0) {
        query = query.limit(limit);
    }

    return query;
}

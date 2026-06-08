import { db } from "@/lib/db";
import { faqs } from "@/db/schema";
import { asc } from "drizzle-orm";

/**
 * Fetch FAQs for the guest listing page, homepage section, or API.
 * @param {{ limit?: number }} options — omit or 0 for all rows
 */
export async function fetchGuestFaqsListing({ limit = 0 } = {}) {
    let query = db.select().from(faqs).orderBy(asc(faqs.createdAt));

    if (limit > 0) {
        query = query.limit(limit);
    }

    return query;
}

import { db } from "@/lib/db";
import { pageSeo } from "@/db/schema";
import { PAGE_SEO_ORDER, defaultPageSeoRow } from "@/lib/i18n/seo-pages";

/**
 * Seed the page_seo table from the static SEO_PAGES defaults.
 * Non-destructive: existing rows (e.g. admin-edited copy) are left untouched —
 * only missing pageKeys are inserted. Safe to run repeatedly.
 */
export async function seedPageSeo() {
    try {
        const rows = PAGE_SEO_ORDER.map((p) => defaultPageSeoRow(p.key));

        await db
            .insert(pageSeo)
            .values(rows)
            .onConflictDoNothing({ target: pageSeo.pageKey });

        console.log("Page SEO seeded successfully ✅");
    } catch (error) {
        console.error("Error seeding page SEO:", error);
    }
}

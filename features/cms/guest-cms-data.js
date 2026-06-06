import { unstable_cache } from "next/cache";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { navbar, footer, homepage, partners, faqs } from "@/db/schema";
import { fetchGuestBlogsListing } from "@/features/blogs/guest-blogs-list";
import { defaultNavbarData, defaultFooterData, defaultHomepageData } from "@/lib/data/default_cms_data";
const REVALIDATE_SECONDS = 900;

async function fetchNavbarRow() {
    const [row] = await db.select().from(navbar).limit(1);
    return row ?? null;
}

async function fetchFooterRow() {
    const [row] = await db.select().from(footer).limit(1);
    return row ?? null;
}

async function fetchHomepageRow() {
    const [row] = await db.select().from(homepage).limit(1);
    return row ?? null;
}

async function fetchPartnersRows() {
    return db
        .select({
            id: partners.id,
            name: partners.name,
            type: partners.type,
            logoUrl: partners.logoUrl,
            websiteUrl: partners.websiteUrl,
        })
        .from(partners)
        .orderBy(partners.name);
}

async function fetchFaqsRows(limit) {
    const rows = await db.select().from(faqs).orderBy(asc(faqs.createdAt));
    if (limit && limit > 0) {
        return rows.slice(0, limit);
    }
    return rows;
}

async function fetchBlogsRows(limit) {
    return fetchGuestBlogsListing({ limit: limit && limit > 0 ? limit : 0 });
}

const getCachedNavbarRow = unstable_cache(fetchNavbarRow, ["guest-navbar"], {
    revalidate: REVALIDATE_SECONDS,
});

const getCachedFooterRow = unstable_cache(fetchFooterRow, ["guest-footer"], {
    revalidate: REVALIDATE_SECONDS,
});

const getCachedHomepageRow = unstable_cache(fetchHomepageRow, ["guest-homepage"], {
    revalidate: REVALIDATE_SECONDS,
});

const getCachedPartnersRows = unstable_cache(fetchPartnersRows, ["guest-partners"], {
    revalidate: REVALIDATE_SECONDS,
});

const getCachedFaqsRows = unstable_cache(
    async () => fetchFaqsRows(6),
    ["guest-faqs-home"],
    { revalidate: REVALIDATE_SECONDS }
);

const getCachedBlogsRows = unstable_cache(
    async () => fetchBlogsRows(6),
    ["guest-blogs-home"],
    { revalidate: REVALIDATE_SECONDS }
);

export async function getGuestLayoutData() {
    const [navbarRow, footerRow] = await Promise.all([
        getCachedNavbarRow(),
        getCachedFooterRow(),
    ]);

    return {
        navbarData: navbarRow ?? defaultNavbarData,
        footerData: footerRow ?? defaultFooterData,
    };
}

export async function getGuestHomeData() {
    const [homepageRow, allPartners, faqsList, blogsList] = await Promise.all([
        getCachedHomepageRow(),
        getCachedPartnersRows(),
        getCachedFaqsRows(),
        getCachedBlogsRows(),
    ]);

    const technologyPartners = allPartners.filter((p) => !p.type || p.type === "technology");
    const marketingPartners = allPartners.filter((p) => p.type === "marketing");

    return {
        homepageData: homepageRow ? { ...defaultHomepageData, ...homepageRow } : defaultHomepageData,
        technologyPartners,
        marketingPartners,
        faqs: faqsList,
        blogs: blogsList,
    };
}

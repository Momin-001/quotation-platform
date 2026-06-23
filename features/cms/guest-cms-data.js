import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { footer, homepage, partners, categories } from "@/db/schema";
import { or, ilike } from "drizzle-orm";
import { fetchGuestBlogsListing } from "@/features/blogs/guest-blogs-list";
import { fetchGuestFaqsListing } from "@/features/faqs/guest-faqs-list";
import { defaultHomepageData } from "@/lib/data/default_cms_data";
import { HOMEPAGE_SHOWCASE_CATEGORY_NAMES, orderShowcaseCategories } from "@/lib/helpers/category-helpers";
const REVALIDATE_SECONDS = 900;

async function fetchPrivacyPolicyPdfUrl() {
    const [row] = await db
        .select({ privacyPolicyPdfUrl: footer.privacyPolicyPdfUrl })
        .from(footer)
        .limit(1);
    return row?.privacyPolicyPdfUrl ?? null;
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
    return fetchGuestFaqsListing({ limit: limit && limit > 0 ? limit : 0 });
}

async function fetchBlogsRows(limit) {
    return fetchGuestBlogsListing({ limit: limit && limit > 0 ? limit : 0 });
}

async function fetchShowcaseCategories() {
    const nameFilters = HOMEPAGE_SHOWCASE_CATEGORY_NAMES.map((name) =>
        ilike(categories.name, name)
    );
    const rows = await db
        .select({
            id: categories.id,
            name: categories.name,
            titleEn: categories.titleEn,
            titleDe: categories.titleDe,
            descriptionEn: categories.descriptionEn,
            descriptionDe: categories.descriptionDe,
            imageUrl: categories.imageUrl,
            features: categories.features,
        })
        .from(categories)
        .where(or(...nameFilters));
    return orderShowcaseCategories(rows);
}

const getCachedPrivacyPolicyPdfUrl = unstable_cache(
    fetchPrivacyPolicyPdfUrl,
    ["guest-privacy-policy-pdf"],
    { revalidate: REVALIDATE_SECONDS }
);

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

const getCachedShowcaseCategories = unstable_cache(
    fetchShowcaseCategories,
    ["guest-showcase-categories"],
    { revalidate: REVALIDATE_SECONDS }
);

export async function getPrivacyPolicyPdfUrl() {
    return getCachedPrivacyPolicyPdfUrl();
}

export async function getGuestHomeData() {
    const [homepageRow, allPartners, faqsList, blogsList, showcaseCategories] = await Promise.all([
        getCachedHomepageRow(),
        getCachedPartnersRows(),
        getCachedFaqsRows(),
        getCachedBlogsRows(),
        getCachedShowcaseCategories(),
    ]);

    const technologyPartners = allPartners.filter((p) => !p.type || p.type === "technology");
    const marketingPartners = allPartners.filter((p) => p.type === "marketing");

    return {
        homepageData: homepageRow ? { ...defaultHomepageData, ...homepageRow } : defaultHomepageData,
        technologyPartners,
        marketingPartners,
        faqs: faqsList,
        blogs: blogsList,
        showcaseCategories,
    };
}

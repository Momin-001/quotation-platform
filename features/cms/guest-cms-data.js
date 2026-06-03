import { unstable_cache } from "next/cache";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { navbar, footer, homepage, partners, faqs } from "@/db/schema";
import { fetchGuestBlogsListing } from "@/features/blogs/guest-blogs-list";

const REVALIDATE_SECONDS = 900;

export const defaultNavbarData = {
    navItem1En: "HOME",
    navItem1De: "STARTSEITE",
    navItem2En: "PRODUCTS",
    navItem2De: "PRODUKTE",
    navItem3En: "CONTROLLERS",
    navItem3De: "CONTROLLER",
    navItem4En: "LEDITOR",
    navItem4De: "LEDITOR",
    navItem5En: "BLOGS",
    navItem5De: "BLOGS",
    navItem6En: "BECOME PARTNERS",
    navItem6De: "PARTNER WERDEN",
};

export const defaultFooterData = {
    descriptionEn:
        "PROLEDALL is a platform that allows you to get quotes for your LED products. We are a team of experts who are dedicated to providing the best possible service to our clients.",
    descriptionDe:
        "PROLEDALL ist eine Plattform, die es Ihnen ermöglicht, Angebote für Ihre LED-Produkte zu erhalten. Wir sind ein Team von Experten, die sich der Bereitstellung des bestmöglichen Service für unsere Kunden widmen.",
    ourAddressTitleEn: "Our Address",
    ourAddressTitleDe: "Unsere Adresse",
    quickLinksTitleEn: "Quick Links",
    quickLinksTitleDe: "Schnelllinks",
    quickLink1En: "About",
    quickLink1De: "Über uns",
    quickLink2En: "Blogs",
    quickLink2De: "Blogs",
    quickLink3En: "Projects",
    quickLink3De: "Projekte",
    quickLink4En: "Contact Us",
    quickLink4De: "Kontaktieren Sie uns",
    quickLink5En: "Help",
    quickLink5De: "Hilfe",
    newsletterTitleEn: "Newsletter",
    newsletterTitleDe: "Newsletter",
    copyrightTextEn: "© Copyright Quotation Platform. All Right Reserved",
    copyrightTextDe: "© Copyright Quotationsplattform. Alle Rechte vorbehalten",
};

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

export async function getGuestHomeData(defaultHomepageData) {
    const [homepageRow, allPartners, faqsList, blogsList] = await Promise.all([
        getCachedHomepageRow(),
        getCachedPartnersRows(),
        getCachedFaqsRows(),
        getCachedBlogsRows(),
    ]);

    const technologyPartners = allPartners.filter(
        (p) => !p.type || p.type === "technology"
    );
    const marketingPartners = allPartners.filter((p) => p.type === "marketing");

    return {
        homepageData: homepageRow
            ? { ...defaultHomepageData, ...homepageRow }
            : defaultHomepageData,
        technologyPartners,
        marketingPartners,
        faqs: faqsList,
        blogs: blogsList,
    };
}

import { cache } from "react";
import { eq } from "drizzle-orm";
import { routing } from "@/i18n/routing";
import { BASE_URL } from "@/lib/constants";
import { db } from "@/lib/db";
import { pageSeo } from "@/db/schema";
import { SEO_PAGES, PAGE_KEY_BY_PATH } from "./seo-pages";

const siteUrl = (BASE_URL || "https://www.proledall.eu").replace(/\/$/, "");

/** Cached per-request lookup of an admin-managed page_seo row. */
const getPageSeoRow = cache(async function getPageSeoRow(pageKey) {
    if (!pageKey) return null;
    try {
        return (await db.query.pageSeo.findFirst({ where: eq(pageSeo.pageKey, pageKey) })) ?? null;
    } catch {
        // DB unavailable / table not migrated yet — fall back to static defaults.
        return null;
    }
});

export function validateLocale(locale) {
    return routing.locales.includes(locale) ? locale : routing.defaultLocale;
}

function normalizePathname(pathname = "") {
    if (!pathname || pathname === "/") 
        return "";
    return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

export function buildAlternates(pathname, locale) {
    const path = normalizePathname(pathname);
    const deUrl = path ? `${siteUrl}${path}` : siteUrl;
    const enUrl = path ? `${siteUrl}/en${path}` : `${siteUrl}/en`;
    const canonical = locale === "en" ? enUrl : deUrl;

    return {
        canonical,
        languages: {
            de: deUrl,
            en: enUrl,
            "x-default": deUrl,
        },
    };
}

/**
 * Build Next.js metadata for a guest page with per-locale title, description, and hreflang.
 * Reads admin-managed copy from the `page_seo` table, falling back to the static
 * SEO_PAGES defaults (and from the empty locale to the other locale).
 * @param {string} pathname - Route without locale prefix (e.g. "/products", "" for home)
 */
export async function guestPageMetadata(pathname, locale) {
    const path = normalizePathname(pathname);
    const fallback = SEO_PAGES[path]?.[locale];
    const pageKey = PAGE_KEY_BY_PATH[path];
    const row = await getPageSeoRow(pageKey);

    if (!fallback && !row)
        return {};

    const pick = (primary, secondary, fb) =>
        primary?.trim() || secondary?.trim() || fb || "";

    const title =
        locale === "de"
            ? pick(row?.titleDe, row?.titleEn, fallback?.title)
            : pick(row?.titleEn, row?.titleDe, fallback?.title);
    const description =
        locale === "de"
            ? pick(row?.descriptionDe, row?.descriptionEn, fallback?.description)
            : pick(row?.descriptionEn, row?.descriptionDe, fallback?.description);

    const metadata = {
        alternates: buildAlternates(path, locale),
    };

    if (title) {
        metadata.title = { absolute: title };
    }
    if (description) {
        metadata.description = description;
    }

    // Robots: an existing row owns the noindex flag; otherwise honor the static default.
    if (row) {
        if (row.noindex) {
            metadata.robots = { index: false, follow: false };
        }
    } else if (fallback?.robots) {
        metadata.robots = fallback.robots;
    }

    return metadata;
}

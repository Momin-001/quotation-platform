import { routing } from "@/i18n/routing";
import { BASE_URL } from "@/lib/constants";
import { SEO_PAGES } from "./seo-pages";

const siteUrl = (BASE_URL || "https://www.proledall.eu").replace(/\/$/, "");

export function validateLocale(locale) {
    return routing.locales.includes(locale) ? locale : routing.defaultLocale;
}

function normalizePathname(pathname = "") {
    if (!pathname || pathname === "/") 
        return "";
    return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

function buildAlternates(pathname, locale) {
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
 * @param {string} pathname - Route without locale prefix (e.g. "/products", "" for home)
 */
export function guestPageMetadata(pathname, locale) {
    const path = normalizePathname(pathname);
    const page = SEO_PAGES[path];

    if (!page) 
        return {};

    const content = page[locale];
    if (!content) 
        return {};

    const metadata = {
        title: { absolute: content.title },
        alternates: buildAlternates(path, locale),
    };

    if (content.description) {
        metadata.description = content.description;
    }
    if (content.robots) {
        metadata.robots = content.robots;
    }

    return metadata;
}

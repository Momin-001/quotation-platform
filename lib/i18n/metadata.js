import { routing } from "@/i18n/routing";
import { BASE_URL } from "@/lib/constants";

const siteUrl = (BASE_URL || "https://www.proledall.eu").replace(/\/$/, "");

/**
 * Build hreflang alternates for a pathname (without locale prefix).
 */
export function localeAlternates(pathname = "", locale = routing.defaultLocale) {
    const path = pathname.startsWith("/") ? pathname : pathname ? `/${pathname}` : "";
    const dePath = path || "/";
    const enPath = path ? `/en${path}` : "/en";
    const canonicalPath = locale === "en" ? enPath : dePath;

    return {
        canonical: `${siteUrl}${canonicalPath}`,
        languages: {
            de: `${siteUrl}${dePath}`,
            en: `${siteUrl}${enPath}`,
            "x-default": `${siteUrl}${dePath}`,
        },
    };
}

export function guestPageAlternates(pathname, locale) {
    return { alternates: localeAlternates(pathname, locale) };
}

export function openGraphLocale(locale) {
    return locale === "de" ? "de_DE" : "en_US";
}

export async function siteTitle(locale) {
    const { getTranslations } = await import("next-intl/server");
    const t = await getTranslations({ locale, namespace: "Metadata" });
    return t("siteTitle");
}

export async function siteDescription(locale) {
    const { getTranslations } = await import("next-intl/server");
    const t = await getTranslations({ locale, namespace: "Metadata" });
    return t("siteDescription");
}

export function validateLocale(locale) {
    return routing.locales.includes(locale) ? locale : routing.defaultLocale;
}

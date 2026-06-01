import { routing } from "@/i18n/routing";

/**
 * Build hreflang alternates for a pathname (without locale prefix).
 */
export function localeAlternates(pathname = "") {
    const path = pathname.startsWith("/") ? pathname : pathname ? `/${pathname}` : "";
    const enPath = path || "/";
    const dePath = path ? `/de${path}` : "/de";

    return {
        canonical: enPath,
        languages: {
            en: enPath,
            de: dePath,
            "x-default": enPath,
        },
    };
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

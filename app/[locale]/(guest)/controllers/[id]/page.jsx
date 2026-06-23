import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { BASE_URL } from "@/lib/constants";
import { validateLocale, buildAlternates } from "@/lib/i18n/metadata";
import { cmsField } from "@/lib/i18n/cms";
import { fetchGuestControllerBySlug } from "@/features/controllers/guest-controller-detail";
import ControllerDetailClient from "./ControllerDetailClient";

const siteUrl = (BASE_URL || "https://www.proledall.eu").replace(/\/$/, "");

// Revalidate the cached page hourly (ISR) — controller data changes infrequently.
export const revalidate = 3600;

function withLocalePrefix(locale, path) {
    if (locale === "en") return path === "/" ? "/en" : `/en${path}`;
    return path;
}

export async function generateMetadata({ params }) {
    const { locale, id } = await params;
    const validLocale = validateLocale(locale);
    const controller = await fetchGuestControllerBySlug(id);

    if (!controller) return {};

    const t = await getTranslations({ locale: validLocale, namespace: "Controllers.detail" });
    const brand = controller.brandDisplay || controller.brandName || "";
    const title =
        cmsField(controller, "metaTitle", validLocale) ||
        controller.interfaceName ||
        t("titleFallback");
    const description =
        cmsField(controller, "metaDescription", validLocale) ||
        controller.interfaceDescription ||
        `${title}${brand ? ` (${brand})` : ""} LED controller available from ProLEDALL.`;
    const path = `/controllers/${controller.slug}`;
    const images = controller.images?.length ? [{ url: controller.images[0] }] : undefined;

    return {
        title,
        description,
        alternates: buildAlternates(path, validLocale),
        openGraph: {
            type: "website",
            title,
            description,
            url: `${siteUrl}${withLocalePrefix(validLocale, path)}`,
            ...(images ? { images } : {}),
        },
    };
}

export default async function ControllerDetailPage({ params }) {
    const { id } = await params;
    const controller = await fetchGuestControllerBySlug(id);

    if (!controller) notFound();

    return <ControllerDetailClient controller={controller} />;
}

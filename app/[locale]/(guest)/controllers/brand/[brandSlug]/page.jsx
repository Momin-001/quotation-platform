import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import SchemaScript from "@/components/guest/SchemaScript";
import ControllersClient from "../../ControllersClient";
import { BASE_URL } from "@/lib/constants";
import { buildAlternates, validateLocale } from "@/lib/i18n/metadata";
import { fetchGuestControllersListing } from "@/features/controllers/guest-controllers-list";
import { controllerBrandFromSlug } from "@/lib/helpers/controller-brands";

const siteUrl = BASE_URL || "https://www.proledall.eu";
const INITIAL_PAGE_SIZE = 10;

export async function generateMetadata({ params }) {
    const { locale, brandSlug } = await params;
    const validLocale = validateLocale(locale);
    const brand = controllerBrandFromSlug(brandSlug);

    if (!brand) return {};

    const t = await getTranslations({
        locale: validLocale,
        namespace: "Controllers.list",
    });

    return {
        title: t("brandTitle", { brand }),
        description: t("brandDescription", { brand }),
        alternates: buildAlternates(`/controllers/brand/${brandSlug}`, validLocale),
    };
}

function withLocalePrefix(locale, path) {
    if (locale === "en") return path === "/" ? "/en" : `/en${path}`;
    return path;
}

export default async function ControllersBrandPage({ params }) {
    const { locale, brandSlug } = await params;
    const validLocale = validateLocale(locale);
    const brand = controllerBrandFromSlug(brandSlug);

    if (!brand) notFound();

    const t = await getTranslations({
        locale: validLocale,
        namespace: "Controllers.list",
    });

    const canonicalPath = withLocalePrefix(locale, `/controllers/brand/${brandSlug}`);

    let initialControllers = [];
    try {
        initialControllers = await fetchGuestControllersListing({
            limit: INITIAL_PAGE_SIZE,
            offset: 0,
            brand,
        });
    } catch {
        initialControllers = [];
    }

    const initialHasMore = initialControllers.length === INITIAL_PAGE_SIZE;

    const itemListSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: t("brandTitle", { brand }),
        url: `${siteUrl}${canonicalPath}`,
        itemListElement: initialControllers.map((c, i) => {
            const controllerUrl = `${siteUrl}${withLocalePrefix(locale, `/controllers/${c.slug}`)}`;
            const item = {
                "@type": "Product",
                name: c.interfaceName,
                url: controllerUrl,
            };

            if (c.images?.length) {
                item.image = c.images[0];
            }
            if (c.controllerNumber) {
                item.sku = c.controllerNumber;
            }
            if (c.brandDisplay) {
                item.brand = { "@type": "Brand", name: c.brandDisplay };
            }

            return {
                "@type": "ListItem",
                position: i + 1,
                item,
            };
        }),
    };

    return (
        <>
            <SchemaScript data={itemListSchema} />
            <ControllersClient
                initialControllers={initialControllers}
                initialHasMore={initialHasMore}
                initialBrand={brand}
            />
        </>
    );
}

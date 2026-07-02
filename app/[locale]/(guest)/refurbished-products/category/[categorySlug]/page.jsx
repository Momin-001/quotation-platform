import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import SchemaScript from "@/components/guest/SchemaScript";
import RefurbishedProductsClient from "../../RefurbishedProductsClient";
import { BASE_URL } from "@/lib/constants";
import { buildAlternates, validateLocale } from "@/lib/i18n/metadata";
import { cmsField } from "@/lib/i18n/cms";
import { refurbishedProducts } from "@/db/schema";
import {
    fetchGuestRefurbishedListing,
    fetchRefurbishedPixelPitchBounds,
} from "@/features/refurbished-products/guest-refurbished-list";
import { fetchCategoryBySlug } from "@/features/categories/guest-category";

const siteUrl = BASE_URL || "https://www.proledall.eu";
const INITIAL_PAGE_SIZE = 10;

export async function generateMetadata({ params }) {
    const { locale, categorySlug } = await params;
    const validLocale = validateLocale(locale);
    const category = await fetchCategoryBySlug(categorySlug);

    if (!category) return {};

    const categoryTitle = cmsField(category, "title", validLocale) || category.name;
    const title =
        validLocale === "de"
            ? `Gebrauchte ${categoryTitle}`
            : `Refurbished ${categoryTitle}`;
    const description = cmsField(category, "description", validLocale);

    const metadata = {
        title,
        alternates: buildAlternates(
            `/refurbished-products/category/${category.slug}`,
            validLocale
        ),
    };
    if (description) {
        metadata.description = description;
    }
    return metadata;
}

function withLocalePrefix(locale, path) {
    if (locale === "en") return path === "/" ? "/en" : `/en${path}`;
    return path;
}

export default async function RefurbishedProductsCategoryPage({ params }) {
    const { locale, categorySlug } = await params;
    const validLocale = validateLocale(locale);
    const category = await fetchCategoryBySlug(categorySlug);

    if (!category) notFound();

    const canonicalPath = withLocalePrefix(
        locale,
        `/refurbished-products/category/${category.slug}`
    );

    let initialProducts = [];
    let filterBounds = { pixelPitchMin: "0.10", pixelPitchMax: "30.00" };

    try {
        [initialProducts, filterBounds] = await Promise.all([
            fetchGuestRefurbishedListing({
                limit: INITIAL_PAGE_SIZE,
                offset: 0,
                whereClause: and(
                    eq(refurbishedProducts.isActive, true),
                    eq(refurbishedProducts.areaOfUseId, category.id)
                ),
            }),
            fetchRefurbishedPixelPitchBounds(),
        ]);
    } catch {
        initialProducts = [];
    }

    const initialHasMore = initialProducts.length === INITIAL_PAGE_SIZE;

    const itemListSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: `Refurbished ${cmsField(category, "title", validLocale) || category.name}`,
        url: `${siteUrl}${canonicalPath}`,
        itemListElement: initialProducts.map((p, i) => {
            const productUrl = `${siteUrl}${withLocalePrefix(locale, `/refurbished-products/${p.slug}`)}`;
            const item = {
                "@type": "Product",
                name: p.productName,
                url: productUrl,
            };

            if (p.images?.length) {
                item.image = p.images[0];
            }
            if (p.productNumber) {
                item.sku = p.productNumber;
            }
            if (p.oemBrand) {
                item.brand = { "@type": "Brand", name: p.oemBrand };
            }
            if (p.productDescription) {
                item.description = p.productDescription;
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
            <RefurbishedProductsClient
                initialProducts={initialProducts}
                initialHasMore={initialHasMore}
                filterBounds={filterBounds}
                initialCategory={category}
            />
        </>
    );
}

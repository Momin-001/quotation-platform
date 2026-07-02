import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import SchemaScript from "@/components/guest/SchemaScript";
import ProductsClient from "../../ProductsClient";
import { BASE_URL } from "@/lib/constants";
import { buildAlternates, validateLocale } from "@/lib/i18n/metadata";
import { cmsField } from "@/lib/i18n/cms";
import { products } from "@/db/schema";
import { fetchGuestProductsListing } from "@/features/products/guest-products-list";
import { fetchCategoryBySlug } from "@/features/categories/guest-category";

const siteUrl = BASE_URL || "https://www.proledall.eu";
const INITIAL_PAGE_SIZE = 10;

export async function generateMetadata({ params }) {
    const { locale, categorySlug } = await params;
    const validLocale = validateLocale(locale);
    const category = await fetchCategoryBySlug(categorySlug);

    if (!category) return {};

    const title = cmsField(category, "title", validLocale) || category.name;
    const description = cmsField(category, "description", validLocale);

    const metadata = {
        title,
        alternates: buildAlternates(`/products/category/${category.slug}`, validLocale),
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

export default async function ProductsCategoryPage({ params }) {
    const { locale, categorySlug } = await params;
    const validLocale = validateLocale(locale);
    const category = await fetchCategoryBySlug(categorySlug);

    if (!category) notFound();

    const canonicalPath = withLocalePrefix(locale, `/products/category/${category.slug}`);

    let initialProducts = [];
    try {
        initialProducts = await fetchGuestProductsListing({
            limit: INITIAL_PAGE_SIZE,
            offset: 0,
            whereClause: and(
                eq(products.isActive, true),
                eq(products.areaOfUseId, category.id)
            ),
        });
    } catch {
        initialProducts = [];
    }

    const initialHasMore = initialProducts.length === INITIAL_PAGE_SIZE;

    const itemListSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: cmsField(category, "title", validLocale) || category.name,
        url: `${siteUrl}${canonicalPath}`,
        itemListElement: initialProducts.map((p, i) => {
            const productUrl = `${siteUrl}${withLocalePrefix(locale, `/products/${p.slug}`)}`;
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
            <ProductsClient
                initialProducts={initialProducts}
                initialHasMore={initialHasMore}
                initialCategory={category}
            />
        </>
    );
}

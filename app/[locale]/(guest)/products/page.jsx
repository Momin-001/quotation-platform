import SchemaScript from "@/components/guest/SchemaScript";
import ProductsClient from "./ProductsClient";
import { BASE_URL } from "@/lib/constants";
import { guestPageMetadata, validateLocale } from "@/lib/i18n/metadata";
import { fetchGuestProductsListing } from "@/features/products/guest-products-list";

const siteUrl = BASE_URL || "https://www.proledall.eu";
const INITIAL_PAGE_SIZE = 10;

export async function generateMetadata({ params }) {
    const { locale } = await params;
    return guestPageMetadata("/products", validateLocale(locale));
}

function withLocalePrefix(locale, path) {
    if (locale === "en") return path === "/" ? "/en" : `/en${path}`;
    return path;
}

export default async function ProductsPage({ params }) {
    const { locale } = await params;

    const canonicalPath = withLocalePrefix(locale, "/products");

    let initialProducts = [];
    try {
        initialProducts = await fetchGuestProductsListing({
            limit: INITIAL_PAGE_SIZE,
            offset: 0,
        });
    } catch {
        initialProducts = [];
    }

    const initialHasMore = initialProducts.length === INITIAL_PAGE_SIZE;

    const itemListSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Certified LED Display Products",
        url: `${siteUrl}${canonicalPath}`,
        itemListElement: initialProducts.map((p, i) => {
            const productUrl = `${siteUrl}${withLocalePrefix(locale, `/products/${p.id}`)}`;
            const item = {
                "@type": "Product",
                name: p.productName,
                url: productUrl,
            };

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
            />
        </>
    );
}

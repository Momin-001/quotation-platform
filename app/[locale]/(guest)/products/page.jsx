import SchemaScript from "@/components/SchemaScript";
import ProductsClient from "./ProductsClient";
import { BASE_URL } from "@/lib/constants";
import { db } from "@/lib/db";
import { products } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

const siteUrl = (BASE_URL || "https://www.proledall.eu").replace(/\/$/, "");

function withLocalePrefix(locale, path) {
    if (locale === "en") return path === "/" ? "/en" : `/en${path}`;
    return path;
}

export default async function ProductsPage({ params }) {
    const { locale } = await params;

    const canonicalPath = withLocalePrefix(locale, "/products");

    let initialProducts = [];
    try {
        initialProducts = await db
            .select({
                id: products.id,
                productName: products.productName,
                productDescription: products.productDescription,
                oemBrand: products.oemBrand,
            })
            .from(products)
            .where(eq(products.isActive, true))
            .orderBy(desc(products.createdAt))
            .limit(10);
    } catch {
        initialProducts = [];
    }

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
            <ProductsClient />
        </>
    );
}

import { notFound } from "next/navigation";
import { BASE_URL } from "@/lib/constants";
import { validateLocale, buildAlternates } from "@/lib/i18n/metadata";
import { cmsField } from "@/lib/i18n/cms";
import { fetchGuestProductBySlug } from "@/features/products/guest-product-detail";
import SchemaScript from "@/components/guest/SchemaScript";
import ProductDetailClient from "./ProductDetailClient";

const siteUrl = (BASE_URL || "https://www.proledall.eu").replace(/\/$/, "");

// Revalidate the cached page hourly (ISR) — product data changes infrequently.
export const revalidate = 3600;

function withLocalePrefix(locale, path) {
    if (locale === "en") return path === "/" ? "/en" : `/en${path}`;
    return path;
}

export async function generateMetadata({ params }) {
    const { locale, id } = await params;
    const validLocale = validateLocale(locale);
    const product = await fetchGuestProductBySlug(id);

    if (!product) return {};

    const title = cmsField(product, "metaTitle", validLocale) || product.productName;
    const description =
        cmsField(product, "metaDescription", validLocale) ||
        product.productDescription ||
        `${product.productName}${product.areaOfUse ? ` – ${product.areaOfUse}` : ""} LED display from ProLEDALL.`;
    const path = `/products/${product.slug}`;
    const images = product.images?.length ? [{ url: product.images[0] }] : undefined;

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

function buildProductSchema(product, locale) {
    const url = `${siteUrl}${withLocalePrefix(locale, `/products/${product.slug}`)}`;

    // Public, ungated specs surfaced as structured properties.
    const specs = [
        { name: "Pixel Pitch", value: product.pixelPitch, unit: "mm" },
        { name: "Brightness", value: product.brightnessValue, unit: "cd/m²" },
        { name: "Refresh Rate", value: product.refreshRate, unit: "Hz" },
        { name: "LED Technology", value: product.ledTechnology },
        { name: "IP Rating", value: product.ipRating },
    ].filter((s) => s.value !== null && s.value !== undefined && s.value !== "");

    const schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.productName,
        url,
        offers: {
            "@type": "Offer",
            url,
            priceCurrency: "EUR",
            availability:
                product.stockPieces > 0
                    ? "https://schema.org/InStock"
                    : "https://schema.org/PreOrder",
            itemCondition: "https://schema.org/NewCondition",
        },
    };

    if (product.images?.length) schema.image = product.images;
    if (product.productDescription) schema.description = product.productDescription;
    if (product.productNumber) {
        schema.sku = product.productNumber;
        schema.mpn = product.productNumber;
    }
    if (product.oemBrand) schema.brand = { "@type": "Brand", name: product.oemBrand };
    if (product.areaOfUse) schema.category = product.areaOfUse;
    if (specs.length) {
        schema.additionalProperty = specs.map((s) => ({
            "@type": "PropertyValue",
            name: s.name,
            value: s.unit ? `${s.value} ${s.unit}` : String(s.value),
        }));
    }

    return schema;
}

export default async function ProductDetailPage({ params }) {
    const { locale, id } = await params;
    const product = await fetchGuestProductBySlug(id);

    if (!product) notFound();

    const productSchema = buildProductSchema(product, validateLocale(locale));

    return (
        <>
            <SchemaScript data={productSchema} />
            <ProductDetailClient product={product} />
        </>
    );
}

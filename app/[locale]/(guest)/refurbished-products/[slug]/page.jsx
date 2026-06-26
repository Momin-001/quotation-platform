import { notFound } from "next/navigation";
import { fetchGuestRefurbishedBySlug } from "@/features/refurbished-products/guest-refurbished-detail";
import RefurbishedProductDetailClient from "./RefurbishedProductDetailClient";

export const revalidate = 3600;

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const product = await fetchGuestRefurbishedBySlug(slug);
    if (!product) return {};

    const title = product.metaTitleEn || product.metaTitleDe || product.serie;
    const description =
        product.metaDescriptionEn ||
        product.metaDescriptionDe ||
        product.productDescription ||
        `${product.serie}${product.areaOfUse ? ` – ${product.areaOfUse}` : ""} refurbished LED display from ProLEDALL.`;

    return {
        title,
        description,
        openGraph: {
            type: "website",
            title,
            description,
            ...(product.images?.length ? { images: [{ url: product.images[0] }] } : {}),
        },
    };
}

export default async function RefurbishedProductDetailPage({ params }) {
    const { slug } = await params;
    const product = await fetchGuestRefurbishedBySlug(slug);

    if (!product) notFound();

    return <RefurbishedProductDetailClient product={product} />;
}

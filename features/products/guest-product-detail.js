import { cache } from "react";
import { db } from "@/lib/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Fetch a single guest-facing product by its URL slug, with all relations
 * needed by the product detail page. Returns the formatted product object
 * (flat shape expected by the UI) or null if not found.
 *
 * Shared by the guest product API route and the server-rendered detail page
 * so both produce an identical product shape. Wrapped in React `cache` so
 * `generateMetadata` and the page component share a single query per request.
 */
export const fetchGuestProductBySlug = cache(async function fetchGuestProductBySlug(slug) {
    if (!slug) return null;

    const product = await db.query.products.findFirst({
        where: eq(products.slug, slug),
        with: {
            areaOfUse: {
                columns: {
                    name: true,
                },
            },
            images: {
                columns: {
                    imageUrl: true,
                },
            },
            features: {
                columns: {
                    feature: true,
                },
            },
            productCertificates: {
                columns: {},
                with: {
                    certificate: {
                        columns: {
                            id: true,
                            name: true,
                            imageUrl: true,
                        },
                    },
                },
            },
            productProductIcons: {
                columns: {
                    iconOrder: true,
                },
                with: {
                    productIcon: {
                        columns: {
                            id: true,
                            name: true,
                            imageUrl: true,
                        },
                    },
                },
            },
        },
    });

    if (!product) return null;

    const productIconsSorted = (product.productProductIcons || [])
        .sort((a, b) => (a.iconOrder ?? 0) - (b.iconOrder ?? 0))
        .map((row) => ({ ...row.productIcon }));

    return {
        ...product,
        areaOfUse: product.areaOfUse?.name,
        images: product.images?.map((image) => image.imageUrl) ?? [],
        productCertificates: product.productCertificates?.map((cert) => cert.certificate) ?? [],
        productIcons: productIconsSorted,
        features: product.features?.map((feature) => feature.feature) ?? [],
    };
});

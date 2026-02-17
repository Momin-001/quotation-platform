import { db } from "@/lib/db";
import { products, productImages, productCertificates, productFeatures, certificates, categories } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";

export async function GET(req, { params }) {
    try {
        const { id } = await params;

        if (!id) {
            return errorResponse("Product ID is required", 400);
        }

        // Fetch product
        const product = await db.query.products.findFirst({
            where: eq(products.id, id),
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
            },
        });

        if (!product) {
            return errorResponse("Product not found", 404);
        }

        const formattedProduct = {
            ...product,
            areaOfUse: product.areaOfUse.name,
            images: product.images.map((image) => image.imageUrl),
            productCertificates: product.productCertificates.map((certificate) => certificate.certificate),
            features: product.features.map((feature) => feature.feature),
        };
        return successResponse("Product fetched successfully", formattedProduct);
    } catch (error) {
        return errorResponse(error.message || "Failed to fetch product");
    }
}

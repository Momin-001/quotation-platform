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
        const product = await db
            .select()
            .from(products)
            .where(eq(products.id, id))
            .limit(1)
            .then((res) => res[0]);

        if (!product) {
            return errorResponse("Product not found", 404);
        }

        // Fetch product images
        const images = await db
            .select()
            .from(productImages)
            .where(eq(productImages.productId, id))
            .orderBy(productImages.imageOrder);

        // Fetch product features
        const features = await db
            .select()
            .from(productFeatures)
            .where(eq(productFeatures.productId, id));

        // Fetch product certificates
        const productCerts = await db
            .select({
                id: certificates.id,
                name: certificates.name,
                imageUrl: certificates.imageUrl,
            })
            .from(productCertificates)
            .innerJoin(certificates, eq(productCertificates.certificateId, certificates.id))
            .where(eq(productCertificates.productId, id));

        // Fetch category
        const category = product.areaOfUseId
            ? await db
                .select()
                .from(categories)
                .where(eq(categories.id, product.areaOfUseId))
                .limit(1)
                .then((res) => res[0])
            : null;

        return successResponse(

            "Product fetched successfully", {
            ...product,
            images: images.map((img) => img.imageUrl),
            features: features.map((f) => f.feature),
            certificates: productCerts,
            categoryName: category?.name || null,
        },
        );
    } catch (error) {
        return errorResponse(error.message || "Failed to fetch product");
    }
}

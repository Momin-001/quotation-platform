import { db } from "@/lib/db";
import { refurbishedProducts, refurbishedProductImages, refurbishedProductFeatures } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";
import cloudinary from "@/lib/cloudinary";
import { slugify, isRefurbishedSlugTaken } from "@/lib/helpers/refurbished-slug";
import { mapRefurbishedFields } from "@/features/refurbished-products/refurbished-fields";

// GET /api/admin/refurbished-products/[id] - Fetch a single refurbished product with details
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const product = await db
            .select()
            .from(refurbishedProducts)
            .where(eq(refurbishedProducts.id, id))
            .limit(1)
            .then((r) => r[0]);

        if (!product) {
            return errorResponse("Refurbished product not found", 404);
        }

        const images = await db
            .select({
                id: refurbishedProductImages.id,
                imageUrl: refurbishedProductImages.imageUrl,
                imageOrder: refurbishedProductImages.imageOrder,
            })
            .from(refurbishedProductImages)
            .where(eq(refurbishedProductImages.refurbishedProductId, id))
            .orderBy(refurbishedProductImages.imageOrder);

        const features = await db
            .select({
                id: refurbishedProductFeatures.id,
                feature: refurbishedProductFeatures.feature,
            })
            .from(refurbishedProductFeatures)
            .where(eq(refurbishedProductFeatures.refurbishedProductId, id));

        return successResponse("Refurbished product fetched successfully", {
            ...product,
            images,
            features,
        });
    } catch (error) {
        console.error("GET /api/admin/refurbished-products/[id] error:", error);
        return errorResponse("Failed to fetch refurbished product", 500);
    }
}

// PUT /api/admin/refurbished-products/[id] - Update a refurbished product
export async function PUT(request, { params }) {
    try {
        const { id } = await params;

        const existing = await db
            .select({ id: refurbishedProducts.id })
            .from(refurbishedProducts)
            .where(eq(refurbishedProducts.id, id))
            .limit(1)
            .then((r) => r[0]);

        if (!existing) {
            return errorResponse("Refurbished product not found", 404);
        }

        const formData = await request.formData();
        const body = JSON.parse(formData.get("fields"));

        const data = mapRefurbishedFields(body);
        // productNumber is not editable (mirrors products)
        data.updatedAt = new Date();

        const slug = slugify(data.serie);
        if (!slug) {
            return errorResponse("Serie must contain at least one letter or number to generate a URL slug", 400);
        }
        if (await isRefurbishedSlugTaken(slug, id)) {
            return errorResponse("A refurbished product with this serie already exists (duplicate URL slug). Please choose a different serie.", 409);
        }
        data.slug = slug;

        await db.update(refurbishedProducts).set(data).where(eq(refurbishedProducts.id, id));

        // Removed images
        const removedImageIds = body.removedImageIds || [];
        for (const imageId of removedImageIds) {
            const img = await db
                .select({ publicId: refurbishedProductImages.publicId })
                .from(refurbishedProductImages)
                .where(eq(refurbishedProductImages.id, imageId))
                .limit(1)
                .then((r) => r[0]);
            if (img?.publicId) {
                await cloudinary.uploader.destroy(img.publicId);
            }
            await db.delete(refurbishedProductImages).where(eq(refurbishedProductImages.id, imageId));
        }

        // New images
        const imageFiles = formData.getAll("images");
        const validImages = (imageFiles || []).filter((f) => f && f.size > 0);
        if (validImages.length > 0) {
            const maxOrder = await db
                .select({ imageOrder: refurbishedProductImages.imageOrder })
                .from(refurbishedProductImages)
                .where(eq(refurbishedProductImages.refurbishedProductId, id))
                .orderBy(refurbishedProductImages.imageOrder)
                .then((rows) => (rows.length > 0 ? Math.max(...rows.map((r) => r.imageOrder)) + 1 : 0));

            await Promise.all(
                validImages.map(async (file, index) => {
                    const buffer = Buffer.from(await file.arrayBuffer());
                    const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;
                    const uploadResult = await cloudinary.uploader.upload(base64Image, {
                        folder: "QuotationPlatform/refurbished-products/images",
                        resource_type: "image",
                    });
                    return db.insert(refurbishedProductImages).values({
                        refurbishedProductId: id,
                        imageUrl: uploadResult.secure_url,
                        publicId: uploadResult.public_id,
                        imageOrder: maxOrder + index,
                    });
                })
            );
        }

        // Features - replace all
        await db.delete(refurbishedProductFeatures).where(eq(refurbishedProductFeatures.refurbishedProductId, id));
        const features = (body.features || []).filter((f) => f && f.trim() !== "");
        if (features.length > 0) {
            await Promise.all(
                features.map((feature) =>
                    db.insert(refurbishedProductFeatures).values({
                        refurbishedProductId: id,
                        feature: feature.trim(),
                    })
                )
            );
        }

        return successResponse("Refurbished product updated successfully");
    } catch (error) {
        console.error("PUT /api/admin/refurbished-products/[id] error:", error);
        return errorResponse("Failed to update refurbished product", 500);
    }
}

// DELETE /api/admin/refurbished-products/[id] - Delete a refurbished product
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        const product = await db
            .select({ id: refurbishedProducts.id })
            .from(refurbishedProducts)
            .where(eq(refurbishedProducts.id, id))
            .limit(1)
            .then((r) => r[0]);

        if (!product) {
            return errorResponse("Refurbished product not found", 404);
        }

        const images = await db
            .select()
            .from(refurbishedProductImages)
            .where(eq(refurbishedProductImages.refurbishedProductId, id));
        for (const image of images) {
            await cloudinary.uploader.destroy(image.publicId);
        }

        await db.delete(refurbishedProducts).where(eq(refurbishedProducts.id, id));

        return successResponse("Refurbished product deleted successfully");
    } catch (error) {
        console.error("DELETE /api/admin/refurbished-products/[id] error:", error);
        return errorResponse("Failed to delete refurbished product", 500);
    }
}

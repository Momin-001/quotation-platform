import { db } from "@/lib/db";
import { refurbishedProducts, refurbishedProductImages, refurbishedProductFeatures } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { desc, eq } from "drizzle-orm";
import cloudinary from "@/lib/cloudinary";
import { slugify, isRefurbishedSlugTaken } from "@/lib/helpers/refurbished-slug";
import { mapRefurbishedFields } from "@/features/refurbished-products/refurbished-fields";

// GET /api/admin/refurbished-products - Fetch all refurbished products
export async function GET() {
    try {
        const rows = await db
            .select({
                id: refurbishedProducts.id,
                serie: refurbishedProducts.serie,
                productNumber: refurbishedProducts.productNumber,
                productType: refurbishedProducts.productType,
                pixelPitch: refurbishedProducts.pixelPitch,
                levelOfQuality: refurbishedProducts.levelOfQuality,
                areaOfUseId: refurbishedProducts.areaOfUseId,
                isActive: refurbishedProducts.isActive,
                createdAt: refurbishedProducts.createdAt,
                updatedAt: refurbishedProducts.updatedAt,
            })
            .from(refurbishedProducts)
            .orderBy(desc(refurbishedProducts.createdAt));

        return successResponse("Refurbished products fetched successfully", rows);
    } catch (error) {
        console.error("GET /api/admin/refurbished-products error:", error);
        return errorResponse("Failed to fetch refurbished products", 500);
    }
}

// POST /api/admin/refurbished-products - Create a new refurbished product
export async function POST(request) {
    try {
        const formData = await request.formData();
        const body = JSON.parse(formData.get("fields"));

        const data = mapRefurbishedFields(body);
        data.productNumber = body.productNumber?.toString().trim() || "";

        if (!data.serie || !data.productNumber) {
            return errorResponse("Serie and product number are required", 400);
        }

        // Slug for the SEO-friendly URL — generated from serie
        const slug = slugify(data.serie);
        if (!slug) {
            return errorResponse("Serie must contain at least one letter or number to generate a URL slug", 400);
        }
        if (await isRefurbishedSlugTaken(slug)) {
            return errorResponse("A refurbished product with this serie already exists (duplicate URL slug). Please choose a different serie.", 409);
        }
        data.slug = slug;
        data.isActive = true;

        const created = await db.insert(refurbishedProducts).values(data).returning();
        const refurbishedProductId = created[0].id;

        // Images
        const imageFiles = formData.getAll("images");
        const validImages = (imageFiles || []).filter((f) => f && f.size > 0);
        if (validImages.length > 0) {
            await Promise.all(
                validImages.map(async (file, index) => {
                    const buffer = Buffer.from(await file.arrayBuffer());
                    const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;
                    const uploadResult = await cloudinary.uploader.upload(base64Image, {
                        folder: "QuotationPlatform/refurbished-products/images",
                        resource_type: "image",
                    });
                    return db.insert(refurbishedProductImages).values({
                        refurbishedProductId,
                        imageUrl: uploadResult.secure_url,
                        publicId: uploadResult.public_id,
                        imageOrder: index,
                    });
                })
            );
        } else {
            // No images uploaded — keep inactive until admin adds at least one
            await db.update(refurbishedProducts).set({ isActive: false }).where(eq(refurbishedProducts.id, refurbishedProductId));
        }

        // Features
        const features = Array.isArray(body.features) ? body.features : [];
        const validFeatures = features.filter((f) => f && f.trim() !== "");
        if (validFeatures.length > 0) {
            await Promise.all(
                validFeatures.map((feature) =>
                    db.insert(refurbishedProductFeatures).values({
                        refurbishedProductId,
                        feature: feature.trim(),
                    })
                )
            );
        }

        return successResponse("Refurbished product created successfully", created[0]);
    } catch (error) {
        console.error("POST /api/admin/refurbished-products error:", error);
        return errorResponse("Failed to create refurbished product", 500);
    }
}

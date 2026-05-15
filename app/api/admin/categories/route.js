import { db } from "@/lib/db";
import { categories, products } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { parseCategoryFeatures } from "@/lib/category-helpers";
import { eq, sql, ilike } from "drizzle-orm";
import cloudinary from "@/lib/cloudinary";

const CATEGORY_IMAGE_FOLDER = "QuotationPlatform/categories/images";

async function uploadCategoryImage(imageFile) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = `data:${imageFile.type};base64,${buffer.toString("base64")}`;
    return cloudinary.uploader.upload(base64Image, {
        folder: CATEGORY_IMAGE_FOLDER,
        resource_type: "image",
    });
}

// GET /api/admin/categories - Fetch all categories with product count
export async function GET() {
    try {
        const categoriesWithCount = await db
            .select({
                id: categories.id,
                name: categories.name,
                titleEn: categories.titleEn,
                titleDe: categories.titleDe,
                descriptionEn: categories.descriptionEn,
                descriptionDe: categories.descriptionDe,
                imageUrl: categories.imageUrl,
                publicId: categories.publicId,
                features: categories.features,
                createdAt: categories.createdAt,
                updatedAt: categories.updatedAt,
                productCount: sql`cast(count(${products.id}) as int)`,
            })
            .from(categories)
            .leftJoin(products, eq(products.areaOfUseId, categories.id))
            .groupBy(categories.id)
            .orderBy(categories.name);

        return successResponse("Categories fetched successfully", categoriesWithCount);
    } catch (error) {
        console.error("GET /api/admin/categories error:", error);
        return errorResponse("Failed to fetch categories", 500);
    }
}

// POST /api/admin/categories - Create a new category
export async function POST(request) {
    try {
        const formData = await request.formData();
        const name = formData.get("name");
        const titleEn = formData.get("titleEn");
        const titleDe = formData.get("titleDe");
        const descriptionEn = formData.get("descriptionEn");
        const descriptionDe = formData.get("descriptionDe");
        const featuresRaw = formData.get("features");
        const imageFile = formData.get("image");

        if (!name || !String(name).trim()) {
            return errorResponse("Category name is required", 400);
        }

        const trimmedName = String(name).trim();

        const [existingCategory] = await db
            .select({ id: categories.id })
            .from(categories)
            .where(ilike(categories.name, trimmedName))
            .limit(1);

        if (existingCategory) {
            return errorResponse("This category already exists", 409);
        }

        const values = {
            name: trimmedName,
            titleEn: titleEn ? String(titleEn).trim() : null,
            titleDe: titleDe ? String(titleDe).trim() : null,
            descriptionEn: descriptionEn ? String(descriptionEn).trim() : null,
            descriptionDe: descriptionDe ? String(descriptionDe).trim() : null,
            features: parseCategoryFeatures(featuresRaw),
        };

        if (imageFile && imageFile.size > 0) {
            const uploadResult = await uploadCategoryImage(imageFile);
            values.imageUrl = uploadResult.secure_url;
            values.publicId = uploadResult.public_id;
        }

        const newCategory = await db.insert(categories).values(values).returning();

        return successResponse("Category created successfully", newCategory[0]);
    } catch (error) {
        console.error("POST /api/admin/categories error:", error);
        if (error.code === "23505") {
            return errorResponse("This category already exists", 409);
        }
        return errorResponse("Failed to create category", 500);
    }
}

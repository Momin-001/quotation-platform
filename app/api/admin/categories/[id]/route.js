import { db } from "@/lib/db";
import { categories } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { parseCategoryFeatures } from "@/lib/helpers/category-helpers";
import { eq } from "drizzle-orm";
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

// PATCH /api/admin/categories/[id] - Update a category
export async function PATCH(request, { params }) {
    try {
        const resolvedParams = await params;
        const { id } = resolvedParams;
        const formData = await request.formData();
        const name = formData.get("name");
        const titleEn = formData.get("titleEn");
        const titleDe = formData.get("titleDe");
        const descriptionEn = formData.get("descriptionEn");
        const descriptionDe = formData.get("descriptionDe");
        const featuresRaw = formData.get("features");
        const imageFile = formData.get("image");
        const removeImage = formData.get("removeImage") === "true";

        if (!name || !String(name).trim()) {
            return errorResponse("Category name is required", 400);
        }

        const [current] = await db
            .select()
            .from(categories)
            .where(eq(categories.id, id))
            .limit(1);

        if (!current) {
            return errorResponse("Category not found", 404);
        }

        const updateData = {
            name: String(name).trim(),
            titleEn: titleEn ? String(titleEn).trim() : null,
            titleDe: titleDe ? String(titleDe).trim() : null,
            descriptionEn: descriptionEn ? String(descriptionEn).trim() : null,
            descriptionDe: descriptionDe ? String(descriptionDe).trim() : null,
            features: parseCategoryFeatures(featuresRaw),
            updatedAt: new Date(),
        };

        if (removeImage && current.publicId) {
            await cloudinary.uploader.destroy(current.publicId).catch(() => {});
            updateData.imageUrl = null;
            updateData.publicId = null;
        }

        if (imageFile && imageFile.size > 0) {
            if (current.publicId) {
                await cloudinary.uploader.destroy(current.publicId).catch(() => {});
            }
            const uploadResult = await uploadCategoryImage(imageFile);
            updateData.imageUrl = uploadResult.secure_url;
            updateData.publicId = uploadResult.public_id;
        }

        const updatedCategory = await db
            .update(categories)
            .set(updateData)
            .where(eq(categories.id, id))
            .returning();

        return successResponse("Category updated successfully", updatedCategory[0]);
    } catch (error) {
        console.error("PATCH /api/admin/categories/[id] error:", error);
        return errorResponse("Failed to update category", 500);
    }
}

// DELETE /api/admin/categories/[id] - Delete a category
export async function DELETE(request, { params }) {
    try {
        const resolvedParams = await params;
        const { id } = resolvedParams;

        const [existing] = await db
            .select()
            .from(categories)
            .where(eq(categories.id, id))
            .limit(1);

        if (!existing) {
            return errorResponse("Category not found", 404);
        }

        if (existing.publicId) {
            await cloudinary.uploader.destroy(existing.publicId).catch(() => {});
        }

        await db.delete(categories).where(eq(categories.id, id));

        return successResponse("Category deleted successfully");
    } catch (error) {
        console.error("DELETE /api/admin/categories/[id] error:", error);
        return errorResponse("Failed to delete category", 500);
    }
}

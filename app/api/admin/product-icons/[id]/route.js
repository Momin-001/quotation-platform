import { db } from "@/lib/db";
import { productIcons } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";
import cloudinary from "@/lib/cloudinary";

export async function PATCH(request, { params }) {
    try {
        const { id } = await params;
        const formData = await request.formData();
        const name = formData.get("name");
        const imageFile = formData.get("image");

        const updateData = { updatedAt: new Date() };
        if (name) updateData.name = name.trim();

        if (imageFile && imageFile.size > 0) {
            const [current] = await db
                .select()
                .from(productIcons)
                .where(eq(productIcons.id, id))
                .limit(1);
            if (current?.publicId) {
                await cloudinary.uploader.destroy(current.publicId);
            }
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const base64Image = `data:${imageFile.type};base64,${buffer.toString("base64")}`;
            const uploadResult = await cloudinary.uploader.upload(base64Image, {
                folder: "QuotationPlatform/product-icons",
                resource_type: "image",
            });
            updateData.imageUrl = uploadResult.secure_url;
            updateData.publicId = uploadResult.public_id;
        }

        const [updated] = await db
            .update(productIcons)
            .set(updateData)
            .where(eq(productIcons.id, id))
            .returning();
        if (!updated) return errorResponse("Product icon not found", 404);
        return successResponse("Product icon updated successfully", updated);
    } catch (error) {
        return errorResponse(error.message || "Failed to update product icon");
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        const [row] = await db
            .select()
            .from(productIcons)
            .where(eq(productIcons.id, id))
            .limit(1);
        if (!row) return errorResponse("Product icon not found", 404);
        if (row.publicId) await cloudinary.uploader.destroy(row.publicId);
        await db.delete(productIcons).where(eq(productIcons.id, id));
        return successResponse("Product icon deleted successfully");
    } catch (error) {
        return errorResponse(error.message || "Failed to delete product icon");
    }
}

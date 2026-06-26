import { db } from "@/lib/db";
import { advertisements } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";
import cloudinary from "@/lib/cloudinary";

// PATCH /api/admin/advertisements/[id] - Update an advertisement (fields and/or active toggle)
export async function PATCH(request, { params }) {
    try {
        const { id } = await params;
        const formData = await request.formData();
        const title = formData.get("title");
        const redirectUrl = formData.get("redirectUrl");
        const isActiveRaw = formData.get("isActive");
        const imageFile = formData.get("image");

        const updateData = { updatedAt: new Date() };
        if (title != null) updateData.title = title.toString().trim();
        if (redirectUrl != null) updateData.redirectUrl = redirectUrl.toString().trim();
        if (isActiveRaw != null) updateData.isActive = isActiveRaw === "true" || isActiveRaw === true;

        if (imageFile && imageFile.size > 0) {
            const [current] = await db.select().from(advertisements).where(eq(advertisements.id, id)).limit(1);
            if (current?.publicId) {
                await cloudinary.uploader.destroy(current.publicId);
            }
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            const base64Image = `data:${imageFile.type};base64,${buffer.toString("base64")}`;
            const uploadResult = await cloudinary.uploader.upload(base64Image, {
                folder: "QuotationPlatform/advertisements/images",
                resource_type: "image",
            });
            updateData.imageUrl = uploadResult.secure_url;
            updateData.publicId = uploadResult.public_id;
        }

        const updated = await db.update(advertisements).set(updateData).where(eq(advertisements.id, id)).returning();
        if (updated.length === 0) {
            return errorResponse("Advertisement not found", 404);
        }

        return successResponse("Advertisement updated successfully", updated[0]);
    } catch (error) {
        console.error("PATCH /api/admin/advertisements/[id] error:", error);
        return errorResponse("Failed to update advertisement", 500);
    }
}

// DELETE /api/admin/advertisements/[id] - Delete an advertisement
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        const [ad] = await db.select().from(advertisements).where(eq(advertisements.id, id)).limit(1);
        if (!ad) {
            return errorResponse("Advertisement not found", 404);
        }
        if (ad.publicId) {
            await cloudinary.uploader.destroy(ad.publicId);
        }
        await db.delete(advertisements).where(eq(advertisements.id, id));

        return successResponse("Advertisement deleted successfully");
    } catch (error) {
        console.error("DELETE /api/admin/advertisements/[id] error:", error);
        return errorResponse("Failed to delete advertisement", 500);
    }
}

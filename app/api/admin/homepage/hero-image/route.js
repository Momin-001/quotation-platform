import { db } from "@/lib/db";
import { homepage } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import cloudinary from "@/lib/cloudinary";

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get("heroImage");

        if (!file || file.size === 0) {
            return errorResponse("No image file provided", 400);
        }

        const existing = await db.select().from(homepage).limit(1).then((r) => r[0]);
        if (!existing) {
            return errorResponse("Homepage content not found. Please save homepage content first.", 404);
        }

        // Upload new image first (longer timeout for large files)
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

        const result = await cloudinary.uploader.upload(base64, {
            folder: "QuotationPlatform/homepage",
            resource_type: "image",
        });

        // Delete old image from Cloudinary after successful upload
        if (existing.heroImagePublicId) {
            await cloudinary.uploader.destroy(existing.heroImagePublicId).catch(() => {});
        }

        // Update homepage row
        await db
            .update(homepage)
            .set({
                heroImageUrl: result.secure_url,
                heroImagePublicId: result.public_id,
                updatedAt: new Date(),
            })
            .returning();

        return successResponse("Hero image uploaded successfully", {
            heroImageUrl: result.secure_url,
        });
    } catch (error) {
        console.error("Hero image upload error:", error);
        return errorResponse(error.message || "Failed to upload hero image", 500);
    }
}

export async function DELETE() {
    try {
        const existing = await db.select().from(homepage).limit(1).then((r) => r[0]);
        if (!existing) {
            return errorResponse("Homepage content not found", 404);
        }

        if (existing.heroImagePublicId) {
            await cloudinary.uploader.destroy(existing.heroImagePublicId);
        }

        await db
            .update(homepage)
            .set({
                heroImageUrl: null,
                heroImagePublicId: null,
                updatedAt: new Date(),
            })
            .returning();

        return successResponse("Hero image removed successfully");
    } catch (error) {
        return errorResponse(error.message || "Failed to remove hero image", 500);
    }
}

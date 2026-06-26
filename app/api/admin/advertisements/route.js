import { db } from "@/lib/db";
import { advertisements } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { desc } from "drizzle-orm";
import cloudinary from "@/lib/cloudinary";

// GET /api/admin/advertisements - Fetch all advertisements
export async function GET() {
    try {
        const rows = await db.select().from(advertisements).orderBy(desc(advertisements.createdAt));
        return successResponse("Advertisements fetched successfully", rows);
    } catch (error) {
        console.error("GET /api/admin/advertisements error:", error);
        return errorResponse("Failed to fetch advertisements", 500);
    }
}

// POST /api/admin/advertisements - Create an advertisement with image upload
export async function POST(request) {
    try {
        const formData = await request.formData();
        const title = formData.get("title");
        const redirectUrl = formData.get("redirectUrl");
        const imageFile = formData.get("image");

        if (!title || !redirectUrl || !imageFile) {
            return errorResponse("Title, redirect URL, and image are required", 400);
        }

        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const base64Image = `data:${imageFile.type};base64,${buffer.toString("base64")}`;
        const uploadResult = await cloudinary.uploader.upload(base64Image, {
            folder: "QuotationPlatform/advertisements/images",
            resource_type: "image",
        });

        const created = await db
            .insert(advertisements)
            .values({
                title: title.trim(),
                redirectUrl: redirectUrl.trim(),
                imageUrl: uploadResult.secure_url,
                publicId: uploadResult.public_id,
            })
            .returning();

        return successResponse("Advertisement created successfully", created[0]);
    } catch (error) {
        console.error("POST /api/admin/advertisements error:", error);
        return errorResponse("Failed to create advertisement", 500);
    }
}

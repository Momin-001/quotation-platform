import { db } from "@/lib/db";
import { productIcons } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { desc } from "drizzle-orm";
import cloudinary from "@/lib/cloudinary";

export async function GET() {
    try {
        const all = await db
            .select()
            .from(productIcons)
            .orderBy(desc(productIcons.createdAt));
        return successResponse("Product icons fetched successfully", all);
    } catch (error) {
        return errorResponse(error.message || "Failed to fetch product icons");
    }
}

export async function POST(request) {
    try {
        const formData = await request.formData();
        const name = formData.get("name");
        const imageFile = formData.get("image");

        if (!name || !imageFile) {
            return errorResponse("Name and image are required", 400);
        }

        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = `data:${imageFile.type};base64,${buffer.toString("base64")}`;

        const uploadResult = await cloudinary.uploader.upload(base64Image, {
            folder: "QuotationPlatform/product-icons",
            resource_type: "image",
        });

        const [row] = await db
            .insert(productIcons)
            .values({
                name: name.trim(),
                imageUrl: uploadResult.secure_url,
                publicId: uploadResult.public_id,
            })
            .returning();

        return successResponse("Product icon created successfully", row);
    } catch (error) {
        return errorResponse(error.message || "Failed to create product icon");
    }
}

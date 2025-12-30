import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { partners } from "@/drizzle/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { desc } from "drizzle-orm";
import cloudinary from "@/lib/cloudinary";

// GET /api/admin/partners - Fetch all partners
export async function GET() {
    try {
        const allPartners = await db
            .select()
            .from(partners)
            .orderBy(desc(partners.createdAt));

        return successResponse(allPartners, "Partners fetched successfully");
    } catch (error) {
        console.error("Error fetching partners:", error);
        return errorResponse("Failed to fetch partners");
    }
}

// POST /api/admin/partners - Create a new partner with logo upload
export async function POST(request) {
    try {
        const formData = await request.formData();
        const name = formData.get("name");
        const websiteUrl = formData.get("websiteUrl");
        const logoFile = formData.get("logo");

        if (!name || !websiteUrl || !logoFile) {
            return errorResponse("Name, website URL, and logo are required");
        }

        // Convert file to base64 for Cloudinary upload
        const bytes = await logoFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = `data:${logoFile.type};base64,${buffer.toString('base64')}`;

        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(base64Image, {
            folder: "partners",
            resource_type: "image",
        });

        // Save to database
        const newPartner = await db
            .insert(partners)
            .values({
                name: name.trim(),
                logoUrl: uploadResult.secure_url,
                websiteUrl: websiteUrl.trim(),
            })
            .returning();

        return successResponse(newPartner[0], "Partner created successfully");
    } catch (error) {
        console.error("Error creating partner:", error);
        return errorResponse("Failed to create partner");
    }
}

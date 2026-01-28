import { db } from "@/lib/db";
import { certificates } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { desc, eq } from "drizzle-orm";
import cloudinary from "@/lib/cloudinary";

// GET /api/admin/certificates - Fetch all certificates
export async function GET() {
    try {
        const allCertificates = await db
            .select()
            .from(certificates)
            .orderBy(desc(certificates.createdAt));

        return successResponse("Certificates fetched successfully", allCertificates);
    } catch (error) {
        return errorResponse(error.message || "Failed to fetch certificates");
    }
}

// POST /api/admin/certificates - Create a new certificate
export async function POST(request) {
    try {
        const formData = await request.formData();
        const name = formData.get("name");
        const imageFile = formData.get("image");

        if (!name || !imageFile) {
            return errorResponse("Name and image are required", 400);
        }

        // Convert file to base64 for Cloudinary upload
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = `data:${imageFile.type};base64,${buffer.toString('base64')}`;

        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(base64Image, {
            folder: "certificates",
            resource_type: "image",
        });

        // Save to database
        const newCertificate = await db
            .insert(certificates)
            .values({
                name: name.trim(),
                imageUrl: uploadResult.secure_url,
            })
            .returning();

        return successResponse("Certificate created successfully", newCertificate[0]);
    } catch (error) {
        return errorResponse(error.message || "Failed to create certificate");
    }
}


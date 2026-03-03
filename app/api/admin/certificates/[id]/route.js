import { db } from "@/lib/db";
import { certificates } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";
import cloudinary from "@/lib/cloudinary";

// PATCH /api/admin/certificates/[id] - Update a certificate
export async function PATCH(request, { params }) {
    try {
        const resolvedParams = await params;
        const { id } = resolvedParams;;
        const formData = await request.formData();
        const name = formData.get("name");
        const imageFile = formData.get("image");

        const updateData = {
            updatedAt: new Date(),
        };

        if (name) {
            updateData.name = name.trim();
        }

        // If new image is uploaded, upload to Cloudinary
        if (imageFile && imageFile.size > 0) {
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const base64Image = `data:${imageFile.type};base64,${buffer.toString('base64')}`;

            // Get current certificate to delete old image
            const [currentCertificate] = await db
                .select()
                .from(certificates)
                .where(eq(certificates.id, id))
                .limit(1);

            if (currentCertificate && currentCertificate.publicId) {
                // Extract public ID from URL and delete from Cloudinary
                await cloudinary.uploader.destroy(currentCertificate.publicId);
            }

            // Upload new image
            const uploadResult = await cloudinary.uploader.upload(base64Image, {
                folder: "QuotationPlatform/certificates/images",
                resource_type: "image",
            });

            updateData.imageUrl = uploadResult.secure_url;
            updateData.publicId = uploadResult.public_id;
        }

        const [updatedCertificate] = await db
            .update(certificates)
            .set(updateData)
            .where(eq(certificates.id, id))
            .returning();

        if (!updatedCertificate) {
            return errorResponse("Certificate not found", 404);
        }

        return successResponse("Certificate updated successfully", updatedCertificate[0]);
    } catch (error) {
        return errorResponse(error.message || "Failed to update certificate");
    }
}

// DELETE /api/admin/certificates/[id] - Delete a certificate
export async function DELETE(request, { params }) {
    try {
        const resolvedParams = await params;
        const { id } = resolvedParams;

        // Get certificate to delete image from Cloudinary
        const [certificate] = await db
            .select()
            .from(certificates)
            .where(eq(certificates.id, id))
            .limit(1);

        if (!certificate) {
            return errorResponse("Certificate not found", 404);
        }

        // Delete image from Cloudinary
        if (certificate.publicId) {
            await cloudinary.uploader.destroy(certificate.publicId);
        }

        // Delete from database
        await db.delete(certificates).where(eq(certificates.id, id));

        return successResponse("Certificate deleted successfully");
    } catch (error) {
        return errorResponse(error.message || "Failed to delete certificate");
    }
}


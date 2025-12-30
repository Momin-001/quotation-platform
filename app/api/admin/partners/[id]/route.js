import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { partners } from "@/drizzle/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";
import cloudinary from "@/lib/cloudinary";

// PATCH /api/admin/partners/[id] - Update a partner
export async function PATCH(request, { params }) {
    try {
        const resolvedParams = await params;
        const { id } = resolvedParams;
        const formData = await request.formData();
        const name = formData.get("name");
        const websiteUrl = formData.get("websiteUrl");
        const logoFile = formData.get("logo");

        if (!name || !websiteUrl) {
            return errorResponse("Name and website URL are required");
        }

        const updateData = {
            name: name.trim(),
            websiteUrl: websiteUrl.trim(),
            updatedAt: new Date(),
        };

        // If new logo is uploaded, upload to Cloudinary
        if (logoFile && logoFile.size > 0) {
            const bytes = await logoFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const base64Image = `data:${logoFile.type};base64,${buffer.toString('base64')}`;

            // Get current partner to delete old logo
            const currentPartner = await db
                .select()
                .from(partners)
                .where(eq(partners.id, id))
                .limit(1);

            if (currentPartner.length > 0 && currentPartner[0].logoUrl) {
                // Extract public ID from URL and delete from Cloudinary
                const urlParts = currentPartner[0].logoUrl.split('/');
                const publicIdWithExtension = urlParts[urlParts.length - 1];
                const publicId = `partners/${publicIdWithExtension.split('.')[0]}`;

                try {
                    await cloudinary.uploader.destroy(publicId);
                } catch (deleteError) {
                    console.error("Error deleting old logo:", deleteError);
                }
            }

            // Upload new logo
            const uploadResult = await cloudinary.uploader.upload(base64Image, {
                folder: "partners",
                resource_type: "image",
            });

            updateData.logoUrl = uploadResult.secure_url;
        }

        const updatedPartner = await db
            .update(partners)
            .set(updateData)
            .where(eq(partners.id, id))
            .returning();

        if (updatedPartner.length === 0) {
            return errorResponse("Partner not found");
        }

        return successResponse(updatedPartner[0], "Partner updated successfully");
    } catch (error) {
        console.error("Error updating partner:", error);
        return errorResponse("Failed to update partner");
    }
}

// DELETE /api/admin/partners/[id] - Delete a partner
export async function DELETE(request, { params }) {
    try {
        const resolvedParams = await params;
        const { id } = resolvedParams;

        // Get partner to delete logo from Cloudinary
        const partner = await db
            .select()
            .from(partners)
            .where(eq(partners.id, id))
            .limit(1);

        if (partner.length === 0) {
            return errorResponse("Partner not found");
        }

        // Delete logo from Cloudinary
        if (partner[0].logoUrl) {
            const urlParts = partner[0].logoUrl.split('/');
            const publicIdWithExtension = urlParts[urlParts.length - 1];
            const publicId = `partners/${publicIdWithExtension.split('.')[0]}`;

            try {
                await cloudinary.uploader.destroy(publicId);
            } catch (deleteError) {
                console.error("Error deleting logo from Cloudinary:", deleteError);
            }
        }

        // Delete from database
        await db.delete(partners).where(eq(partners.id, id));

        return successResponse({ message: "Partner deleted successfully" });
    } catch (error) {
        console.error("Error deleting partner:", error);
        return errorResponse("Failed to delete partner");
    }
}

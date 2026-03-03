import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { partners } from "@/db/schema";
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
            const [currentPartner] = await db
                .select()
                .from(partners)
                .where(eq(partners.id, id))
                .limit(1);

            if (currentPartner && currentPartner.publicId) {
                await cloudinary.uploader.destroy(currentPartner.publicId);
            }

            // Upload new logo
            const uploadResult = await cloudinary.uploader.upload(base64Image, {
                folder: "QuotationPlatform/partners/images",
                resource_type: "image",
            });

            updateData.logoUrl = uploadResult.secure_url;
            updateData.publicId = uploadResult.public_id;
        }

        const updatedPartner = await db
            .update(partners)
            .set(updateData)
            .where(eq(partners.id, id))
            .returning();

        if (updatedPartner.length === 0) {
            return errorResponse("Partner not found", 404);
        }

        return successResponse("Partner updated successfully", updatedPartner[0]);
    } catch (error) {
        return errorResponse(error.message || "Failed to update partner");
    }
}

// DELETE /api/admin/partners/[id] - Delete a partner
export async function DELETE(request, { params }) {
    try {
        const resolvedParams = await params;    
        const { id } = resolvedParams;

        // Get partner to delete logo from Cloudinary
        const [partner] = await db
            .select()
            .from(partners)
            .where(eq(partners.id, id))
            .limit(1);

        if (!partner) {
            return errorResponse("Partner not found", 404);
        }

        // Delete logo from Cloudinary
        if (partner.publicId) {
            await cloudinary.uploader.destroy(partner.publicId);
        }

        // Delete from database
        await db.delete(partners).where(eq(partners.id, id));

        return successResponse("Partner deleted successfully");
    } catch (error) {
        return errorResponse(error.message || "Failed to delete partner");
    }
}

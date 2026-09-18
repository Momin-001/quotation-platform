import { db } from "@/lib/db";
import { quotations, quotationImages } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/helpers/auth-helpers";
import { eq, asc, and } from "drizzle-orm";
import cloudinary from "@/lib/cloudinary";

const FOLDER = "QuotationPlatform/quotations/images";

async function requireAdmin() {
    const { user, error } = await getCurrentUser();
    if (error || !user) return errorResponse("Unauthorized", 401);
    if (user.role !== "admin" && user.role !== "super_admin") {
        return errorResponse("Forbidden: Admin access required", 403);
    }
    return null;
}

function listImages(quotationId) {
    return db
        .select({
            id: quotationImages.id,
            imageUrl: quotationImages.imageUrl,
            imageOrder: quotationImages.imageOrder,
        })
        .from(quotationImages)
        .where(eq(quotationImages.quotationId, quotationId))
        .orderBy(asc(quotationImages.imageOrder), asc(quotationImages.createdAt));
}

// GET — images attached to the quotation's PDF image section
export async function GET(req, { params }) {
    try {
        const denied = await requireAdmin();
        if (denied) return denied;

        const { id } = await params;
        return successResponse("Quotation images fetched", await listImages(id));
    } catch (error) {
        console.error("GET /api/admin/quotations/[id]/images error:", error);
        return errorResponse("Failed to fetch images", 500);
    }
}

// POST — upload one or more images (multipart, field name "images")
export async function POST(req, { params }) {
    try {
        const denied = await requireAdmin();
        if (denied) return denied;

        const { id } = await params;

        const [quotation] = await db
            .select({ id: quotations.id })
            .from(quotations)
            .where(eq(quotations.id, id))
            .limit(1);
        if (!quotation) return errorResponse("Quotation not found", 404);

        const formData = await req.formData();
        const files = formData.getAll("images").filter((f) => f instanceof File && f.size > 0);
        if (files.length === 0) return errorResponse("No images provided", 400);

        for (const file of files) {
            if (!file.type?.startsWith("image/")) {
                return errorResponse(`"${file.name}" is not an image`, 400);
            }
        }

        // Continue numbering after whatever is already attached
        const existing = await listImages(id);
        let nextOrder = existing.length
            ? Math.max(...existing.map((i) => i.imageOrder ?? 0)) + 1
            : 0;

        const created = [];
        for (const file of files) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;
            const upload = await cloudinary.uploader.upload(dataUri, {
                folder: FOLDER,
                resource_type: "image",
            });

            const [row] = await db
                .insert(quotationImages)
                .values({
                    quotationId: id,
                    imageUrl: upload.secure_url,
                    publicId: upload.public_id,
                    imageOrder: nextOrder++,
                })
                .returning({
                    id: quotationImages.id,
                    imageUrl: quotationImages.imageUrl,
                    imageOrder: quotationImages.imageOrder,
                });
            created.push(row);
        }

        return successResponse(
            `${created.length} image${created.length === 1 ? "" : "s"} uploaded`,
            created
        );
    } catch (error) {
        console.error("POST /api/admin/quotations/[id]/images error:", error);
        return errorResponse("Failed to upload images", 500);
    }
}

// DELETE — remove one image (?imageId=...) from Cloudinary and the database
export async function DELETE(req, { params }) {
    try {
        const denied = await requireAdmin();
        if (denied) return denied;

        const { id } = await params;
        const imageId = new URL(req.url).searchParams.get("imageId");
        if (!imageId) return errorResponse("imageId is required", 400);

        const [image] = await db
            .select()
            .from(quotationImages)
            .where(and(eq(quotationImages.id, imageId), eq(quotationImages.quotationId, id)))
            .limit(1);
        if (!image) return errorResponse("Image not found", 404);

        if (image.publicId) {
            try {
                await cloudinary.uploader.destroy(image.publicId);
            } catch {
                // Remove the row even if the asset is already gone from Cloudinary
            }
        }

        await db.delete(quotationImages).where(eq(quotationImages.id, imageId));

        return successResponse("Image deleted");
    } catch (error) {
        console.error("DELETE /api/admin/quotations/[id]/images error:", error);
        return errorResponse("Failed to delete image", 500);
    }
}

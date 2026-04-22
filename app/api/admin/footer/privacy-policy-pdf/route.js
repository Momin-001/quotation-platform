import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { footer } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import cloudinary, { uploadFooterPrivacyPolicyPdf } from "@/lib/cloudinary";

const MAX_BYTES = 15 * 1024 * 1024;

// POST /api/admin/footer/privacy-policy-pdf — multipart field `file` (PDF)
export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");

        if (!file || typeof file === "string" || file.size === 0) {
            return errorResponse("No PDF file provided", 400);
        }

        if (file.size > MAX_BYTES) {
            return errorResponse("PDF must be 15 MB or smaller", 400);
        }

        const mime = file.type || "";
        const name = file.name || "privacy-policy.pdf";
        if (mime && mime !== "application/pdf") {
            return errorResponse("Only PDF files are allowed", 400);
        }
        if (!name.toLowerCase().endsWith(".pdf")) {
            return errorResponse("Only PDF files are allowed", 400);
        }

        const existing = await db.select().from(footer).limit(1).then((r) => r[0]);
        if (!existing) {
            return errorResponse("Footer row not found. Save footer content once in CMS first.", 404);
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const { secure_url, public_id } = await uploadFooterPrivacyPolicyPdf(buffer, {
            mimeType: mime || "application/pdf",
            originalFilename: name,
        });

        if (existing.privacyPolicyPdfPublicId) {
            await cloudinary.uploader
                .destroy(existing.privacyPolicyPdfPublicId, { resource_type: "image" })
                .catch(() => {});
        }

        await db
            .update(footer)
            .set({
                privacyPolicyPdfUrl: secure_url,
                privacyPolicyPdfPublicId: public_id,
                updatedAt: new Date(),
            })
            .where(eq(footer.id, existing.id));

        return successResponse("Privacy policy PDF uploaded successfully", {
            privacyPolicyPdfUrl: secure_url,
        });
    } catch (error) {
        console.error("Privacy policy PDF upload error:", error);
        return errorResponse(error.message || "Failed to upload PDF", 500);
    }
}

// DELETE /api/admin/footer/privacy-policy-pdf — remove stored PDF from Cloudinary and DB
export async function DELETE() {
    try {
        const existing = await db.select().from(footer).limit(1).then((r) => r[0]);
        if (!existing) {
            return errorResponse("Footer content not found", 404);
        }

        if (existing.privacyPolicyPdfPublicId) {
            await cloudinary.uploader
                .destroy(existing.privacyPolicyPdfPublicId, { resource_type: "image" })
                .catch(() => {});
        }

        await db
            .update(footer)
            .set({
                privacyPolicyPdfUrl: null,
                privacyPolicyPdfPublicId: null,
                updatedAt: new Date(),
            })
            .where(eq(footer.id, existing.id));

        return successResponse("Privacy policy PDF removed successfully");
    } catch (error) {
        console.error("Privacy policy PDF delete error:", error);
        return errorResponse(error.message || "Failed to remove PDF", 500);
    }
}

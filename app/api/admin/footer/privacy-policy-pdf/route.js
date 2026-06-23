import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { footer } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import cloudinary, { uploadFooterPrivacyPolicyPdf } from "@/lib/cloudinary";

const MAX_BYTES = 15 * 1024 * 1024;

// GET /api/admin/footer/privacy-policy-pdf — current stored PDF url (if any)
export async function GET() {
    try {
        const existing = await db
            .select({ privacyPolicyPdfUrl: footer.privacyPolicyPdfUrl })
            .from(footer)
            .limit(1)
            .then((r) => r[0]);

        return successResponse("Privacy policy PDF fetched", {
            privacyPolicyPdfUrl: existing?.privacyPolicyPdfUrl || null,
        });
    } catch (error) {
        console.error("GET /api/admin/footer/privacy-policy-pdf error:", error);
        return errorResponse("Failed to fetch PDF", 500);
    }
}

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

        let existing = await db.select().from(footer).limit(1).then((r) => r[0]);
        if (!existing) {
            // No footer row yet (footer content is now static) — create one to hold the PDF.
            [existing] = await db.insert(footer).values({}).returning();
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
        console.error("POST /api/admin/footer/privacy-policy-pdf error:", error);
        return errorResponse("Failed to upload PDF", 500);
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
        console.error("DELETE /api/admin/footer/privacy-policy-pdf error:", error);
        return errorResponse("Failed to remove PDF", 500);
    }
}

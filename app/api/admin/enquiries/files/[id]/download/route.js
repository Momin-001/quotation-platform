import { db } from "@/lib/db";
import { enquiryFiles } from "@/db/schema";
import { errorResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth-helpers";
import cloudinary from "@/lib/cloudinary";

export async function GET(req, { params }) {
    try {
        const { user, error } = await getCurrentUser();
        if (error || !user) {
            return errorResponse("Unauthorized", 401);
        }
        if (user.role !== "admin" && user.role !== "super_admin") {
            return errorResponse("Forbidden", 403);
        }

        const { id } = await params;
        if (!id) {
            return errorResponse("File ID is required", 400);
        }

        const [file] = await db
            .select({
                fileUrl: enquiryFiles.fileUrl,
                fileName: enquiryFiles.fileName,
                publicId: enquiryFiles.publicId,
            })
            .from(enquiryFiles)
            .where(eq(enquiryFiles.id, id))
            .limit(1);

        if (!file || !file.fileUrl) {
            return errorResponse("File not found", 404);
        }

        // Primary source: stored URL
        let res = await fetch(file.fileUrl, {
            headers: { Accept: "application/octet-stream" },
        });

        // Fallback for previously uploaded records where stored URL may not be fetchable
        if (!res.ok && file.publicId) {
            const rawUrl = cloudinary.url(file.publicId, { resource_type: "raw", secure: true });
            res = await fetch(rawUrl, {
                headers: { Accept: "application/octet-stream" },
            });
        }

        if (!res.ok && file.publicId) {
            const imageUrl = cloudinary.url(file.publicId, { resource_type: "image", secure: true });
            res = await fetch(imageUrl, {
                headers: { Accept: "application/octet-stream" },
            });
        }

        if (!res.ok) {
            return errorResponse("Failed to fetch file", 502);
        }

        const blob = await res.blob();
        const buffer = Buffer.from(await blob.arrayBuffer());
        const fileName = file.fileName || "download";

        return new Response(buffer, {
            headers: {
                "Content-Type": res.headers.get("content-type") || "application/octet-stream",
                "Content-Disposition": `attachment; filename="${fileName.replace(/[/\\:*?"<>|]/g, "_")}"`,
                "Cache-Control": "no-cache",
            },
        });
    } catch (err) {
        console.error("Enquiry file download error:", err);
        return errorResponse(err.message || "Failed to download file", 500);
    }
}

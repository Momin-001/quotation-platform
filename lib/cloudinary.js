import path from "path";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MIME_EXT = {
    "application/pdf": ".pdf",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
};

function sanitizeBasename(name) {
    if (name == null || typeof name !== "string") return null;
    const base = path.basename(name.trim());
    if (!base || base === "." || base === "..") return null;
    return base.replace(/[/\\]/g, "").slice(0, 180);
}

/** Readable filename for Cloudinary `filename_override` (extension helps delivery). */
export function filenameForUpload(originalFilename, mimeType) {
    let base = sanitizeBasename(originalFilename);
    const mime = (mimeType || "application/octet-stream").toLowerCase();

    if (base && !path.extname(base)) {
        const ext = MIME_EXT[mime] || "";
        if (ext) base = `${base}${ext}`;
    }

    if (!base) {
        const ext = MIME_EXT[mime] || ".bin";
        base = `document${ext}`;
    }

    return base;
}

/**
 * PDFs use resource_type `image` so Cloudinary can serve them for in-browser viewing.
 * @see https://cloudinary.com/documentation/upload_parameters#uploading_pdfs
 */
function resourceTypeForUpload(mimeType, originalFilename) {
    const mime = (mimeType || "").toLowerCase();
    if (mime.startsWith("image/")) return "image";
    if (mime === "application/pdf") return "image";
    const lower = (originalFilename || "").toLowerCase();
    if (lower.endsWith(".pdf")) return "image";
    return "raw";
}

/**
 * @param {Buffer} buffer
 * @param {{ mimeType?: string, originalFilename?: string }} meta
 * @returns {Promise<{ secure_url: string, public_id: string }>}
 */
export function uploadFooterPrivacyPolicyPdf(buffer, { mimeType, originalFilename } = {}) {
    const filenameOverride = filenameForUpload(originalFilename, mimeType);
    const resourceType = resourceTypeForUpload(mimeType, originalFilename);

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "QuotationPlatform/footer",
                resource_type: resourceType,
                use_filename: true,
                unique_filename: true,
                filename_override: filenameOverride,
            },
            (err, result) => {
                if (err) reject(err);
                else resolve({ secure_url: result.secure_url, public_id: result.public_id });
            }
        );
        stream.end(buffer);
    });
}

export default cloudinary;

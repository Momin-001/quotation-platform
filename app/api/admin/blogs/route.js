import { db } from "@/lib/db";
import { blogs, blogContentBlocks } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { desc } from "drizzle-orm";
import cloudinary from "@/lib/cloudinary";

export async function GET() {
    try {
        const allBlogs = await db
            .select()
            .from(blogs)
            .orderBy(desc(blogs.createdAt));

        return successResponse("Blogs fetched successfully", allBlogs);
    } catch (error) {
        return errorResponse(error.message || "Failed to fetch blogs");
    }
}

export async function POST(request) {
    try {
        const formData = await request.formData();
        const payload = JSON.parse(formData.get("payload"));
        const mainImageFile = formData.get("mainImage");
        const partnerAdImageFile = formData.get("partnerAdImage");

        const { title, authorName, mainContentHtml, partnerAdLinkUrl, contentBlocks } = payload;

        if (!title?.trim() || !authorName?.trim()) {
            return errorResponse("Title and author name are required", 400);
        }

        if (!mainImageFile) {
            return errorResponse("Main image is required", 400);
        }

        const bytes = await mainImageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = `data:${mainImageFile.type};base64,${buffer.toString("base64")}`;
        const mainUpload = await cloudinary.uploader.upload(base64, {
            folder: "QuotationPlatform/blogs/images",
            resource_type: "image",
        });

        let partnerAdImageUrl = null;
        let partnerAdImagePublicId = null;
        if (partnerAdImageFile && partnerAdImageFile.size > 0) {
            const pBytes = await partnerAdImageFile.arrayBuffer();
            const pBuffer = Buffer.from(pBytes);
            const pBase64 = `data:${partnerAdImageFile.type};base64,${pBuffer.toString("base64")}`;
            const pUpload = await cloudinary.uploader.upload(pBase64, {
                folder: "QuotationPlatform/blogs/partner-ads",
                resource_type: "image",
            });
            partnerAdImageUrl = pUpload.secure_url;
            partnerAdImagePublicId = pUpload.public_id;
        }

        const [newBlog] = await db
            .insert(blogs)
            .values({
                title: title.trim(),
                authorName: authorName.trim(),
                mainImageUrl: mainUpload.secure_url,
                mainImagePublicId: mainUpload.public_id,
                mainContentHtml: mainContentHtml || "",
                partnerAdImageUrl,
                partnerAdImagePublicId,
                partnerAdLinkUrl: partnerAdLinkUrl?.trim() || null,
            })
            .returning();

        if (contentBlocks?.length > 0) {
            for (let i = 0; i < contentBlocks.length; i++) {
                const block = contentBlocks[i];
                let imageUrl = null;
                let imagePublicId = null;

                const blockImageFile = formData.get(`blockImage_${i}`);
                if (blockImageFile && blockImageFile.size > 0) {
                    const bBytes = await blockImageFile.arrayBuffer();
                    const bBuffer = Buffer.from(bBytes);
                    const bBase64 = `data:${blockImageFile.type};base64,${bBuffer.toString("base64")}`;
                    const bUpload = await cloudinary.uploader.upload(bBase64, {
                        folder: "QuotationPlatform/blogs/content-blocks",
                        resource_type: "image",
                    });
                    imageUrl = bUpload.secure_url;
                    imagePublicId = bUpload.public_id;
                }

                await db.insert(blogContentBlocks).values({
                    blogId: newBlog.id,
                    sortOrder: i,
                    textHtml: block.textHtml || "",
                    imageUrl,
                    imagePublicId,
                });
            }
        }

        return successResponse("Blog created successfully", newBlog);
    } catch (error) {
        return errorResponse(error.message || "Failed to create blog");
    }
}

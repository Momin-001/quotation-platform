import { db } from "@/lib/db";
import { blogs, blogContentBlocks } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq, asc } from "drizzle-orm";
import cloudinary from "@/lib/cloudinary";

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const blog = await db.select().from(blogs).where(eq(blogs.id, id)).then((r) => r[0]);
        if (!blog) return errorResponse("Blog not found", 404);

        const blocks = await db
            .select()
            .from(blogContentBlocks)
            .where(eq(blogContentBlocks.blogId, id))
            .orderBy(asc(blogContentBlocks.sortOrder));

        return successResponse("Blog fetched successfully", { ...blog, contentBlocks: blocks });
    } catch (error) {
        return errorResponse(error.message || "Failed to fetch blog");
    }
}

export async function PATCH(request, { params }) {
    try {
        const { id } = await params;
        const formData = await request.formData();
        const payload = JSON.parse(formData.get("payload"));
        const mainImageFile = formData.get("mainImage");
        const partnerAdImageFile = formData.get("partnerAdImage");

        const { title, authorName, mainContentHtml, partnerAdLinkUrl, contentBlocks, removePartnerAd } = payload;

        if (!title?.trim() || !authorName?.trim()) {
            return errorResponse("Title and author name are required", 400);
        }

        const existing = await db.select().from(blogs).where(eq(blogs.id, id)).then((r) => r[0]);
        if (!existing) return errorResponse("Blog not found", 404);

        const updateData = {
            title: title.trim(),
            authorName: authorName.trim(),
            mainContentHtml: mainContentHtml || "",
            partnerAdLinkUrl: partnerAdLinkUrl?.trim() || null,
            updatedAt: new Date(),
        };

        if (mainImageFile && mainImageFile.size > 0) {
            if (existing.mainImagePublicId) {
                await cloudinary.uploader.destroy(existing.mainImagePublicId).catch(() => {});
            }
            const bytes = await mainImageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const base64 = `data:${mainImageFile.type};base64,${buffer.toString("base64")}`;
            const upload = await cloudinary.uploader.upload(base64, {
                folder: "QuotationPlatform/blogs/images",
                resource_type: "image",
            });
            updateData.mainImageUrl = upload.secure_url;
            updateData.mainImagePublicId = upload.public_id;
        }

        if (removePartnerAd) {
            if (existing.partnerAdImagePublicId) {
                await cloudinary.uploader.destroy(existing.partnerAdImagePublicId).catch(() => {});
            }
            updateData.partnerAdImageUrl = null;
            updateData.partnerAdImagePublicId = null;
        } else if (partnerAdImageFile && partnerAdImageFile.size > 0) {
            if (existing.partnerAdImagePublicId) {
                await cloudinary.uploader.destroy(existing.partnerAdImagePublicId).catch(() => {});
            }
            const pBytes = await partnerAdImageFile.arrayBuffer();
            const pBuffer = Buffer.from(pBytes);
            const pBase64 = `data:${partnerAdImageFile.type};base64,${pBuffer.toString("base64")}`;
            const pUpload = await cloudinary.uploader.upload(pBase64, {
                folder: "QuotationPlatform/blogs/partner-ads",
                resource_type: "image",
            });
            updateData.partnerAdImageUrl = pUpload.secure_url;
            updateData.partnerAdImagePublicId = pUpload.public_id;
        }

        const [updatedBlog] = await db.update(blogs).set(updateData).where(eq(blogs.id, id)).returning();

        // Replace content blocks: delete old ones, then insert new
        const oldBlocks = await db
            .select()
            .from(blogContentBlocks)
            .where(eq(blogContentBlocks.blogId, id));

        for (const oldBlock of oldBlocks) {
            if (oldBlock.imagePublicId) {
                const isReused = contentBlocks?.some((b) => b.existingImageUrl === oldBlock.imageUrl);
                if (!isReused) {
                    await cloudinary.uploader.destroy(oldBlock.imagePublicId).catch(() => {});
                }
            }
        }

        await db.delete(blogContentBlocks).where(eq(blogContentBlocks.blogId, id));

        if (contentBlocks?.length > 0) {
            for (let i = 0; i < contentBlocks.length; i++) {
                const block = contentBlocks[i];
                let imageUrl = block.existingImageUrl || null;
                let imagePublicId = block.existingImagePublicId || null;

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
                    blogId: id,
                    sortOrder: i,
                    textHtml: block.textHtml || "",
                    imageUrl,
                    imagePublicId,
                });
            }
        }

        return successResponse("Blog updated successfully", updatedBlog);
    } catch (error) {
        return errorResponse(error.message || "Failed to update blog");
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        const blog = await db.select().from(blogs).where(eq(blogs.id, id)).then((r) => r[0]);
        if (!blog) return errorResponse("Blog not found", 404);

        // Clean up Cloudinary images
        if (blog.mainImagePublicId) {
            await cloudinary.uploader.destroy(blog.mainImagePublicId).catch(() => {});
        }
        if (blog.partnerAdImagePublicId) {
            await cloudinary.uploader.destroy(blog.partnerAdImagePublicId).catch(() => {});
        }

        const blocks = await db
            .select()
            .from(blogContentBlocks)
            .where(eq(blogContentBlocks.blogId, id));

        for (const block of blocks) {
            if (block.imagePublicId) {
                await cloudinary.uploader.destroy(block.imagePublicId).catch(() => {});
            }
        }

        await db.delete(blogs).where(eq(blogs.id, id));

        return successResponse("Blog deleted successfully");
    } catch (error) {
        return errorResponse(error.message || "Failed to delete blog");
    }
}

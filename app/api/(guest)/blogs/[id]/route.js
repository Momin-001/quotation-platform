import { db } from "@/lib/db";
import { blogs, blogContentBlocks } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq, asc } from "drizzle-orm";

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

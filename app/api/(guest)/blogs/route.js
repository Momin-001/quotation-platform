import { db } from "@/lib/db";
import { blogs } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { desc } from "drizzle-orm";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit")) || 0;

        let query = db
            .select({
                id: blogs.id,
                title: blogs.title,
                authorName: blogs.authorName,
                mainImageUrl: blogs.mainImageUrl,
                createdAt: blogs.createdAt,
            })
            .from(blogs)
            .orderBy(desc(blogs.createdAt));

        if (limit > 0) {
            query = query.limit(limit);
        }

        const allBlogs = await query;

        return successResponse("Blogs fetched successfully", allBlogs);
    } catch (error) {
        return errorResponse(error.message || "Failed to fetch blogs");
    }
}

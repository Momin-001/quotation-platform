import { successResponse, errorResponse } from "@/lib/api-response";
import { fetchGuestBlogBySlug } from "@/features/blogs/guest-blog-detail";

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const blog = await fetchGuestBlogBySlug(id);
        if (!blog) return errorResponse("Blog not found", 404);

        return successResponse("Blog fetched successfully", blog);
    } catch (error) {
        console.error("GET /api/blogs/[id] error:", error);
        return errorResponse("Failed to fetch blog", 500);
    }
}

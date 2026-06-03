import { successResponse, errorResponse } from "@/lib/api-response";
import { fetchGuestBlogsListing } from "@/features/blogs/guest-blogs-list";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit"), 10) || 0;

        const allBlogs = await fetchGuestBlogsListing({ limit });

        return successResponse("Blogs fetched successfully", allBlogs);
    } catch (error) {
        console.error("GET /api/blogs error:", error);
        return errorResponse("Failed to fetch blogs", 500);
    }
}

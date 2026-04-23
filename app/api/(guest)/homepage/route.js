import { db } from "@/lib/db";
import { homepage } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/homepage - Get homepage content (public)
export async function GET() {
    try {
        const [homepageContent] = await db.select().from(homepage).limit(1);

        // If no homepage content exists, return empty data
        if (!homepageContent) {
            return errorResponse("Homepage content not found");
        }

        return successResponse("Homepage content fetched successfully", homepageContent);
    } catch (error) {
        console.error("GET /api/homepage error:", error);
        return errorResponse("Failed to fetch homepage content", 500);
    }
}


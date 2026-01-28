import { db } from "@/lib/db";
import { homepage } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/homepage - Get homepage content (public)
export async function GET() {
    try {
        const homepageContent = await db.select().from(homepage).limit(1).then((res) => res[0]);

        // If no homepage content exists, return empty data
        if (!homepageContent) {
            return successResponse({}, "Homepage content fetched successfully");
        }

        return successResponse("Homepage content fetched successfully", homepageContent);
    } catch (error) {
        return errorResponse(error.message || "Failed to fetch homepage content");
    }
}


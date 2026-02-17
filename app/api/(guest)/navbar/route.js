import { db } from "@/lib/db";
import { navbar } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/navbar - Get navbar content (public)
export async function GET() {
    try {
        const [navbarContent] = await db.select().from(navbar).limit(1);

        // If no navbar content exists, return empty data
        if (!navbarContent) {
            return errorResponse("Navbar content not found");
        }

        return successResponse("Navbar content fetched successfully", navbarContent);
    } catch (error) {
        return errorResponse(error.message || "Failed to fetch navbar content");
    }
}


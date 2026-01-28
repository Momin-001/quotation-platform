import { db } from "@/lib/db";
import { footer } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/footer - Get footer content for frontend
export async function GET() {
    try {
        const footerContent = await db.select().from(footer).limit(1).then((res) => res[0]);

        if (!footerContent) {
            // Return empty object if no footer content exists
            return successResponse("Footer content fetched successfully");
        }

        return successResponse("Footer content fetched successfully", footerContent);
    } catch (error) {
        return errorResponse(error.message || "Failed to fetch footer content");
    }
}



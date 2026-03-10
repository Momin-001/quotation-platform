import { db } from "@/lib/db";
import { userHeader } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/user-header - Get user header content (public)
export async function GET() {
    try {
        const userHeaderContent = await db.select().from(userHeader).limit(1).then((res) => res[0]);
        if (!userHeaderContent) {
            return errorResponse("User header content not found");
        }
        return successResponse("User header content fetched successfully", userHeaderContent);
    } catch (error) {
        return errorResponse(error.message || "Failed to fetch user header content");
    }
}
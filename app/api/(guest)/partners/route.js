import { db } from "@/lib/db";
import { partners } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/partners - Get all partners (public)
export async function GET() {
    try {
        const allPartners = await db
            .select({
                id: partners.id,
                name: partners.name,
                logoUrl: partners.logoUrl,
                websiteUrl: partners.websiteUrl,
            })
            .from(partners)
            .orderBy(partners.name);

        return successResponse("Partners fetched successfully", allPartners);
    } catch (error) {
        return errorResponse(error.message || "Failed to fetch partners");
    }
}


import { db } from "@/lib/db";
import { advertisements } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq, desc } from "drizzle-orm";

// GET /api/advertisements - Get active advertisements (public, for the refurbished listing banner)
export async function GET() {
    try {
        const rows = await db
            .select({
                id: advertisements.id,
                title: advertisements.title,
                imageUrl: advertisements.imageUrl,
                redirectUrl: advertisements.redirectUrl,
            })
            .from(advertisements)
            .where(eq(advertisements.isActive, true))
            .orderBy(desc(advertisements.createdAt));

        return successResponse("Advertisements fetched successfully", rows);
    } catch (error) {
        console.error("GET /api/advertisements error:", error);
        return errorResponse("Failed to fetch advertisements", 500);
    }
}

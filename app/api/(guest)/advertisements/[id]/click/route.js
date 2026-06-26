import { db } from "@/lib/db";
import { advertisements } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";

// POST /api/advertisements/[id]/click - Increment advertisement click count
export async function POST(req, { params }) {
    try {
        const { id } = await params;
        if (!id) {
            return errorResponse("Advertisement ID is required", 400);
        }

        const [ad] = await db.select().from(advertisements).where(eq(advertisements.id, id)).limit(1);
        if (!ad) {
            return errorResponse("Advertisement not found", 404);
        }

        const [updated] = await db
            .update(advertisements)
            .set({ clickCount: ad.clickCount + 1, updatedAt: new Date() })
            .where(eq(advertisements.id, id))
            .returning();

        return successResponse("Click count updated successfully", updated);
    } catch (error) {
        console.error("POST /api/advertisements/[id]/click error:", error);
        return errorResponse("Failed to update click count", 500);
    }
}

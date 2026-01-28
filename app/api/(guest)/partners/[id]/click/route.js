import { db } from "@/lib/db";
import { partners } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";

// POST /api/partners/[id]/click - Increment partner click count
export async function POST(req, { params }) {
    try {
        const { id } = await params;

        if (!id) {
            return errorResponse("Partner ID is required", 400);
        }

        // Get current partner
        const partner = await db
            .select()
            .from(partners)
            .where(eq(partners.id, id))
            .then((res) => res[0]);

        if (!partner) {
            return errorResponse("Partner not found", 404);
        }

        // Increment click count
        const updatedPartner = await db
            .update(partners)
            .set({
                clickCount: partner.clickCount + 1,
                updatedAt: new Date(),
            })
            .where(eq(partners.id, id))
            .returning();

        return successResponse("Click count updated successfully", updatedPartner[0]);
    } catch (error) {
        return errorResponse(error.message || "Failed to update click count");
    }
}


import { db } from "@/lib/db";
import { controllers, productImages } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";

// PATCH /api/admin/controllers/[id]/toggle-status - Toggle controller active status
export async function PATCH(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { isActive } = body;

        const controller = await db
            .select({ id: controllers.id, isActive: controllers.isActive })
            .from(controllers)
            .where(eq(controllers.id, id))
            .limit(1)
            .then((r) => r[0]);

        if (!controller) {
            return errorResponse("Controller not found", 404);
        }

        if (isActive === true) {
            const images = await db
                .select({ id: productImages.id })
                .from(productImages)
                .where(eq(productImages.controllerId, id))
                .limit(1);

            if (images.length === 0) {
                return errorResponse(
                    "Cannot activate controller without images. Please add at least one image first.",
                    400
                );
            }
        }

        await db
            .update(controllers)
            .set({ isActive, updatedAt: new Date() })
            .where(eq(controllers.id, id));

        return successResponse(
            isActive ? "Controller activated successfully" : "Controller deactivated successfully"
        );
    } catch (error) {
        return errorResponse(error.message || "Failed to toggle controller status");
    }
}

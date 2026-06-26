import { db } from "@/lib/db";
import { refurbishedProducts, refurbishedProductImages } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";

// PATCH /api/admin/refurbished-products/[id]/toggle-status - Toggle active status
export async function PATCH(request, { params }) {
    try {
        const { id } = await params;
        const { isActive } = await request.json();

        const product = await db
            .select({ id: refurbishedProducts.id })
            .from(refurbishedProducts)
            .where(eq(refurbishedProducts.id, id))
            .limit(1)
            .then((r) => r[0]);

        if (!product) {
            return errorResponse("Refurbished product not found", 404);
        }

        // Require at least one image to activate
        if (isActive === true) {
            const images = await db
                .select({ id: refurbishedProductImages.id })
                .from(refurbishedProductImages)
                .where(eq(refurbishedProductImages.refurbishedProductId, id))
                .limit(1);

            if (images.length === 0) {
                return errorResponse(
                    "Cannot activate refurbished product without images. Please add at least one image first.",
                    400
                );
            }
        }

        await db
            .update(refurbishedProducts)
            .set({ isActive, updatedAt: new Date() })
            .where(eq(refurbishedProducts.id, id));

        return successResponse(
            isActive ? "Refurbished product activated successfully" : "Refurbished product deactivated successfully"
        );
    } catch (error) {
        console.error("PATCH /api/admin/refurbished-products/[id]/toggle-status error:", error);
        return errorResponse("Failed to toggle refurbished product status", 500);
    }
}

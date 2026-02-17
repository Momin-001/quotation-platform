import { db } from "@/lib/db";
import { products, productImages } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";

// PATCH /api/admin/products/[id]/toggle-status - Toggle product active status
export async function PATCH(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { isActive } = body;

        // Check if product exists
        const product = await db
            .select({ id: products.id, isActive: products.isActive })
            .from(products)
            .where(eq(products.id, id))
            .limit(1)
            .then((r) => r[0]);

        if (!product) {
            return errorResponse("Product not found", 404);
        }

        // If trying to activate, check if product has at least one image
        if (isActive === true) {
            const images = await db
                .select({ id: productImages.id })
                .from(productImages)
                .where(eq(productImages.productId, id))
                .limit(1);

            if (images.length === 0) {
                return errorResponse(
                    "Cannot activate product without images. Please add at least one image first.",
                    400
                );
            }
        }

        await db
            .update(products)
            .set({ isActive, updatedAt: new Date() })
            .where(eq(products.id, id));

        return successResponse(
            isActive ? "Product activated successfully" : "Product deactivated successfully"
        );
    } catch (error) {
        return errorResponse(error.message || "Failed to toggle product status");
    }
}

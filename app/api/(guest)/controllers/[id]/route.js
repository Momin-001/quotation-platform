import { db } from "@/lib/db";
import { controllers, productImages } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq, and } from "drizzle-orm";

export async function GET(req, { params }) {
    try {
        const { id } = await params;

        if (!id) {
            return errorResponse("Controller ID is required", 400);
        }

        const [controller] = await db
            .select()
            .from(controllers)
            .where(and(eq(controllers.id, id), eq(controllers.isActive, true)))
            .limit(1);

        if (!controller) {
            return errorResponse("Controller not found", 404);
        }

        const imageRows = await db
            .select({ imageUrl: productImages.imageUrl })
            .from(productImages)
            .where(eq(productImages.controllerId, id))
            .orderBy(productImages.imageOrder);

        const images = imageRows.map((r) => r.imageUrl);

        return successResponse("Controller fetched successfully", {
            ...controller,
            images,
            brandDisplay: controller.brandName === "Other"
                ? (controller.brandNameOther || "Other")
                : (controller.brandName || "N/A"),
        });
    } catch (error) {
        console.error("GET /api/controllers/[id] error:", error);
        return errorResponse("Failed to fetch controller", 500);
    }
}

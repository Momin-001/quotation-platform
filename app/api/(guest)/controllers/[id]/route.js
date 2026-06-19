import { successResponse, errorResponse } from "@/lib/api-response";
import { fetchGuestControllerBySlug } from "@/features/controllers/guest-controller-detail";

export async function GET(req, { params }) {
    try {
        const { id } = await params;

        if (!id) {
            return errorResponse("Controller slug is required", 400);
        }

        const controller = await fetchGuestControllerBySlug(id);

        if (!controller) {
            return errorResponse("Controller not found", 404);
        }

        return successResponse("Controller fetched successfully", controller);
    } catch (error) {
        console.error("GET /api/controllers/[id] error:", error);
        return errorResponse("Failed to fetch controller", 500);
    }
}

import { successResponse, errorResponse } from "@/lib/api-response";
import { fetchGuestProductBySlug } from "@/features/products/guest-product-detail";

export async function GET(req, { params }) {
    try {
        const { id: slug } = await params;

        if (!slug) {
            return errorResponse("Product slug is required", 400);
        }

        const product = await fetchGuestProductBySlug(slug);

        if (!product) {
            return errorResponse("Product not found", 404);
        }

        return successResponse("Product fetched successfully", product);
    } catch (error) {
        console.error("GET /api/products/[id] error:", error);
        return errorResponse("Failed to fetch product", 500);
    }
}

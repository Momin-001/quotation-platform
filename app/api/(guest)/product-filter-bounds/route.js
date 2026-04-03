import { getOrCreateProductFilterBounds, serializeProductFilterBounds } from "@/lib/product-filter-bounds";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET() {
    try {
        const row = await getOrCreateProductFilterBounds();
        return successResponse("Filter bounds fetched successfully", serializeProductFilterBounds(row));
    } catch (error) {
        return errorResponse(error.message || "Failed to fetch filter bounds");
    }
}

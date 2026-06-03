import { successResponse, errorResponse } from "@/lib/api-response";
import { fetchGuestControllersListing } from "@/lib/guest-controllers-list";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const brand = searchParams.get("brand") || "";
        const offset = (page - 1) * limit;

        const result = await fetchGuestControllersListing({
            limit,
            offset,
            search,
            brand,
        });

        return successResponse("Controllers fetched successfully", result);
    } catch (error) {
        console.error("GET /api/controllers error:", error);
        return errorResponse("Failed to fetch controllers", 500);
    }
}

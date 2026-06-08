import { successResponse, errorResponse } from "@/lib/api-response";
import { fetchGuestFaqsListing } from "@/features/faqs/guest-faqs-list";

// GET /api/faqs - Fetch all FAQs for public display
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit"), 10) || 0;

        const allFaqs = await fetchGuestFaqsListing({ limit });

        return successResponse("FAQs fetched successfully", allFaqs);
    } catch (error) {
        console.error("GET /api/faqs error:", error);
        return errorResponse("Failed to fetch FAQs", 500);
    }
}

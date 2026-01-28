import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { faqs } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { asc } from "drizzle-orm";

// GET /api/faqs - Fetch all FAQs for public display
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get("limit"); // Optional limit for homepage (e.g., first 6)

        let query = db
            .select()
            .from(faqs)
            .orderBy(asc(faqs.createdAt));

        if (limit) {
            const limitNum = parseInt(limit);
            if (!isNaN(limitNum) && limitNum > 0) {
                const allFaqs = await query;
                return successResponse("FAQs fetched successfully", allFaqs.slice(0, limitNum));
            }
        }

        const allFaqs = await query;
        return successResponse("FAQs fetched successfully", allFaqs);
    } catch (error) {
        return errorResponse(error.message || "Failed to fetch FAQs");
    }
}

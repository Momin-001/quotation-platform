import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { faqs } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { desc } from "drizzle-orm";

// GET /api/admin/faqs - Fetch all FAQs
export async function GET() {
    try {
        const allFaqs = await db
            .select()
            .from(faqs)
            .orderBy(desc(faqs.createdAt));

        return successResponse("FAQs fetched successfully", allFaqs);
    } catch (error) {
        console.error("GET /api/admin/faqs error:", error);
        return errorResponse("Failed to fetch FAQs", 500);
    }
}

// POST /api/admin/faqs - Create a new FAQ
export async function POST(request) {
    try {
        const body = await request.json();
        const { titleEn, titleDe, descriptionEn, descriptionDe } = body;

        // Validate required fields
        if (!titleEn || !titleEn.trim() || !titleDe || !titleDe.trim() || !descriptionEn || !descriptionEn.trim() || !descriptionDe || !descriptionDe.trim()) {
            return errorResponse("All fields are required", 400);
        }

        const newFaq = await db
            .insert(faqs)
            .values({
                titleEn: titleEn.trim(),
                titleDe: titleDe.trim(),
                descriptionEn: descriptionEn.trim(),
                descriptionDe: descriptionDe.trim(),
            })
            .returning();

        return successResponse("FAQ created successfully", newFaq[0]);
    } catch (error) {
        console.error("POST /api/admin/faqs error:", error);
        return errorResponse("Failed to create FAQ", 500);
    }
}

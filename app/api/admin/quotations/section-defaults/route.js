import { db } from "@/lib/db";
import { quotationSectionDefaults } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getOrCreateSectionDefaults } from "@/lib/quotation-section-defaults";
import { eq } from "drizzle-orm";

export async function GET() {
    try {
        const defaults = await getOrCreateSectionDefaults();
        return successResponse("Section defaults fetched", defaults);
    } catch (err) {
        console.error("Error fetching section defaults:", err);
        return errorResponse(err.message || "Failed to fetch section defaults");
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        const { sectionOfferHtml, sectionConditionsHtml, sectionOptionsHtml } = body;

        // Ensure the row exists
        const existing = await getOrCreateSectionDefaults();

        const [row] = await db.select().from(quotationSectionDefaults).limit(1);

        const [updated] = await db
            .update(quotationSectionDefaults)
            .set({
                sectionOfferHtml: sectionOfferHtml ?? existing.sectionOfferHtml,
                sectionConditionsHtml: sectionConditionsHtml ?? existing.sectionConditionsHtml,
                sectionOptionsHtml: sectionOptionsHtml ?? existing.sectionOptionsHtml,
                updatedAt: new Date(),
            })
            .where(eq(quotationSectionDefaults.id, row.id))
            .returning();

        return successResponse("Section defaults updated", {
            sectionOfferHtml: updated.sectionOfferHtml,
            sectionConditionsHtml: updated.sectionConditionsHtml,
            sectionOptionsHtml: updated.sectionOptionsHtml,
        });
    } catch (err) {
        console.error("Error updating section defaults:", err);
        return errorResponse(err.message || "Failed to update section defaults");
    }
}

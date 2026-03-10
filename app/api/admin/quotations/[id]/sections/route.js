import { db } from "@/lib/db";
import { quotations } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";

export async function GET(req, { params }) {
    try {
        const { id } = await params;
        const [quotation] = await db
            .select({
                sectionOfferHtml: quotations.sectionOfferHtml,
                sectionConditionsHtml: quotations.sectionConditionsHtml,
                sectionOptionsHtml: quotations.sectionOptionsHtml,
            })
            .from(quotations)
            .where(eq(quotations.id, id))
            .limit(1);

        if (!quotation) 
            return errorResponse("Quotation not found", 404);

        return successResponse("Quotation sections fetched", quotation);
    } catch (err) {
        console.error("Error fetching quotation sections:", err);
        return errorResponse(err.message || "Failed to fetch sections");
    }
}

export async function PUT(req, { params }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { sectionOfferHtml, sectionConditionsHtml, sectionOptionsHtml } = body;

        const [existing] = await db
            .select()
            .from(quotations)
            .where(eq(quotations.id, id))
            .limit(1);

        if (!existing) return errorResponse("Quotation not found", 404);

        const updateData = { updatedAt: new Date() };
        if (sectionOfferHtml !== undefined) updateData.sectionOfferHtml = sectionOfferHtml;
        if (sectionConditionsHtml !== undefined) updateData.sectionConditionsHtml = sectionConditionsHtml;
        if (sectionOptionsHtml !== undefined) updateData.sectionOptionsHtml = sectionOptionsHtml;

        await db
            .update(quotations)
            .set(updateData)
            .where(eq(quotations.id, id));

        return successResponse("Quotation sections updated");
    } catch (err) {
        console.error("Error updating quotation sections:", err);
        return errorResponse(err.message || "Failed to update sections");
    }
}

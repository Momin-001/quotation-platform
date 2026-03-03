import { getCurrentUser } from "@/lib/auth-helpers";
import { errorResponse } from "@/lib/api-response";
import { getQuotationDataForPDF } from "@/lib/get-quotation-pdf-data";
import { generateQuotationPDF } from "@/lib/quotation-pdf";

export async function GET(req, { params }) {
    try {
        const { user, error } = await getCurrentUser();
        if (error || !user) {
            return errorResponse("Unauthorized", 401);
        }
        if (user.role !== "admin" && user.role !== "super_admin") {
            return errorResponse("Forbidden: Admin access required", 403);
        }

        const { id } = await params;
        if (!id) {
            return errorResponse("Quotation ID is required", 400);
        }

        const data = await getQuotationDataForPDF(id, { isAdmin: true });
        if (!data) {
            return errorResponse("Quotation not found", 404);
        }

        const buffer = await generateQuotationPDF(data);
        const filename = `Angebot-${data.quotation.quotationNumber}.pdf`;

        return new Response(buffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });
    } catch (err) {
        console.error("Error generating quotation PDF:", err);
        return errorResponse(err.message || "Failed to generate PDF", 500);
    }
}

import { db } from "@/lib/db";
import { products } from "@/db/schema";
import { errorResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";

const TYPES = {
    installationManual: { urlCol: "installationManualUrl", filename: "Installation_Manual.pdf" },
    maintenanceGuide: { urlCol: "maintenanceGuideUrl", filename: "Maintenance_Guide.pdf" },
    certificatesPdf: { urlCol: "certificatesPdfUrl", filename: "Certificates.pdf" },
};

export async function GET(req, { params }) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type");

        if (!id || !type || !TYPES[type]) {
            return errorResponse("Invalid product or download type", 400);
        }

        const product = await db
            .select({
                installationManualUrl: products.installationManualUrl,
                maintenanceGuideUrl: products.maintenanceGuideUrl,
                certificatesPdfUrl: products.certificatesPdfUrl,
            })
            .from(products)
            .where(eq(products.id, id))
            .limit(1)
            .then((r) => r[0]);

        if (!product) {
            return errorResponse("Product not found", 404);
        }

        const pdfUrl = product[TYPES[type].urlCol];
        if (!pdfUrl) {
            return errorResponse("PDF not available for this product", 404);
        }

        const res = await fetch(pdfUrl, { headers: { Accept: "application/pdf" } });
        if (!res.ok) {
            return errorResponse("Failed to fetch PDF", 502);
        }

        const blob = await res.blob();
        const buffer = Buffer.from(await blob.arrayBuffer());
        const filename = TYPES[type].filename;

        return new Response(buffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${filename}"`,
                "Cache-Control": "no-cache",
            },
        });
    } catch (error) {
        console.error("Download PDF error:", error);
        return errorResponse(error.message || "Failed to download PDF", 500);
    }
}

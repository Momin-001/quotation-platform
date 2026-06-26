import { db } from "@/lib/db";
import { refurbishedProducts } from "@/db/schema";
import { errorResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";
import { generateRefurbishedDatasheetReactPDF } from "@/features/refurbished-products/refurbished-datasheet-react-pdf";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(req, { params }) {
    try {
        const { id } = await params;
        if (!id) {
            return errorResponse("Refurbished product ID is required", 400);
        }

        const product = await db.query.refurbishedProducts.findFirst({
            where: eq(refurbishedProducts.id, id),
            with: {
                areaOfUse: { columns: { name: true } },
                images: { columns: { imageUrl: true } },
                features: { columns: { feature: true } },
            },
        });

        if (!product) {
            return errorResponse("Refurbished product not found", 404);
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

        let logoDataUrl = null;
        try {
            const logoBuf = await readFile(path.join(process.cwd(), "public", "logo-name.png"));
            logoDataUrl = `data:image/png;base64,${logoBuf.toString("base64")}`;
        } catch {
            // logo missing
        }

        const imageUrls = product.images?.map((img) => img.imageUrl) ?? [];
        let mainImageDataUrl = null;
        const firstImageUrl = imageUrls[0];
        if (firstImageUrl) {
            const absoluteUrl =
                firstImageUrl.startsWith("http://") || firstImageUrl.startsWith("https://")
                    ? firstImageUrl
                    : `${(baseUrl || "").replace(/\/$/, "")}${firstImageUrl.startsWith("/") ? firstImageUrl : `/${firstImageUrl}`}`;
            try {
                const imageRes = await fetch(absoluteUrl);
                if (imageRes.ok) {
                    const buf = Buffer.from(await (await imageRes.blob()).arrayBuffer());
                    const mime = imageRes.headers.get("content-type") || "image/jpeg";
                    mainImageDataUrl = `data:${mime};base64,${buf.toString("base64")}`;
                }
            } catch {
                // ignore
            }
        }

        const formattedProduct = {
            ...product,
            areaOfUse: product.areaOfUse?.name ?? null,
            images: imageUrls,
            features: product.features?.map((f) => f.feature) ?? [],
            mainImageDataUrl,
        };

        const pdfBuffer = await generateRefurbishedDatasheetReactPDF(formattedProduct, { baseUrl, logoDataUrl });

        const safeName =
            String(formattedProduct.productNumber || "datasheet").replace(/[/\\:*?"<>|]/g, "_").trim() || "datasheet";
        const filename = `${safeName}_datasheet.pdf`;

        return new Response(pdfBuffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${filename}"`,
                "Cache-Control": "no-cache",
            },
        });
    } catch (error) {
        console.error("GET /api/refurbished-products/[id]/datasheet error:", error);
        return errorResponse("Failed to generate datasheet", 500);
    }
}

import { db } from "@/lib/db";
import { products, refurbishedProducts } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { and, desc, eq } from "drizzle-orm";

/**
 * GET /api/refurbished-products/:id/related
 * Up to 4 active NEW products sharing the refurbished product's area of use.
 * Intentionally returns products from the `products` table (not refurbished).
 */
export async function GET(req, { params }) {
    try {
        const { id } = await params;
        if (!id) {
            return errorResponse("Refurbished product ID is required", 400);
        }

        const [current] = await db
            .select({ areaOfUseId: refurbishedProducts.areaOfUseId })
            .from(refurbishedProducts)
            .where(eq(refurbishedProducts.id, id))
            .limit(1);

        if (!current) {
            return errorResponse("Refurbished product not found", 404);
        }
        if (!current.areaOfUseId) {
            return successResponse("No related products", []);
        }

        const rows = await db.query.products.findMany({
            where: and(eq(products.isActive, true), eq(products.areaOfUseId, current.areaOfUseId)),
            orderBy: desc(products.createdAt),
            limit: 4,
            columns: {
                id: true,
                slug: true,
                productName: true,
                productNumber: true,
                design: true,
                specialTypes: true,
                specialTypesOther: true,
            },
            with: {
                areaOfUse: { columns: { name: true } },
                images: { columns: { imageUrl: true } },
            },
        });

        const formatted = rows.map((p) => ({
            id: p.id,
            slug: p.slug,
            productName: p.productName,
            productNumber: p.productNumber,
            areaOfUse: p.areaOfUse?.name ?? null,
            images: (p.images || []).map((img) => img.imageUrl),
            design: p.design ?? null,
            specialTypes: p.specialTypes ?? null,
            specialTypesOther: p.specialTypesOther ?? null,
        }));

        return successResponse("Related products fetched successfully", formatted);
    } catch (error) {
        console.error("GET /api/refurbished-products/[id]/related error:", error);
        return errorResponse("Failed to fetch related products", 500);
    }
}

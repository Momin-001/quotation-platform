import { db } from "@/lib/db";
import { products } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { and, desc, eq, ne } from "drizzle-orm";

/** GET /api/products/:id/related — up to 4 active products with the same area-of-use (category), excluding the current product. */
export async function GET(req, { params }) {
    try {
        const { id } = await params;
        if (!id) {
            return errorResponse("Product ID is required", 400);
        }

        const [current] = await db
            .select({ areaOfUseId: products.areaOfUseId })
            .from(products)
            .where(eq(products.id, id))
            .limit(1);

        if (!current) {
            return errorResponse("Product not found", 404);
        }

        if (!current.areaOfUseId) {
            return successResponse("No related products", []);
        }

        const rows = await db.query.products.findMany({
            where: and(
                eq(products.isActive, true),
                eq(products.areaOfUseId, current.areaOfUseId),
                ne(products.id, id)
            ),
            orderBy: desc(products.createdAt),
            limit: 4,
            columns: {
                id: true,
                productName: true,
                productNumber: true,
                design: true,
                specialTypes: true,
                specialTypesOther: true,
            },
            with: {
                areaOfUse: {
                    columns: { name: true },
                },
                images: {
                    columns: { imageUrl: true },
                },
            },
        });

        const formatted = rows.map((p) => ({
            id: p.id,
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
        return errorResponse(error.message || "Failed to fetch related products");
    }
}

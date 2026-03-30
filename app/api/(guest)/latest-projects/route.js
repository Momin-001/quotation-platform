import { db } from "@/lib/db";
import { products } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { desc, eq, and } from "drizzle-orm";

function formatProduct(row) {
    const imgs = row.images || [];
    const firstUrl = imgs[0]?.imageUrl ?? null;
    return {
        id: row.id,
        productName: row.productName,
        productDescription: row.productDescription || "",
        areaOfUseId: row.areaOfUseId,
        areaOfUseName: row.areaOfUse?.name || "",
        imageUrl: firstUrl,
        features: (row.features || []).map((f) => f.feature).slice(0, 5),
    };
}

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const mode = searchParams.get("mode") || "";
        const categoryId = searchParams.get("categoryId") || "";

        const productQueryShape = {
            columns: {
                id: true,
                productName: true,
                productDescription: true,
                areaOfUseId: true,
            },
            with: {
                areaOfUse: { columns: { name: true } },
                images: { columns: { imageUrl: true } },
                features: { columns: { feature: true } },
            },
        };

        if (mode === "all") {
            const allCats = await db.query.categories.findMany({
                orderBy: (c, { asc }) => [asc(c.name)],
            });

            const out = [];
            for (const cat of allCats) {
                const p = await db.query.products.findFirst({
                    where: and(eq(products.areaOfUseId, cat.id), eq(products.isActive, true)),
                    orderBy: desc(products.createdAt),
                    ...productQueryShape,
                });
                if (p) out.push(formatProduct(p));
            }

            return successResponse("Latest projects fetched successfully", out);
        }

        if (!categoryId) {
            return errorResponse("categoryId is required unless mode=all", 400);
        }

        const list = await db.query.products.findMany({
            where: and(eq(products.areaOfUseId, categoryId), eq(products.isActive, true)),
            orderBy: desc(products.createdAt),
            limit: 3,
            ...productQueryShape,
        });

        return successResponse("Latest projects fetched successfully", list.map(formatProduct));
    } catch (error) {
        return errorResponse(error.message || "Failed to fetch latest projects");
    }
}

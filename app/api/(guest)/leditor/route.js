import { db } from "@/lib/db";
import { products, categories } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq, ilike, or, and, desc } from "drizzle-orm";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const categoryId = searchParams.get("categoryId") || "";
        const offset = (page - 1) * limit;

        // Fetch all categories
        const allCategories = await db
            .select({
                id: categories.id,
                name: categories.name,
            })
            .from(categories)
            .orderBy(categories.name);

        // Build product filter conditions
        let conditions = [];

        // Only show active products
        conditions.push(eq(products.isActive, true));

        // Only show LED Display Single Cabinet products
        conditions.push(eq(products.productType, "LED Display Single Cabinet"));

        if (categoryId) {
            conditions.push(eq(products.areaOfUseId, categoryId));
        }

        if (search) {
            conditions.push(
                or(
                    ilike(products.productName, `%${search}%`),
                    ilike(products.productNumber, `%${search}%`)
                )
            );
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        // Fetch products with needed fields for Leditor
        const productList = await db.query.products.findMany({
            columns: {
                id: true,
                productName: true,
                pixelPitch: true,
                refreshRate: true,
                cabinetResolutionHorizontal: true,
                cabinetResolutionVertical: true,
                cabinetWidth: true,
                cabinetHeight: true,
                ledTechnology: true,
                ledTechnologyOther: true,
                brightnessValue: true,
                weightWithoutPackaging: true,
                powerConsumptionMax: true,
                powerConsumptionTypical: true,
                areaOfUseId: true,
                design: true,
            },
            where: whereClause,
            orderBy: desc(products.createdAt),
            limit: limit,
            offset: offset,
        });

        // Get total count for pagination
        const allMatching = await db
            .select({ id: products.id })
            .from(products)
            .where(whereClause);

        const totalCount = allMatching.length;
        const totalPages = Math.ceil(totalCount / limit);

        return successResponse("Leditor products fetched successfully", {
            categories: allCategories,
            products: productList,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages,
            },
        });
    } catch (error) {
        return errorResponse(error.message || "Failed to fetch leditor products");
    }
}

import { db } from "@/lib/db";
import { products, productImages } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { desc, ilike, or, sql, eq } from "drizzle-orm";

// GET /api/admin/products/search - Searchable products with pagination
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const offset = (page - 1) * limit;

        // Build where conditions for search
        let whereConditions = [];
        if (search.trim()) {
            whereConditions = [
                or(
                    ilike(products.productName, `%${search}%`),
                    ilike(products.productNumber, `%${search}%`)
                )
            ];
        }

        // Get products with pagination
        const productsQuery = db
            .select({
                id: products.id,
                productName: products.productName,
                productNumber: products.productNumber,
                productType: products.productType,
                pixelPitch: products.pixelPitch,
            })
            .from(products)
            .orderBy(desc(products.createdAt))
            .limit(limit)
            .offset(offset);

        // Apply where conditions if any
        const productsList = whereConditions.length > 0
            ? await productsQuery.where(whereConditions[0])
            : await productsQuery;

        // Fetch first image for each product
        const productsWithImages = await Promise.all(
            productsList.map(async (product) => {
                const images = await db
                    .select({ imageUrl: productImages.imageUrl })
                    .from(productImages)
                    .where(eq(productImages.productId, product.id))
                    .orderBy(productImages.imageOrder)
                    .limit(1);
                
                return {
                    ...product,
                    imageUrl: images[0]?.imageUrl || null,
                };
            })
        );

        // Get total count for pagination
        const countQuery = db
            .select({ count: sql`count(*)` })
            .from(products);

        const totalResult = whereConditions.length > 0
            ? await countQuery.where(whereConditions[0])
            : await countQuery;

        const total = parseInt(totalResult[0]?.count || 0);
        const totalPages = Math.ceil(total / limit);
        const hasMore = page < totalPages;

        return successResponse("Products fetched successfully", {
            products: productsWithImages,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasMore,
            }
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        return errorResponse(error.message || "Failed to fetch products");
    }
}

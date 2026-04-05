import { db } from "@/lib/db";
import { products, productImages, controllers, accessories } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { desc, ilike, or, eq, and, sql } from "drizzle-orm";

// GET /api/admin/products/search-all - Search across all product types (LED, controllers, accessories)
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        const typeFilter = searchParams.get("type") || ""; // "product" | "controller" | "accessory" — when set, return only that type
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const offset = (page - 1) * limit;

        // Search LED products (skip if typeFilter is controller or accessory only)
        const productActive = eq(products.isActive, true);
        const productWhereClause = search.trim()
            ? and(
                  productActive,
                  or(
                      ilike(products.productName, `%${search}%`),
                      ilike(products.productNumber, `%${search}%`)
                  )
              )
            : productActive;

        let productsWithMeta = [];
        if (typeFilter === "" || typeFilter === "product") {
            const productsQuery = db
                .select({
                    id: products.id,
                    productName: products.productName,
                    productNumber: products.productNumber,
                    productType: products.productType,
                    pixelPitch: products.pixelPitch,
                })
                .from(products)
                .where(productWhereClause)
                .orderBy(desc(products.createdAt));

            const productsList = await productsQuery;

            productsWithMeta = await Promise.all(
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
                        sourceType: "product",
                        displayLabel: `[LED] ${product.productName}`,
                        subtitle: `${product.productNumber} • ${product.pixelPitch}mm`,
                    };
                })
            );
        }

        // Search controllers (skip if typeFilter is product or accessory only)
        // brandName is a PostgreSQL enum — ilike() on enums is invalid / unreliable; cast to text.
        const controllerActive = eq(controllers.isActive, true);
        const controllerSearchPattern = `%${search.trim()}%`;
        const controllerSearchOr = search.trim()
            ? or(
                  ilike(controllers.interfaceName, controllerSearchPattern),
                  ilike(controllers.controllerNumber, controllerSearchPattern),
                  ilike(controllers.brandNameOther, controllerSearchPattern),
                  sql`(${controllers.brandName})::text ILIKE ${controllerSearchPattern}`
              )
            : undefined;
        const controllerWhereClause = controllerSearchOr
            ? and(controllerActive, controllerSearchOr)
            : controllerActive;

        let controllersWithMeta = [];
        if (typeFilter === "" || typeFilter === "controller") {
            const controllersQuery = db
                .select({
                    id: controllers.id,
                    productName: controllers.interfaceName,
                    brandName: controllers.brandName,
                })
                .from(controllers)
                .where(controllerWhereClause)
                .orderBy(desc(controllers.createdAt));

            const controllersList = await controllersQuery;

            controllersWithMeta = controllersList.map((c) => ({
                ...c,
                productNumber: c.brandName || c.id?.slice(0, 8),
                imageUrl: null,
                sourceType: "controller",
                displayLabel: `[Controller] ${c.productName}`,
                subtitle: `${c.brandName ? c.brandName : "N/A"}`,
            }));
        }

        // Search accessories (skip if typeFilter is product or controller only)
        const accessoryActive = eq(accessories.isActive, true);
        const accessoryWhereClause = search.trim()
            ? and(
                  accessoryActive,
                  or(
                      ilike(accessories.productName, `%${search}%`),
                      ilike(accessories.productNumber, `%${search}%`)
                  )
              )
            : accessoryActive;

        let accessoriesWithMeta = [];
        if (typeFilter === "" || typeFilter === "accessory") {
            const accessoriesQuery = db
                .select({
                    id: accessories.id,
                    productName: accessories.productName,
                    productNumber: accessories.productNumber,
                    productGroup: accessories.productGroup,
                })
                .from(accessories)
                .where(accessoryWhereClause)
                .orderBy(desc(accessories.createdAt));

            const accessoriesList = await accessoriesQuery;

            accessoriesWithMeta = accessoriesList.map((a) => ({
                ...a,
                imageUrl: null,
                sourceType: "accessory",
                displayLabel: `[${a.productGroup}] ${a.productName}`,
                subtitle: a.productNumber,
            }));
        }

        // Combine all results
        const allItems = [
            ...productsWithMeta,
            ...controllersWithMeta,
            ...accessoriesWithMeta,
        ];

        const total = allItems.length;
        const paginated = allItems.slice(offset, offset + limit);
        const totalPages = Math.ceil(total / limit);
        const hasMore = page < totalPages;

        return successResponse("All products fetched successfully", {
            products: paginated,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasMore,
            }
        });
    } catch (error) {
        console.error("Error fetching all products:", error);
        return errorResponse(error.message || "Failed to fetch products");
    }
}

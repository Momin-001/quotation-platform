import { db } from "@/lib/db";
import { products, productImages, controllers, accessories } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { desc, ilike, or, sql, eq } from "drizzle-orm";

// GET /api/admin/products/search-all - Search across all product types (LED, controllers, accessories)
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const offset = (page - 1) * limit;

        // Search LED products
        let productConditions = [];
        if (search.trim()) {
            productConditions = [
                or(
                    ilike(products.productName, `%${search}%`),
                    ilike(products.productNumber, `%${search}%`)
                )
            ];
        }

        const productsQuery = db
            .select({
                id: products.id,
                productName: products.productName,
                productNumber: products.productNumber,
                productType: products.productType,
                pixelPitch: products.pixelPitch,
            })
            .from(products)
            .orderBy(desc(products.createdAt));

        const productsList = productConditions.length > 0
            ? await productsQuery.where(productConditions[0])
            : await productsQuery;

        // Fetch first image for each product
        const productsWithMeta = await Promise.all(
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

        // Search controllers
        let controllerConditions = [];
        if (search.trim()) {
            controllerConditions = [
                or(
                    ilike(controllers.productName, `%${search}%`),
                    ilike(controllers.productNumber, `%${search}%`),
                    ilike(controllers.brandName, `%${search}%`)
                )
            ];
        }

        const controllersQuery = db
            .select({
                id: controllers.id,
                productName: controllers.productName,
                productNumber: controllers.productNumber,
                brandName: controllers.brandName,
                interfaceName: controllers.interfaceName,
            })
            .from(controllers)
            .orderBy(desc(controllers.createdAt));

        const controllersList = controllerConditions.length > 0
            ? await controllersQuery.where(controllerConditions[0])
            : await controllersQuery;

        const controllersWithMeta = controllersList.map((c) => ({
            ...c,
            imageUrl: null,
            sourceType: "controller",
            displayLabel: `[Controller] ${c.productName}`,
            subtitle: `${c.productNumber}${c.brandName ? ` • ${c.brandName}` : ""}`,
        }));

        // Search accessories
        let accessoryConditions = [];
        if (search.trim()) {
            accessoryConditions = [
                or(
                    ilike(accessories.productName, `%${search}%`),
                    ilike(accessories.productNumber, `%${search}%`)
                )
            ];
        }

        const accessoriesQuery = db
            .select({
                id: accessories.id,
                productName: accessories.productName,
                productNumber: accessories.productNumber,
                productGroup: accessories.productGroup,
            })
            .from(accessories)
            .orderBy(desc(accessories.createdAt));

        const accessoriesList = accessoryConditions.length > 0
            ? await accessoriesQuery.where(accessoryConditions[0])
            : await accessoriesQuery;

        const accessoriesWithMeta = accessoriesList.map((a) => ({
            ...a,
            imageUrl: null,
            sourceType: "accessory",
            displayLabel: `[${a.productGroup}] ${a.productName}`,
            subtitle: a.productNumber,
        }));

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

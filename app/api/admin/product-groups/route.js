import { db } from "@/lib/db";
import { productGroups, products } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { asc, eq, sql } from "drizzle-orm";

// GET /api/admin/product-groups - all groups with how many products each holds
export async function GET() {
    try {
        const rows = await db
            .select({
                id: productGroups.id,
                name: productGroups.name,
                description: productGroups.description,
                createdAt: productGroups.createdAt,
                productCount: sql`count(${products.id})`.mapWith(Number),
            })
            .from(productGroups)
            .leftJoin(products, eq(products.groupId, productGroups.id))
            .groupBy(productGroups.id)
            .orderBy(asc(productGroups.name));

        return successResponse("Product groups fetched successfully", rows);
    } catch (error) {
        console.error("GET /api/admin/product-groups error:", error);
        return errorResponse("Failed to fetch product groups", 500);
    }
}

// POST /api/admin/product-groups - create a group
export async function POST(request) {
    try {
        const body = await request.json();
        const name = body.name?.toString().trim();
        const description = body.description?.toString().trim() || null;

        if (!name) return errorResponse("Group name is required", 400);

        const [existing] = await db
            .select({ id: productGroups.id })
            .from(productGroups)
            .where(eq(productGroups.name, name))
            .limit(1);
        if (existing) return errorResponse("A group with this name already exists", 409);

        const [created] = await db
            .insert(productGroups)
            .values({ name, description })
            .returning();

        return successResponse("Product group created successfully", created);
    } catch (error) {
        console.error("POST /api/admin/product-groups error:", error);
        return errorResponse("Failed to create product group", 500);
    }
}

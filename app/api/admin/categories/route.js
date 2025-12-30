import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories, products } from "@/drizzle/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq, sql } from "drizzle-orm";

// GET /api/admin/categories - Fetch all categories with product count
export async function GET() {
    try {
        const categoriesWithCount = await db
            .select({
                id: categories.id,
                name: categories.name,
                description: categories.description,
                createdAt: categories.createdAt,
                updatedAt: categories.updatedAt,
                productCount: sql`cast(count(${products.id}) as int)`,
            })
            .from(categories)
            .leftJoin(products, eq(products.categoryId, categories.id))
            .groupBy(categories.id)
            .orderBy(categories.createdAt);

        return successResponse(categoriesWithCount, "Categories fetched successfully");
    } catch (error) {
        console.error("Error fetching categories:", error);
        return errorResponse("Failed to fetch categories");
    }
}

// POST /api/admin/categories - Create a new category
export async function POST(request) {
    try {
        const body = await request.json();
        const { name, description } = body;

        if (!name || !name.trim()) {
            return errorResponse("Category name is required");
        }

        const newCategory = await db
            .insert(categories)
            .values({
                name: name.trim(),
                description: description?.trim() || null,
            })
            .returning();

        return successResponse(newCategory[0], "Category created successfully");
    } catch (error) {
        console.error("Error creating category:", error);

        // Handle unique constraint violation
        if (error.code === "23505") {
            return errorResponse("Category with this name already exists");
        }

        return errorResponse("Failed to create category");
    }
}

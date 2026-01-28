import { db } from "@/lib/db";
import { categories } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET() {
    try {
        const allCategories = await db
            .select()
            .from(categories)
            .orderBy(categories.name);

        return successResponse("Categories fetched successfully", allCategories);
    } catch (error) {
        return errorResponse(error.message || "Failed to fetch categories");
    }
}


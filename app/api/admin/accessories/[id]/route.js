import { db } from "@/lib/db";
import { accessories } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";

// GET /api/admin/accessories/[id] - Fetch a single accessory
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const accessory = await db
            .select()
            .from(accessories)
            .where(eq(accessories.id, id))
            .limit(1)
            .then((res) => res[0]);

        if (!accessory) {
            return errorResponse("Accessory not found", 404);
        }

        return successResponse("Accessory fetched successfully", accessory);
    } catch (error) {
        return errorResponse(error.message || "Failed to fetch accessory");
    }
}

// PUT /api/admin/accessories/[id] - Update an accessory
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Validate required fields
        if (!body.productName?.trim()) {
            return errorResponse("Product name is required", 400);
        }

        if (!body.productGroup?.trim()) {
            return errorResponse("Product group is required", 400);
        }

        const validGroups = ["Mechanics", "Service", "Software", "Maintenance"];
        if (!validGroups.includes(body.productGroup)) {
            return errorResponse("Invalid product group. Must be one of: " + validGroups.join(", "), 400);
        }

        const existing = await db
            .select()
            .from(accessories)
            .where(eq(accessories.id, id))
            .limit(1)
            .then((res) => res[0]);

        if (!existing) {
            return errorResponse("Accessory not found", 404);
        }

        const updateData = {
            productName: body.productName.trim(),
            shortText: body.shortText?.trim() || null,
            longText: body.longText?.trim() || null,
            productGroup: body.productGroup.trim(),
            unit: body.unit?.trim() || null,
            manufacturer: body.manufacturer?.trim() || null,
            supplier: body.supplier?.trim() || null,
            purchasePrice: body.purchasePrice?.toString() || null,
            retailPrice: body.retailPrice?.toString() || null,
            leadTime: body.leadTime?.trim() || null,
            updatedAt: new Date(),
        };

        const updated = await db
            .update(accessories)
            .set(updateData)
            .where(eq(accessories.id, id))
            .returning();

        return successResponse("Accessory updated successfully", updated[0]);
    } catch (error) {
        return errorResponse(error.message || "Failed to update accessory");
    }
}

// DELETE /api/admin/accessories/[id] - Delete an accessory
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        const existing = await db
            .select()
            .from(accessories)
            .where(eq(accessories.id, id))
            .limit(1)
            .then((res) => res[0]);

        if (!existing) {
            return errorResponse("Accessory not found", 404);
        }

        await db.delete(accessories).where(eq(accessories.id, id));

        return successResponse("Accessory deleted successfully");
    } catch (error) {
        return errorResponse(error.message || "Failed to delete accessory");
    }
}

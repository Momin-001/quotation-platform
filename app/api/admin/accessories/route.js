import { db } from "@/lib/db";
import { accessories } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { desc } from "drizzle-orm";

// GET /api/admin/accessories - Fetch all accessories
export async function GET() {
    try {
        const allAccessories = await db
            .select()
            .from(accessories)
            .orderBy(desc(accessories.createdAt));

        return successResponse("Accessories fetched successfully", allAccessories);
    } catch (error) {
        return errorResponse(error.message || "Failed to fetch accessories");
    }
}

// POST /api/admin/accessories - Create a new accessory
export async function POST(request) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.productName?.trim() || !body.productNumber?.trim()) {
            return errorResponse("Product name and product number are required", 400);
        }

        if (!body.productGroup?.trim()) {
            return errorResponse("Product group is required", 400);
        }

        const validGroups = ["Mechanics", "Service", "Software", "Maintenance"];
        if (!validGroups.includes(body.productGroup)) {
            return errorResponse("Invalid product group. Must be one of: " + validGroups.join(", "), 400);
        }

        const accessoryData = {
            productName: body.productName.trim(),
            productNumber: body.productNumber.trim(),
            shortText: body.shortText?.trim() || null,
            longText: body.longText?.trim() || null,
            productGroup: body.productGroup.trim(),
            unit: body.unit?.trim() || null,
            manufacturer: body.manufacturer?.trim() || null,
            supplier: body.supplier?.trim() || null,
            purchasePrice: body.purchasePrice?.toString() || null,
            retailPrice: body.retailPrice?.toString() || null,
            leadTime: body.leadTime?.trim() || null,
            isActive: true,
        };

        const newAccessory = await db
            .insert(accessories)
            .values(accessoryData)
            .returning();

        return successResponse("Accessory created successfully", newAccessory[0]);
    } catch (error) {
        if (error.message?.includes("unique") || error.code === "23505") {
            return errorResponse("An accessory with this product number already exists", 400);
        }
        return errorResponse(error.message || "Failed to create accessory");
    }
}

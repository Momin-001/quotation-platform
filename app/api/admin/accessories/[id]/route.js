import { db } from "@/lib/db";
import { accessories, accessoryFeatures } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";

// GET /api/admin/accessories/[id] - Fetch a single accessory with features
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const [accessory] = await db
            .select()
            .from(accessories)
            .where(eq(accessories.id, id))
            .limit(1);

        if (!accessory) {
            return errorResponse("Accessory not found", 404);
        }

        const featuresRows = await db
            .select({ id: accessoryFeatures.id, feature: accessoryFeatures.feature })
            .from(accessoryFeatures)
            .where(eq(accessoryFeatures.accessoryId, id));

        return successResponse("Accessory fetched successfully", {
            ...accessory,
            features: featuresRows.map((r) => r.feature),
        });
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

        const [existing] = await db
            .select()
            .from(accessories)
            .where(eq(accessories.id, id))
            .limit(1)

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
            productDatasheetUrl: body.productDatasheetUrl?.trim() || null,
            purchasePrice: body.purchasePrice?.toString() || null,
            retailPrice: body.retailPrice?.toString() || null,
            leadTime: body.leadTime?.trim() || null,
            optionalField: Array.isArray(body.optionalField) ? body.optionalField.filter(Boolean).map((s) => String(s).trim()) : (body.optionalField != null && body.optionalField !== "" ? [String(body.optionalField).trim()] : []),
            updatedAt: new Date(),
        };

        await db.update(accessories).set(updateData).where(eq(accessories.id, id));

        // Replace accessory features
        await db.delete(accessoryFeatures).where(eq(accessoryFeatures.accessoryId, id));
        const features = body.features;
        if (features && Array.isArray(features) && features.length > 0) {
            await Promise.all(
                features
                    .filter((f) => f && String(f).trim() !== "")
                    .map((feature) =>
                        db.insert(accessoryFeatures).values({
                            accessoryId: id,
                            feature: String(feature).trim(),
                        })
                    )
            );
        }

        const [updated] = await db.select().from(accessories).where(eq(accessories.id, id)).limit(1);
        const featuresRows = await db.select().from(accessoryFeatures).where(eq(accessoryFeatures.accessoryId, id));
        return successResponse("Accessory updated successfully", { ...updated, features: featuresRows.map((r) => r.feature) });
    } catch (error) {
        return errorResponse(error.message || "Failed to update accessory");
    }
}

// DELETE /api/admin/accessories/[id] - Delete an accessory
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        const [existing] = await db
            .select()
            .from(accessories)
            .where(eq(accessories.id, id))
            .limit(1)

        if (!existing) {
            return errorResponse("Accessory not found", 404);
        }

        await db.delete(accessories).where(eq(accessories.id, id));

        return successResponse("Accessory deleted successfully");
    } catch (error) {
        return errorResponse(error.message || "Failed to delete accessory");
    }
}

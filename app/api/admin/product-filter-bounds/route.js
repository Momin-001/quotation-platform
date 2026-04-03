import { db } from "@/lib/db";
import { productFilterBounds } from "@/db/schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { eq } from "drizzle-orm";
import { getOrCreateProductFilterBounds, serializeProductFilterBounds } from "@/lib/product-filter-bounds";

export async function GET() {
    try {
        const row = await getOrCreateProductFilterBounds();
        return successResponse("Filter bounds fetched successfully", serializeProductFilterBounds(row));
    } catch (error) {
        return errorResponse(error.message || "Failed to fetch filter bounds");
    }
}

export async function PUT(req) {
    try {
        const body = await req.json();
        const pixelPitchMin = parseFloat(body.pixelPitchMin);
        const pixelPitchMax = parseFloat(body.pixelPitchMax);
        const powerConsumptionMaxMin = parseInt(body.powerConsumptionMaxMin, 10);
        const powerConsumptionMaxMax = parseInt(body.powerConsumptionMaxMax, 10);
        const powerConsumptionTypicalMin = parseInt(body.powerConsumptionTypicalMin, 10);
        const powerConsumptionTypicalMax = parseInt(body.powerConsumptionTypicalMax, 10);

        if (
            Number.isNaN(pixelPitchMin) ||
            Number.isNaN(pixelPitchMax) ||
            Number.isNaN(powerConsumptionMaxMin) ||
            Number.isNaN(powerConsumptionMaxMax) ||
            Number.isNaN(powerConsumptionTypicalMin) ||
            Number.isNaN(powerConsumptionTypicalMax)
        ) {
            return errorResponse("All bounds must be valid numbers", 400);
        }

        if (pixelPitchMin >= pixelPitchMax) {
            return errorResponse("Pixel pitch min must be less than max", 400);
        }
        if (powerConsumptionMaxMin >= powerConsumptionMaxMax) {
            return errorResponse("Power consumption (max) min must be less than max", 400);
        }
        if (powerConsumptionTypicalMin >= powerConsumptionTypicalMax) {
            return errorResponse("Power consumption (typical) min must be less than max", 400);
        }

        const existing = await getOrCreateProductFilterBounds();

        const [updated] = await db
            .update(productFilterBounds)
            .set({
                pixelPitchMin: pixelPitchMin.toFixed(2),
                pixelPitchMax: pixelPitchMax.toFixed(2),
                powerConsumptionMaxMin,
                powerConsumptionMaxMax,
                powerConsumptionTypicalMin,
                powerConsumptionTypicalMax,
                updatedAt: new Date(),
            })
            .where(eq(productFilterBounds.id, existing.id))
            .returning();

        return successResponse("Filter bounds updated successfully", serializeProductFilterBounds(updated));
    } catch (error) {
        return errorResponse(error.message || "Failed to update filter bounds");
    }
}

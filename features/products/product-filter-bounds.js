import { db } from "@/lib/db";
import { productFilterBounds } from "@/db/schema";

const DEFAULT_ROW = {
    pixelPitchMin: "0.10",
    pixelPitchMax: "30.00",
    powerConsumptionMaxMin: 0,
    powerConsumptionMaxMax: 20000,
    powerConsumptionTypicalMin: 0,
    powerConsumptionTypicalMax: 20000,
};

export async function getOrCreateProductFilterBounds() {
    const existing = await db.select().from(productFilterBounds).limit(1).then((r) => r[0]);
    if (existing) return existing;
    const [row] = await db.insert(productFilterBounds).values(DEFAULT_ROW).returning();
    return row;
}

export function serializeProductFilterBounds(row) {
    return {
        pixelPitchMin: String(row.pixelPitchMin),
        pixelPitchMax: String(row.pixelPitchMax),
        powerConsumptionMaxMin: row.powerConsumptionMaxMin,
        powerConsumptionMaxMax: row.powerConsumptionMaxMax,
        powerConsumptionTypicalMin: row.powerConsumptionTypicalMin,
        powerConsumptionTypicalMax: row.powerConsumptionTypicalMax,
    };
}

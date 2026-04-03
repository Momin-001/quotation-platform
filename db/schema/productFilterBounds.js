import { pgTable, uuid, decimal, integer, timestamp } from "drizzle-orm/pg-core";

/** Single-row CMS config: slider/input bounds for guest product filters. */
export const productFilterBounds = pgTable("product_filter_bounds", {
    id: uuid("id").defaultRandom().primaryKey(),
    pixelPitchMin: decimal("pixel_pitch_min", { precision: 10, scale: 2 }).notNull(),
    pixelPitchMax: decimal("pixel_pitch_max", { precision: 10, scale: 2 }).notNull(),
    powerConsumptionMaxMin: integer("power_consumption_max_min").notNull(),
    powerConsumptionMaxMax: integer("power_consumption_max_max").notNull(),
    powerConsumptionTypicalMin: integer("power_consumption_typical_min").notNull(),
    powerConsumptionTypicalMax: integer("power_consumption_typical_max").notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

import { pgTable, uuid, text, timestamp, decimal, integer, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { quotationOptionalItems } from "./quotations";

// Product groups: Mechanics, Service, Software, Maintenance
export const accessoryGroupEnum = ["Mechanics", "Service", "Software", "Maintenance"];

export const accessories = pgTable("accessories", {
    id: uuid("id").defaultRandom().primaryKey(),

    productName: text("product_name").notNull(),
    productNumber: text("product_number").notNull().unique(),
    shortText: text("short_text"),
    longText: text("long_text"),
    productGroup: text("product_group").notNull(), // Mechanics, Service, Software, Maintenance
    unit: text("unit"), // e.g. "1", "pcs", "set"
    manufacturer: text("manufacturer"),
    supplier: text("supplier"),
    purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }),
    retailPrice: decimal("retail_price", { precision: 10, scale: 2 }),
    leadTime: text("lead_time"), // e.g. "20 Days"

    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const accessoriesRelations = relations(accessories, ({ many }) => ({
    quotationOptionalItems: many(quotationOptionalItems),
}));

import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { products } from "./products";

/**
 * A family of products that share every specification except a handful of
 * per-variant fields (cabinet size, chip bonding, brightness, contrast, driving
 * method, media, naming and SEO).
 *
 * Grouping exists so the product form can be seeded from an existing sibling
 * instead of the admin retyping ~70 fields for each variant.
 */
export const productGroups = pgTable("product_groups", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull().unique(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const productGroupsRelations = relations(productGroups, ({ many }) => ({
    products: many(products),
}));

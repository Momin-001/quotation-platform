import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { refurbishedProducts } from "./refurbishedProducts";
import { relations } from "drizzle-orm";

export const refurbishedProductFeatures = pgTable("refurbished_product_features", {
    id: uuid("id").defaultRandom().primaryKey(),
    refurbishedProductId: uuid("refurbished_product_id").references(() => refurbishedProducts.id, { onDelete: "cascade" }).notNull(),
    feature: text("feature").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const refurbishedProductFeaturesRelations = relations(refurbishedProductFeatures, ({ one }) => ({
    refurbishedProduct: one(refurbishedProducts, {
        fields: [refurbishedProductFeatures.refurbishedProductId],
        references: [refurbishedProducts.id],
    }),
}));

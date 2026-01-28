import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { products } from "./products";
import { relations } from "drizzle-orm";

export const productFeatures = pgTable("product_features", {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
    feature: text("feature").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const productFeaturesRelations = relations(productFeatures, ({ one }) => ({
    product: one(products, {
        fields: [productFeatures.productId],
        references: [products.id],
    }),
}));

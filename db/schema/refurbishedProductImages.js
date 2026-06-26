import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core";
import { refurbishedProducts } from "./refurbishedProducts";
import { relations } from "drizzle-orm";

export const refurbishedProductImages = pgTable("refurbished_product_images", {
    id: uuid("id").defaultRandom().primaryKey(),
    refurbishedProductId: uuid("refurbished_product_id").references(() => refurbishedProducts.id, { onDelete: "cascade" }),
    publicId: text("public_id").notNull(),
    imageUrl: text("image_url").notNull(),
    imageOrder: integer("image_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const refurbishedProductImagesRelations = relations(refurbishedProductImages, ({ one }) => ({
    refurbishedProduct: one(refurbishedProducts, {
        fields: [refurbishedProductImages.refurbishedProductId],
        references: [refurbishedProducts.id],
    }),
}));

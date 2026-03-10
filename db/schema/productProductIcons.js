import { pgTable, uuid, integer, timestamp } from "drizzle-orm/pg-core";
import { products } from "./products";
import { productIcons } from "./productIcons";
import { relations } from "drizzle-orm";

export const productProductIcons = pgTable("product_product_icons", {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
        .references(() => products.id, { onDelete: "cascade" })
        .notNull(),
    productIconId: uuid("product_icon_id")
        .references(() => productIcons.id, { onDelete: "cascade" })
        .notNull(),
    iconOrder: integer("icon_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const productProductIconsRelations = relations(productProductIcons, ({ one }) => ({
    product: one(products, {
        fields: [productProductIcons.productId],
        references: [products.id],
    }),
    productIcon: one(productIcons, {
        fields: [productProductIcons.productIconId],
        references: [productIcons.id],
    }),
}));

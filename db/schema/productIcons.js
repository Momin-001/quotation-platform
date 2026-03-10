import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { productProductIcons } from "./productProductIcons";

export const productIcons = pgTable("product_icons", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    imageUrl: text("image_url").notNull(),
    publicId: text("public_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const productIconsRelations = relations(productIcons, ({ many }) => ({
    productProductIcons: many(productProductIcons),
}));

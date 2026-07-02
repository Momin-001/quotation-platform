import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { products } from "./products";

export const categories = pgTable("categories", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull().unique(),
    slug: text("slug").unique(),
    titleEn: text("title_en"),
    titleDe: text("title_de"),
    descriptionEn: text("description_en"),
    descriptionDe: text("description_de"),
    imageUrl: text("image_url"),
    publicId: text("public_id"),
    features: jsonb("features").default([]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
    products: many(products),
}));

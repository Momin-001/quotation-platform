import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { categories } from "./categories";

export const products = pgTable("products", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

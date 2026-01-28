import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const faqs = pgTable("faqs", {
    id: uuid("id").defaultRandom().primaryKey(),
    titleEn: text("title_en").notNull(),
    titleDe: text("title_de").notNull(),
    descriptionEn: text("description_en").notNull(),
    descriptionDe: text("description_de").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

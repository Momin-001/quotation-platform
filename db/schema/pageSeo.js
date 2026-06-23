import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";

/**
 * Per-page SEO copy for static guest pages, editable from the admin CMS.
 * One row per pageKey (e.g. "home", "products", "controllers", ...).
 * Falls back to lib/i18n/seo-pages.js defaults when a row or field is blank.
 */
export const pageSeo = pgTable("page_seo", {
    id: uuid("id").defaultRandom().primaryKey(),
    pageKey: text("page_key").notNull().unique(),
    titleEn: text("title_en").notNull().default(""),
    titleDe: text("title_de").notNull().default(""),
    descriptionEn: text("description_en").notNull().default(""),
    descriptionDe: text("description_de").notNull().default(""),
    noindex: boolean("noindex").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

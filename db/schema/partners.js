import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core";

export const partners = pgTable("partners", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    logoUrl: text("logo_url").notNull(),
    websiteUrl: text("website_url").notNull(),
    clickCount: integer("click_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

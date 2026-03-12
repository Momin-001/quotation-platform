import { pgTable, uuid, text, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";

export const partnerTypeEnum = pgEnum("partner_type", ["technology", "marketing"]);
export const PARTNER_TYPES = ["technology", "marketing"];

export const partners = pgTable("partners", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    type: partnerTypeEnum("type").notNull().default("technology"),
    logoUrl: text("logo_url").notNull(),
    publicId: text("public_id").notNull(),
    websiteUrl: text("website_url").notNull(),
    clickCount: integer("click_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

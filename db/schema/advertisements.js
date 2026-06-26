import { pgTable, uuid, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";

export const advertisements = pgTable("advertisements", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    imageUrl: text("image_url").notNull(),
    publicId: text("public_id").notNull(),
    redirectUrl: text("redirect_url").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    clickCount: integer("click_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

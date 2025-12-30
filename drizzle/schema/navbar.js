import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const navbar = pgTable("navbar", {
    id: uuid("id").defaultRandom().primaryKey(),
    navItem1En: text("nav_item_1_en").notNull().default(""),
    navItem1De: text("nav_item_1_de").notNull().default(""),
    navItem2En: text("nav_item_2_en").notNull().default(""),
    navItem2De: text("nav_item_2_de").notNull().default(""),
    navItem3En: text("nav_item_3_en").notNull().default(""),
    navItem3De: text("nav_item_3_de").notNull().default(""),
    navItem4En: text("nav_item_4_en").notNull().default(""),
    navItem4De: text("nav_item_4_de").notNull().default(""),
    navItem5En: text("nav_item_5_en").notNull().default(""),
    navItem5De: text("nav_item_5_de").notNull().default(""),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});







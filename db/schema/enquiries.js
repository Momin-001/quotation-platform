import { pgTable, uuid, text, timestamp, integer, decimal, boolean } from "drizzle-orm/pg-core";
import { users, products } from "./index";
import { relations } from "drizzle-orm";
import { quotations } from "./quotations";

export const enquiries = pgTable("enquiries", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    message: text("message").notNull(),
    status: text("status").default("pending").notNull(), // pending, in_progress, completed, cancelled
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const enquiryItems = pgTable("enquiry_items", {
    id: uuid("id").defaultRandom().primaryKey(),
    enquiryId: uuid("enquiry_id")
        .notNull()
        .references(() => enquiries.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
        .notNull()
        .references(() => products.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),

    // Leditor custom fields
    isCustom: boolean("is_custom").default(false).notNull(),
    customLedTechnology: text("custom_led_technology"),
    customBrightnessValue: text("custom_brightness_value"),
    customPixelPitch: decimal("custom_pixel_pitch", { precision: 10, scale: 2 }),
    customRefreshRate: integer("custom_refresh_rate"),
    customResolutionHorizontal: integer("custom_resolution_horizontal"),
    customResolutionVertical: integer("custom_resolution_vertical"),
    customCabinetWidth: decimal("custom_cabinet_width", { precision: 10, scale: 2 }),
    customCabinetHeight: decimal("custom_cabinet_height", { precision: 10, scale: 2 }),
    customScreenWidth: decimal("custom_screen_width", { precision: 10, scale: 2 }),
    customScreenHeight: decimal("custom_screen_height", { precision: 10, scale: 2 }),

    // New calculated Leditor fields
    customTotalResolutionH: integer("custom_total_resolution_h"),
    customTotalResolutionV: integer("custom_total_resolution_v"),
    customWeight: decimal("custom_weight", { precision: 10, scale: 2 }),
    customDisplayArea: decimal("custom_display_area", { precision: 10, scale: 4 }),
    customDimension: text("custom_dimension"),
    customPowerConsumptionMax: decimal("custom_power_consumption_max", { precision: 10, scale: 2 }),
    customPowerConsumptionTyp: decimal("custom_power_consumption_typ", { precision: 10, scale: 2 }),
    customTotalCabinets: integer("custom_total_cabinets"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const enquiriesRelations = relations(enquiries, ({ many, one }) => ({
    items: many(enquiryItems),
    quotations: many(quotations),
    user: one(users, {
        fields: [enquiries.userId],
        references: [users.id],
    }),
}));

export const enquiryItemsRelations = relations(enquiryItems, ({ one }) => ({
    enquiry: one(enquiries, {
        fields: [enquiryItems.enquiryId],
        references: [enquiries.id],
    }),
    product: one(products, {
        fields: [enquiryItems.productId],
        references: [products.id],
    }),
}));
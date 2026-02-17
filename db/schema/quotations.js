import { pgTable, uuid, text, timestamp, decimal, integer } from "drizzle-orm/pg-core";
import { enquiries } from "./enquiries";
import { products } from "./products";
import { controllers } from "./controllers";
import { accessories } from "./accessories";
import { relations } from "drizzle-orm";

export const quotations = pgTable("quotations", {
    id: uuid("id").defaultRandom().primaryKey(),
    enquiryId: uuid("enquiry_id")
        .notNull()
        .references(() => enquiries.id, { onDelete: "cascade" }),
    quotationNumber: text("quotation_number").notNull(), // e.g., "Q-2025-347"
    status: text("status").default("draft").notNull(), // draft, pending, accepted, requested revision, rejected, closed, expired
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Main quotation items (products from enquiry)
export const quotationItems = pgTable("quotation_items", {
    id: uuid("id").defaultRandom().primaryKey(),
    quotationId: uuid("quotation_id")
        .notNull()
        .references(() => quotations.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
        .notNull()
        .references(() => products.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
    taxPercentage: decimal("tax_percentage", { precision: 5, scale: 2 }).default("0"),
    discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }).default("0"),
    description: text("description"), // Optional product description
    itemType: text("item_type").default("main").notNull(), // "main" or "alternative"
    itemOrder: integer("item_order").default(0), // For ordering items
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Optional products for each quotation item (polymorphic: product, controller, or accessory)
export const quotationOptionalItems = pgTable("quotation_optional_items", {
    id: uuid("id").defaultRandom().primaryKey(),
    quotationItemId: uuid("quotation_item_id")
        .notNull()
        .references(() => quotationItems.id, { onDelete: "cascade" }),
    // Polymorphic: exactly one of these three should be set
    productId: uuid("product_id")
        .references(() => products.id, { onDelete: "cascade" }),
    controllerId: uuid("controller_id")
        .references(() => controllers.id, { onDelete: "cascade" }),
    accessoryId: uuid("accessory_id")
        .references(() => accessories.id, { onDelete: "cascade" }),
    // Track which type of item this is: "product", "controller", or "accessory"
    itemSourceType: text("item_source_type").default("product").notNull(),
    quantity: integer("quantity").notNull().default(1),
    unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
    taxPercentage: decimal("tax_percentage", { precision: 5, scale: 2 }).default("0"),
    discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }).default("0"),
    description: text("description"),
    itemOrder: integer("item_order").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const quotationsRelations = relations(quotations, ({ many, one }) => ({
    items: many(quotationItems),
    enquiry: one(enquiries, {
        fields: [quotations.enquiryId],
        references: [enquiries.id],
    }),
}));

export const quotationItemsRelations = relations(quotationItems, ({ one, many }) => ({
    quotation: one(quotations, {
        fields: [quotationItems.quotationId],
        references: [quotations.id],
    }),
    product: one(products, {
        fields: [quotationItems.productId],
        references: [products.id],
    }),
    optionalItems: many(quotationOptionalItems),
}));

export const quotationOptionalItemsRelations = relations(quotationOptionalItems, ({ one }) => ({
    quotationItem: one(quotationItems, {
        fields: [quotationOptionalItems.quotationItemId],
        references: [quotationItems.id],
    }),
    product: one(products, {
        fields: [quotationOptionalItems.productId],
        references: [products.id],
    }),
    controller: one(controllers, {
        fields: [quotationOptionalItems.controllerId],
        references: [controllers.id],
    }),
    accessory: one(accessories, {
        fields: [quotationOptionalItems.accessoryId],
        references: [accessories.id],
    }),
}));

// Quotation chat messages
export const quotationMessages = pgTable("quotation_messages", {
    id: uuid("id").defaultRandom().primaryKey(),
    quotationId: uuid("quotation_id")
        .notNull()
        .references(() => quotations.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id").notNull(), // User or Admin ID
    senderRole: text("sender_role").notNull(), // "user" or "admin"
    message: text("message").notNull(),
    isRead: integer("is_read").default(0), // 0 = unread, 1 = read
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const quotationMessagesRelations = relations(quotationMessages, ({ one }) => ({
    quotation: one(quotations, {
        fields: [quotationMessages.quotationId],
        references: [quotations.id],
    }),
}));

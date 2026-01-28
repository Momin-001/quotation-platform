import { pgTable, uuid, text, timestamp, decimal, integer } from "drizzle-orm/pg-core";
import { enquiries } from "./enquiries";
import { products } from "./products";
import { relations } from "drizzle-orm";

export const quotations = pgTable("quotations", {
    id: uuid("id").defaultRandom().primaryKey(),
    enquiryId: uuid("enquiry_id")
        .notNull()
        .references(() => enquiries.id, { onDelete: "cascade" }),
    quotationNumber: text("quotation_number").notNull(), // e.g., "Q-2025-347"
    description: text("description"), // e.g., "Indoor Lobby Wall (4x3m)"
    status: text("status").default("draft").notNull(), // draft, pending, accepted, rejected, expired
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
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

// Optional products for each quotation item
export const quotationOptionalItems = pgTable("quotation_optional_items", {
    id: uuid("id").defaultRandom().primaryKey(),
    quotationItemId: uuid("quotation_item_id")
        .notNull()
        .references(() => quotationItems.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
        .notNull()
        .references(() => products.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
    taxPercentage: decimal("tax_percentage", { precision: 5, scale: 2 }).default("0"),
    discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }).default("0"),
    description: text("description"),
    itemOrder: integer("item_order").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Alternative product for each quotation item (only one per item)
export const quotationAlternativeItems = pgTable("quotation_alternative_items", {
    id: uuid("id").defaultRandom().primaryKey(),
    quotationItemId: uuid("quotation_item_id")
        .notNull()
        .references(() => quotationItems.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
        .notNull()
        .references(() => products.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
    taxPercentage: decimal("tax_percentage", { precision: 5, scale: 2 }).default("0"),
    discountPercentage: decimal("discount_percentage", { precision: 5, scale: 2 }).default("0"),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Optional products for alternative items
export const quotationAlternativeOptionalItems = pgTable("quotation_alternative_optional_items", {
    id: uuid("id").defaultRandom().primaryKey(),
    alternativeItemId: uuid("alternative_item_id")
        .notNull()
        .references(() => quotationAlternativeItems.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
        .notNull()
        .references(() => products.id, { onDelete: "cascade" }),
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
export const quotationsRelations = relations(quotations, ({ many }) => ({
    items: many(quotationItems),
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
    alternativeItem: one(quotationAlternativeItems),
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
}));

export const quotationAlternativeItemsRelations = relations(quotationAlternativeItems, ({ one, many }) => ({
    quotationItem: one(quotationItems, {
        fields: [quotationAlternativeItems.quotationItemId],
        references: [quotationItems.id],
    }),
    product: one(products, {
        fields: [quotationAlternativeItems.productId],
        references: [products.id],
    }),
    optionalItems: many(quotationAlternativeOptionalItems),
}));

export const quotationAlternativeOptionalItemsRelations = relations(quotationAlternativeOptionalItems, ({ one }) => ({
    alternativeItem: one(quotationAlternativeItems, {
        fields: [quotationAlternativeOptionalItems.alternativeItemId],
        references: [quotationAlternativeItems.id],
    }),
    product: one(products, {
        fields: [quotationAlternativeOptionalItems.productId],
        references: [products.id],
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

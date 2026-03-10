import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const userHeader = pgTable("user_header", {
    id: uuid("id").defaultRandom().primaryKey(),
    userHeaderMyEnquiryEn: text("user_header_my_enquiry_en").notNull().default(""),
    userHeaderMyEnquiryDe: text("user_header_my_enquiry_de").notNull().default(""),
    userHeaderMyQuotationEn: text("user_header_my_quotation_en").notNull().default(""),
    userHeaderMyQuotationDe: text("user_header_my_quotation_de").notNull().default(""),
    userHeaderMyAccountEn: text("user_header_my_account_en").notNull().default(""),
    userHeaderMyAccountDe: text("user_header_my_account_de").notNull().default(""),
    userHeaderMyCartEn: text("user_header_my_cart_en").notNull().default(""),
    userHeaderMyCartDe: text("user_header_my_cart_de").notNull().default(""),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


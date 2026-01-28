import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const footer = pgTable("footer", {
    id: uuid("id").defaultRandom().primaryKey(),
    // Company Description
    descriptionEn: text("description_en").notNull().default(""),
    descriptionDe: text("description_de").notNull().default(""),
    // Our Address Section
    ourAddressTitleEn: text("our_address_title_en").notNull().default(""),
    ourAddressTitleDe: text("our_address_title_de").notNull().default(""),
    // Quick Links Section
    quickLinksTitleEn: text("quick_links_title_en").notNull().default(""),
    quickLinksTitleDe: text("quick_links_title_de").notNull().default(""),
    quickLink1En: text("quick_link_1_en").notNull().default(""),
    quickLink1De: text("quick_link_1_de").notNull().default(""),
    quickLink2En: text("quick_link_2_en").notNull().default(""),
    quickLink2De: text("quick_link_2_de").notNull().default(""),
    quickLink3En: text("quick_link_3_en").notNull().default(""),
    quickLink3De: text("quick_link_3_de").notNull().default(""),
    quickLink4En: text("quick_link_4_en").notNull().default(""),
    quickLink4De: text("quick_link_4_de").notNull().default(""),
    quickLink5En: text("quick_link_5_en").notNull().default(""),
    quickLink5De: text("quick_link_5_de").notNull().default(""),
    // Newsletter Section
    newsletterTitleEn: text("newsletter_title_en").notNull().default(""),
    newsletterTitleDe: text("newsletter_title_de").notNull().default(""),
    emailPlaceholderEn: text("email_placeholder_en").notNull().default(""),
    emailPlaceholderDe: text("email_placeholder_de").notNull().default(""),
    subscribeButtonEn: text("subscribe_button_en").notNull().default(""),
    subscribeButtonDe: text("subscribe_button_de").notNull().default(""),
    // Copyright
    copyrightTextEn: text("copyright_text_en").notNull().default(""),
    copyrightTextDe: text("copyright_text_de").notNull().default(""),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


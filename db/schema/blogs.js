import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const blogs = pgTable("blogs", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    authorName: text("author_name").notNull(),
    mainImageUrl: text("main_image_url"),
    mainImagePublicId: text("main_image_public_id"),
    mainContentHtml: text("main_content_html").notNull().default(""),
    partnerAdImageUrl: text("partner_ad_image_url"),
    partnerAdImagePublicId: text("partner_ad_image_public_id"),
    partnerAdLinkUrl: text("partner_ad_link_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const blogContentBlocks = pgTable("blog_content_blocks", {
    id: uuid("id").defaultRandom().primaryKey(),
    blogId: uuid("blog_id")
        .notNull()
        .references(() => blogs.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
    textHtml: text("text_html").notNull().default(""),
    imageUrl: text("image_url"),
    imagePublicId: text("image_public_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const blogsRelations = relations(blogs, ({ many }) => ({
    contentBlocks: many(blogContentBlocks),
}));

export const blogContentBlocksRelations = relations(blogContentBlocks, ({ one }) => ({
    blog: one(blogs, {
        fields: [blogContentBlocks.blogId],
        references: [blogs.id],
    }),
}));

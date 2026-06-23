import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const footer = pgTable("footer", {
    id: uuid("id").defaultRandom().primaryKey(),
    /** Cloudinary secure_url; PDF uploaded with resource_type `image` for in-browser preview */
    privacyPolicyPdfUrl: text("privacy_policy_pdf_url"),
    privacyPolicyPdfPublicId: text("privacy_policy_pdf_public_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

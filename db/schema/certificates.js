import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { productCertificates } from "./productCertificates";

export const certificates = pgTable("certificates", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    imageUrl: text("image_url").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const certificatesRelations = relations(certificates, ({ many }) => ({
    productCertificates: many(productCertificates),
}));

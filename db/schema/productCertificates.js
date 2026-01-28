import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";
import { products } from "./products";
import { certificates } from "./certificates";
import { relations } from "drizzle-orm";

// Junction table for many-to-many relationship between products and certificates
export const productCertificates = pgTable("product_certificates", {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
    certificateId: uuid("certificate_id").references(() => certificates.id, { onDelete: "cascade" }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const productCertificatesRelations = relations(productCertificates, ({ one }) => ({
    product: one(products, {
        fields: [productCertificates.productId],
        references: [products.id],
    }),
    certificate: one(certificates, {
        fields: [productCertificates.certificateId],
        references: [certificates.id],
    }),
}));

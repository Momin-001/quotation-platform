import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    fullName: text("full_name").notNull(),
    companyName: text("company_name"),
    email: text("email").notNull().unique(),
    phoneNumber: text("phone_number"),
    password: text("password").notNull(),
    role: text("role").default("user").notNull(),
    isActive: boolean("is_active").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

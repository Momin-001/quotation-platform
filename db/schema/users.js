import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { pgEnum } from "drizzle-orm/pg-core";
import { enquiries } from "./enquiries";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["user", "super_admin", "admin"]);

export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    fullName: text("full_name").notNull(),
    companyName: text("company_name"),
    email: text("email").notNull().unique(),
    phoneNumber: text("phone_number"),
    password: text("password").notNull(),
    role: roleEnum("role").default("user").notNull(),
    isActive: boolean("is_active").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
    enquiries: many(enquiries),
}));
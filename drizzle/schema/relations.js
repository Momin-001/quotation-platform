import { relations } from "drizzle-orm";
import { users } from "./users";
import { categories } from "./categories";
import { products } from "./products";

// User relations (if needed in future)
export const usersRelations = relations(users, ({ many }) => ({
    // Add relations here if needed
}));

// Category relations
export const categoriesRelations = relations(categories, ({ many }) => ({
    products: many(products),
}));

// Product relations
export const productsRelations = relations(products, ({ one }) => ({
    category: one(categories, {
        fields: [products.categoryId],
        references: [categories.id],
    }),
}));

import { defineConfig } from "drizzle-kit";
import { DATABASE_URL } from "@/lib/constants";
export default defineConfig({
    schema: "./drizzle/schema/index.js",
    out: "./drizzle/migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: DATABASE_URL,
    },
    verbose: true,
    strict: true,
});

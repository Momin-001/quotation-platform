import { defineConfig } from "drizzle-kit";
import { DATABASE_URL } from "@/lib/constants";
export default defineConfig({
    schema: "./db/schema",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {    
        url: DATABASE_URL,
    },
});

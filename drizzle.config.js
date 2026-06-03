import { defineConfig } from "drizzle-kit";
import { DATABASE_URL } from "@/lib/constants";

export default defineConfig({
    out: "./db/drizzle",
    schema: "./db/schema",
    dialect: "postgresql",
    dbCredentials: {    
        url: DATABASE_URL,
    },
});

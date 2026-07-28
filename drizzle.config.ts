import { defineConfig } from "drizzle-kit";
import env from "./env";
export default defineConfig({
  dialect: "postgresql", // or "mysql", "sqlite", etc.
  schema: "./src/database/database.schema.ts",
  out: "./src/database/migrations",
  dbCredentials: {
    url: env.database.url!,
    ssl: false
  }
});

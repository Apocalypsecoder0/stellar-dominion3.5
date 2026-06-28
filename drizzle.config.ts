import { config } from "dotenv";
import { resolve } from "node:path";
import { defineConfig } from "drizzle-kit";

const projectRoot = process.cwd();
config({ path: resolve(projectRoot, ".env.development.local") });
config({ path: resolve(projectRoot, ".env.local") });
config({ path: resolve(projectRoot, ".env") });
config();

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error("DATABASE_URL is not set. Add it to your environment before running drizzle-kit.");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
});

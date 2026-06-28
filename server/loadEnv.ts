import { config } from "dotenv";
import { resolve } from "node:path";

const projectRoot = process.cwd();

// Load env files in order of precedence (first wins for a given key).
config({ path: resolve(projectRoot, ".env.development.local") });
config({ path: resolve(projectRoot, ".env.local") });
config({ path: resolve(projectRoot, ".env") });
config();

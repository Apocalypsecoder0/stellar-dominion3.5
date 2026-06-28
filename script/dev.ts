import { spawn } from "node:child_process";
import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as net from "node:net";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFilePath);
const projectRoot = resolve(currentDir, "..");

// Load env files in order of precedence (first wins for a given key).
config({ path: resolve(projectRoot, ".env.development.local") });
config({ path: resolve(projectRoot, ".env.local") });
config({ path: resolve(projectRoot, ".env") });
config();

const preferredPort = Number.parseInt(process.env.PORT || "5000", 10);
const basePort = Number.isFinite(preferredPort) && preferredPort > 0 ? preferredPort : 5000;

function isPortFree(port: number): Promise<boolean> {
  return new Promise((resolvePort) => {
    const server = net.createServer();
    server.once("error", () => resolvePort(false));
    server.once("listening", () => {
      server.close(() => resolvePort(true));
    });
    server.listen(port, "0.0.0.0");
  });
}

async function findAvailablePort(startPort: number, maxChecks = 25): Promise<number> {
  for (let offset = 0; offset < maxChecks; offset += 1) {
    const candidate = startPort + offset;
    const free = await isPortFree(candidate);
    if (free) return candidate;
  }
  return startPort;
}

async function startDev() {
  if (!process.env.DATABASE_URL) {
    console.warn("⚠️  DATABASE_URL is not set. Database operations will fail until it is configured.");
  } else {
    console.log("🔌 Using DATABASE_URL from environment");
  }

  const selectedPort = await findAvailablePort(basePort);
  if (selectedPort !== basePort) {
    console.warn(`Port ${basePort} is already in use. Falling back to port ${selectedPort}.`);
  }

  const command = `tsx server/index.ts`;

  console.log("Starting full-stack development server...");

  const child = spawn(command, {
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: process.env.NODE_ENV ?? "development",
      PORT: String(selectedPort),
    },
  });

  child.on("exit", (code: number | null) => {
    process.exit(code ?? 0);
  });

  child.on("error", (error: Error) => {
    console.error("Failed to start development process:", error);
    process.exit(1);
  });
}

startDev().catch((error) => {
  console.error("Failed to initialize development server:", error);
  process.exit(1);
});

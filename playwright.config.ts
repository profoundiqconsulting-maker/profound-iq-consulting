import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: true,
  timeout: 30_000,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:3000",
    browserName: "chromium",
    headless: true,
    viewport: { width: 1280, height: 800 },
    colorScheme: "light",
    storageState: process.env.PLAYWRIGHT_STORAGE_STATE || undefined,
  },
  webServer: {
    command: "pnpm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
    timeout: 60_000,
    env: process.env.TEST_DATABASE_URL
      ? { DATABASE_URL: process.env.TEST_DATABASE_URL }
      : {},
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});

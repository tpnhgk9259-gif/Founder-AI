import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev",
    port: 3000,
    reuseExistingServer: true,
    timeout: 30_000,
  },
  projects: [
    // Setup : login une seule fois et sauvegarder le state
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    // Tests publics (pas besoin d'auth)
    {
      name: "public",
      testMatch: /\/(landing|guide|inscription|connexion)\.spec\.ts/,
      use: { browserName: "chromium" },
    },
    // Tests authentifies (dashboard, modeles)
    {
      name: "authenticated",
      testMatch: /\/(dashboard|modeles)\.spec\.ts/,
      dependencies: ["setup"],
      use: {
        browserName: "chromium",
        storageState: "e2e/.auth/user.json",
      },
    },
  ],
});

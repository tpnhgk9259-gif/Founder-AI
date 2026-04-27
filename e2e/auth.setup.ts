import { test as setup, expect } from "@playwright/test";

const AUTH_FILE = "e2e/.auth/user.json";

setup("authenticate", async ({ page }) => {
  setup.skip(!process.env.E2E_TEST_PASSWORD, "E2E_TEST_PASSWORD non défini");

  await page.goto("/connexion");
  await page.fill('input[name="email"]', "stephane.donnet@deepsight-consulting.eu");
  await page.fill('input[name="password"]', process.env.E2E_TEST_PASSWORD ?? "");
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 15000 });

  // Sauvegarder le state d'auth (cookies + localStorage)
  await page.context().storageState({ path: AUTH_FILE });
});

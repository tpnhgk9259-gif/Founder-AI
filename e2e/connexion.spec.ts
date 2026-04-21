import { test, expect } from "@playwright/test";

const HAS_PASSWORD = !!process.env.E2E_TEST_PASSWORD;

test.describe("Connexion", () => {
  test("affiche le formulaire de connexion", async ({ page }) => {
    await page.goto("/connexion");
    await expect(page.locator("text=Bon retour")).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test("affiche une erreur avec des identifiants invalides", async ({ page }) => {
    await page.goto("/connexion");
    await page.fill('input[name="email"]', "fake@fake.com");
    await page.fill('input[name="password"]', "wrongpassword");
    await page.locator('button[type="submit"]').click();
    await expect(page.locator("text=incorrect")).toBeVisible({ timeout: 10000 });
  });

  test("redirige vers le dashboard après connexion réussie", async ({ page }) => {
    test.skip(!HAS_PASSWORD, "E2E_TEST_PASSWORD non défini");
    await page.goto("/connexion");
    await page.fill('input[name="email"]', "stephane.donnet@deepsight-consulting.eu");
    await page.fill('input[name="password"]', process.env.E2E_TEST_PASSWORD ?? "");
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 15000 });
  });
});

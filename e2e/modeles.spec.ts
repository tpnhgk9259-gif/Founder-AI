import { test, expect, type Page } from "@playwright/test";

const HAS_PASSWORD = !!process.env.E2E_TEST_PASSWORD;
test.skip(() => !HAS_PASSWORD, "E2E_TEST_PASSWORD non défini");

async function login(page: Page) {
  await page.goto("/connexion");
  await page.fill('input[name="email"]', "stephane.donnet@deepsight-consulting.eu");
  await page.fill('input[name="password"]', process.env.E2E_TEST_PASSWORD ?? "");
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 15000 });
  if (page.url().includes("onboarding")) {
    await page.goto("/dashboard");
  }
}

test.describe("Modèles PDF", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("la page Pitch Deck Seed se charge", async ({ page }) => {
    await page.goto("/dashboard/modeles/pitch-deck-seed");
    await expect(page.locator("text=Pitch Deck").first()).toBeVisible({ timeout: 10000 });
  });

  test("la page Lean Canvas se charge", async ({ page }) => {
    await page.goto("/dashboard/modeles/lean-canvas");
    await expect(page.locator("text=Lean Canvas").first()).toBeVisible({ timeout: 10000 });
  });

  test("la page MVP se charge", async ({ page }) => {
    await page.goto("/dashboard/modeles/mvp");
    await expect(page.locator("text=MVP").first()).toBeVisible({ timeout: 10000 });
  });
});

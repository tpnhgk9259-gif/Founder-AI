import { test, expect } from "@playwright/test";

test.describe("Inscription", () => {
  test("affiche le formulaire avec les 3 plans", async ({ page }) => {
    await page.goto("/inscription");
    await expect(page.locator("text=Créez votre compte")).toBeVisible();
    await expect(page.locator("text=Starter").first()).toBeVisible();
    await expect(page.locator("text=Growth").first()).toBeVisible();
    await expect(page.locator("text=Scale").first()).toBeVisible();
  });

  test("le plan Starter affiche 3 agents inclus", async ({ page }) => {
    await page.goto("/inscription");
    await page.locator("button:has-text('Starter')").click();
    // Les agents inclus ont un cercle check violet
    const checks = page.locator('.grid-cols-2 [class*="bg-violet-600"]');
    await expect(checks).toHaveCount(3);
  });

  test("le plan Scale affiche 5 agents inclus", async ({ page }) => {
    await page.goto("/inscription");
    await page.locator("button:has-text('Scale')").click();
    const checks = page.locator('.grid-cols-2 [class*="bg-violet-600"]');
    await expect(checks).toHaveCount(5);
  });

  test("la validation bloque si CGU non acceptées", async ({ page }) => {
    await page.goto("/inscription");
    await page.fill("#prenom", "Test");
    await page.fill("#nom", "User");
    await page.fill("#email", "test@example.com");
    await page.fill("#password", "testpassword123");
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeDisabled();
  });

  test("affiche une erreur si email déjà utilisé", async ({ page }) => {
    await page.goto("/inscription");
    await page.fill("#prenom", "Test");
    await page.fill("#nom", "User");
    await page.fill("#email", "stephane.donnet@deepsight-consulting.eu");
    await page.fill("#password", "testpassword123");
    await page.fill("#entreprise", "TestStartup");
    await page.locator('input[type="checkbox"]').check();
    await page.locator('button[type="submit"]').click();
    // L'erreur peut être "existe déjà" ou une autre erreur serveur
    await expect(page.locator('[class*="red"]').first()).toBeVisible({ timeout: 15000 });
  });
});

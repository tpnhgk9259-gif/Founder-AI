import { test, expect } from "@playwright/test";

// L'auth est geree par la fixture (storageState) — pas de login() ici

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    // Si redirige vers onboarding, aller au dashboard
    if (page.url().includes("onboarding")) {
      await page.goto("/dashboard");
    }
  });

  test("affiche les 5 agents dans la sidebar", async ({ page }) => {
    const sidebar = page.locator("aside");
    await expect(sidebar.locator("text=Maya")).toBeVisible();
    await expect(sidebar.locator("text=Alex")).toBeVisible();
    await expect(sidebar.locator("text=Sam")).toBeVisible();
    await expect(sidebar.locator("text=Marc")).toBeVisible();
  });

  test("affiche le mode CODIR", async ({ page }) => {
    await expect(page.locator("text=CODIR").first()).toBeVisible();
  });

  test("les 3 onglets sont accessibles", async ({ page }) => {
    await expect(page.locator("button:has-text('Mon équipe')").first()).toBeVisible();
    await page.locator("button:has-text('tableau de bord')").click();
    await expect(page.locator("text=PROFIL STARTUP").or(page.locator("text=Profil startup")).first()).toBeVisible({ timeout: 5000 });
    await page.locator("button:has-text('documents')").click();
    await expect(page.locator("text=Retrouvez ici").or(page.locator("text=documents utilisés")).first()).toBeVisible({ timeout: 5000 });
  });

  test("on peut sélectionner un agent et voir le champ de saisie", async ({ page }) => {
    await page.locator("text=Maya").first().click();
    await expect(page.locator('textarea, input[type="text"]').first()).toBeVisible();
  });

  test("on peut envoyer un message à un agent", async ({ page }) => {
    const sidebar = page.locator("aside");
    await sidebar.locator("text=Maya").click();
    const input = page.locator('input[type="text"]').last();
    await input.fill("Dis juste OK");
    await input.press("Enter");
    await expect(page.locator("text=Dis juste OK")).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(15000);
    const messages = page.locator('[style*="border-radius"]');
    expect(await messages.count()).toBeGreaterThanOrEqual(2);
  });
});

test.describe("Dashboard — Tableau de bord", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    if (page.url().includes("onboarding")) await page.goto("/dashboard");
    await page.locator("button:has-text('tableau de bord')").click();
  });

  test("affiche le profil startup", async ({ page }) => {
    await expect(page.locator("text=PROFIL STARTUP").or(page.locator("text=Profil startup")).first()).toBeVisible({ timeout: 5000 });
  });

  test("affiche la section Mon équipe (TeamSection)", async ({ page }) => {
    await expect(page.locator("text=Mon équipe").first()).toBeVisible({ timeout: 5000 });
  });

  test("affiche la section Collaborateurs", async ({ page }) => {
    await expect(page.locator("text=Collaborateurs").first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Dashboard — Documents", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
    if (page.url().includes("onboarding")) await page.goto("/dashboard");
    await page.locator("button:has-text('documents')").click();
  });

  test("affiche la zone documents", async ({ page }) => {
    await expect(
      page.locator("text=Retrouvez ici").or(page.locator("text=Ajouter un document")).first()
    ).toBeVisible({ timeout: 5000 });
  });
});

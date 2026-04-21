import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("affiche le titre et les 5 agents", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("direction IA");
    // 5 cartes agents visibles
    const agentCards = page.locator("text=Directeur").or(page.locator("text=Directrice"));
    await expect(agentCards.first()).toBeVisible();
  });

  test("les liens inscription et connexion fonctionnent", async ({ page }) => {
    await page.goto("/");
    const inscriptionLink = page.locator('a[href="/inscription"]').first();
    await expect(inscriptionLink).toBeVisible();
    await inscriptionLink.click();
    await expect(page).toHaveURL(/\/inscription/);
  });

  test("la section pricing affiche 3 plans", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Starter")).toBeVisible();
    await expect(page.locator("text=Growth")).toBeVisible();
    await expect(page.locator("text=Scale")).toBeVisible();
  });

  test("le lien guide est accessible", async ({ page }) => {
    await page.goto("/guide");
    await expect(page.locator("h1")).toContainText("Guide de démarrage");
    await expect(page.locator("text=Fondateur solo")).toBeVisible();
    await expect(page.locator("text=Fondateur en croissance")).toBeVisible();
    await expect(page.locator("text=Incubateur")).toBeVisible();
  });
});

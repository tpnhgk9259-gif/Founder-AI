import { test, expect } from "@playwright/test";

// L'auth est geree par la fixture (storageState) — pas de login() ici

test.describe("Modeles PDF — Starter", () => {
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

test.describe("Modeles PDF — Growth", () => {
  test("la page Positionnement se charge avec le bon titre", async ({ page }) => {
    await page.goto("/dashboard/modeles/positionnement");
    await expect(page.locator("h1:has-text('Positionnement')").first()).toBeVisible({ timeout: 10000 });
  });

  test("la page Positionnement affiche les sections du framework", async ({ page }) => {
    await page.goto("/dashboard/modeles/positionnement");
    await expect(page.locator("text=Alternatives comp").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Attributs uniques").first()).toBeVisible();
    await expect(page.locator("text=Valeur").first()).toBeVisible();
  });

  test("la page Positionnement a les boutons agents et preview", async ({ page }) => {
    await page.goto("/dashboard/modeles/positionnement");
    await expect(page.locator("text=Demander").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Preview & Export PDF").first()).toBeVisible();
  });

  test("la page Roadmap Produit se charge avec le bon titre", async ({ page }) => {
    await page.goto("/dashboard/modeles/roadmap-produit");
    await expect(page.locator("h1:has-text('Roadmap Produit')").first()).toBeVisible({ timeout: 10000 });
  });

  test("la page Roadmap Produit affiche les sections cles", async ({ page }) => {
    await page.goto("/dashboard/modeles/roadmap-produit");
    await expect(page.locator("text=Objectifs business").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Acteurs").first()).toBeVisible();
    await expect(page.locator("text=Features").first()).toBeVisible();
  });

  test("la page Sales Strategy se charge", async ({ page }) => {
    await page.goto("/dashboard/modeles/sales-strategy");
    await expect(page.locator("h1:has-text('Sales Strategy')").first()).toBeVisible({ timeout: 10000 });
  });

  test("la page Barrieres se charge", async ({ page }) => {
    await page.goto("/dashboard/modeles/barrieres");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  });

  test("la page Barrieres affiche les 5 categories", async ({ page }) => {
    await page.goto("/dashboard/modeles/barrieres");
    await expect(page.locator("text=intellectuelle").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Switching costs").first()).toBeVisible();
  });
});

test.describe("Modeles PDF — Scale", () => {
  test("la page Operations se charge", async ({ page }) => {
    await page.goto("/dashboard/modeles/operating-system");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  });

  test("la page Operations affiche les sections cles", async ({ page }) => {
    await page.goto("/dashboard/modeles/operating-system");
    await expect(page.locator("text=Vision & Mission").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Valeurs fondamentales").first()).toBeVisible();
    await expect(page.locator("text=Processus cles").first()).toBeVisible();
  });

  test("la page OKR Planner se charge", async ({ page }) => {
    await page.goto("/dashboard/modeles/okr");
    await expect(page.locator("h1:has-text('OKR Planner')").first()).toBeVisible({ timeout: 10000 });
  });

  test("la page Pitch Deck Serie A se charge", async ({ page }) => {
    await page.goto("/dashboard/modeles/pitch-deck-serie-a");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
  });

  test("la page Pitch Deck Serie A affiche les slides", async ({ page }) => {
    await page.goto("/dashboard/modeles/pitch-deck-serie-a");
    await expect(page.locator("text=Couverture").first()).toBeVisible({ timeout: 10000 });
  });
});

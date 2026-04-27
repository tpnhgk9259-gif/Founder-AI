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

test.describe("Modèles PDF — Starter", () => {
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

test.describe("Modèles PDF — Growth", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  // ── Positionnement ──────────────────────────────────────────────────────────

  test("la page Positionnement se charge avec le bon titre", async ({ page }) => {
    await page.goto("/dashboard/modeles/positionnement");
    await expect(page.locator("h1:has-text('Positionnement')").first()).toBeVisible({ timeout: 10000 });
  });

  test("la page Positionnement affiche les sections du framework", async ({ page }) => {
    await page.goto("/dashboard/modeles/positionnement");
    await expect(page.locator("text=Alternatives compétitives").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Attributs uniques").first()).toBeVisible();
    await expect(page.locator("text=Valeur délivrée").first()).toBeVisible();
    await expect(page.locator("text=Marché cible").first()).toBeVisible();
  });

  test("la page Positionnement a les boutons agents et preview", async ({ page }) => {
    await page.goto("/dashboard/modeles/positionnement");
    await expect(page.locator("text=Demander").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Preview & Export PDF").first()).toBeVisible();
  });

  // ── Roadmap Produit ─────────────────────────────────────────────────────────

  test("la page Roadmap Produit se charge avec le bon titre", async ({ page }) => {
    await page.goto("/dashboard/modeles/roadmap-produit");
    await expect(page.locator("h1:has-text('Roadmap Produit')").first()).toBeVisible({ timeout: 10000 });
  });

  test("la page Roadmap Produit affiche les sections clés", async ({ page }) => {
    await page.goto("/dashboard/modeles/roadmap-produit");
    await expect(page.locator("text=Objectifs business").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Acteurs").first()).toBeVisible();
    await expect(page.locator("text=Features").first()).toBeVisible();
    await expect(page.locator("text=Vue trimestrielle").first()).toBeVisible();
  });

  test("la page Roadmap Produit a les boutons agents et preview", async ({ page }) => {
    await page.goto("/dashboard/modeles/roadmap-produit");
    await expect(page.locator("text=Demander").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Preview & Export PDF").first()).toBeVisible();
  });

  // ── Sales Strategy ──────────────────────────────────────────────────────────

  test("la page Sales Strategy se charge avec le bon titre", async ({ page }) => {
    await page.goto("/dashboard/modeles/sales-strategy");
    await expect(page.locator("h1:has-text('Sales Strategy')").first()).toBeVisible({ timeout: 10000 });
  });

  test("la page Sales Strategy a les boutons agents et preview", async ({ page }) => {
    await page.goto("/dashboard/modeles/sales-strategy");
    await expect(page.locator("text=Demander").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Preview & Export PDF").first()).toBeVisible();
  });

  // ── Barrières à l'entrée ──────────────────────────────────────────────────

  test("la page Barrières se charge avec le bon titre", async ({ page }) => {
    await page.goto("/dashboard/modeles/barrieres");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator("h1").first()).toContainText("Barri");
  });

  test("la page Barrières affiche les 5 catégories", async ({ page }) => {
    await page.goto("/dashboard/modeles/barrieres");
    await expect(page.locator("text=intellectuelle").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Effets reseau").first()).toBeVisible();
    await expect(page.locator("text=Switching costs").first()).toBeVisible();
    await expect(page.locator("text=Avantage de donnees").first()).toBeVisible();
    await expect(page.locator("text=Economies").first()).toBeVisible();
  });

  test("la page Barrières a les boutons agents et preview", async ({ page }) => {
    await page.goto("/dashboard/modeles/barrieres");
    await expect(page.locator("text=Demander").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Preview & Export PDF").first()).toBeVisible();
  });
});

test.describe("Modèles PDF — Scale", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  // ── Operating System ────────────────────────────────────────────────────────

  test("la page Opérations se charge avec le bon titre", async ({ page }) => {
    await page.goto("/dashboard/modeles/operating-system");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator("h1").first()).toContainText("rations");
  });

  test("la page Opérations affiche les sections clés", async ({ page }) => {
    await page.goto("/dashboard/modeles/operating-system");
    await expect(page.locator("text=Vision & Mission").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Valeurs fondamentales").first()).toBeVisible();
    await expect(page.locator("text=Processus cles").first()).toBeVisible();
    await expect(page.locator("text=Plan de recrutement").first()).toBeVisible();
  });

  test("la page Opérations a les boutons agents et preview", async ({ page }) => {
    await page.goto("/dashboard/modeles/operating-system");
    await expect(page.locator("text=Demander").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Preview & Export PDF").first()).toBeVisible();
  });

  // ── OKR Planner ─────────────────────────────────────────────────────────────

  test("la page OKR Planner se charge avec le bon titre", async ({ page }) => {
    await page.goto("/dashboard/modeles/okr");
    await expect(page.locator("h1:has-text('OKR Planner')").first()).toBeVisible({ timeout: 10000 });
  });

  test("la page OKR Planner a les boutons agents et preview", async ({ page }) => {
    await page.goto("/dashboard/modeles/okr");
    await expect(page.locator("text=Demander").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Preview & Export PDF").first()).toBeVisible();
  });

  // ── Pitch Deck Série A ──────────────────────────────────────────────────────

  test("la page Pitch Deck Série A se charge avec le bon titre", async ({ page }) => {
    await page.goto("/dashboard/modeles/pitch-deck-serie-a");
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator("h1").first()).toContainText("Pitch Deck Serie A");
  });

  test("la page Pitch Deck Série A affiche les slides", async ({ page }) => {
    await page.goto("/dashboard/modeles/pitch-deck-serie-a");
    await expect(page.locator("text=Couverture").first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Probleme").first()).toBeVisible();
    await expect(page.locator("text=Solution").first()).toBeVisible();
  });

  test("la page Pitch Deck Série A a les boutons agents et preview", async ({ page }) => {
    await page.goto("/dashboard/modeles/pitch-deck-serie-a");
    await expect(page.locator("text=Demander").first()).toBeVisible({ timeout: 10000 });
  });
});

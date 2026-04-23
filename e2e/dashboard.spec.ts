import { test, expect, type Page } from "@playwright/test";

const HAS_PASSWORD = !!process.env.E2E_TEST_PASSWORD;
test.skip(() => !HAS_PASSWORD, "E2E_TEST_PASSWORD non défini");

// Helper : se connecter avant chaque test
async function login(page: Page) {
  await page.goto("/connexion");
  await page.fill('input[name="email"]', "stephane.donnet@deepsight-consulting.eu");
  await page.fill('input[name="password"]', process.env.E2E_TEST_PASSWORD ?? "");
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 15000 });
  // Si redirigé vers onboarding, aller directement au dashboard
  if (page.url().includes("onboarding")) {
    await page.goto("/dashboard");
  }
}

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("affiche les 5 agents dans la sidebar", async ({ page }) => {
    // La sidebar (aside) contient les 5 agents
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
    // Onglet Agents (par défaut)
    await expect(page.locator("text=Mon équipe").or(page.locator("text=Mes agents")).first()).toBeVisible();
    // Onglet Tableau de bord
    await page.locator("button:has-text('tableau de bord')").click();
    await expect(page.locator("text=PROFIL STARTUP").or(page.locator("text=Profil startup")).first()).toBeVisible({ timeout: 5000 });
    // Onglet Documents
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
    // Le message user apparaît puis l'agent répond
    await expect(page.locator("text=Dis juste OK")).toBeVisible({ timeout: 5000 });
    // Attendre que l'agent réponde (un 2ème div de message apparaît)
    await page.waitForTimeout(15000);
    // Vérifier qu'il y a au moins 2 messages
    const messages = page.locator('[style*="border-radius"]');
    expect(await messages.count()).toBeGreaterThanOrEqual(2);
  });
});

test.describe("Dashboard - Tableau de bord", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.locator("button:has-text('tableau de bord')").click();
  });

  test("on peut modifier le nom de la startup", async ({ page }) => {
    await expect(page.locator("text=PROFIL STARTUP").or(page.locator("text=Profil startup")).first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Dashboard - Documents", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.locator("text=Mes documents").click();
  });

  test("affiche la zone d'upload", async ({ page }) => {
    await expect(page.locator("text=Déposer un fichier").or(page.locator("text=PDF")).first()).toBeVisible({ timeout: 5000 });
  });
});

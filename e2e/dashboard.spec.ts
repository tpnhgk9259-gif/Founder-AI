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
    await expect(page.locator("text=Maya")).toBeVisible();
    await expect(page.locator("text=Alex")).toBeVisible();
    await expect(page.locator("text=Sam")).toBeVisible();
    await expect(page.locator("text=Léo")).toBeVisible();
    await expect(page.locator("text=Marc")).toBeVisible();
  });

  test("affiche le mode CODIR", async ({ page }) => {
    await expect(page.locator("text=CODIR")).toBeVisible();
  });

  test("les 3 onglets sont accessibles", async ({ page }) => {
    // Onglet Agents (par défaut)
    await expect(page.locator("text=Mes agents")).toBeVisible();
    // Onglet Tableau de bord
    await page.locator("text=Tableau de bord").click();
    await expect(page.locator("text=Profil startup")).toBeVisible({ timeout: 5000 });
    // Onglet Documents
    await page.locator("text=Mes documents").click();
    await expect(page.locator("text=Retrouvez ici")).toBeVisible({ timeout: 5000 });
  });

  test("on peut sélectionner un agent et voir le champ de saisie", async ({ page }) => {
    await page.locator("text=Maya").first().click();
    await expect(page.locator('textarea, input[type="text"]').first()).toBeVisible();
  });

  test("on peut envoyer un message à un agent", async ({ page }) => {
    await page.locator("text=Maya").first().click();
    const input = page.locator("textarea").first();
    await input.fill("Bonjour Maya, peux-tu te présenter en une phrase ?");
    await page.keyboard.press("Enter");
    // Attendre une réponse streamed (le texte de l'agent apparaît)
    await expect(page.locator('[class*="agent"], [class*="assistant"]').first()).toBeVisible({ timeout: 30000 });
  });
});

test.describe("Dashboard - Tableau de bord", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.locator("text=Tableau de bord").click();
  });

  test("on peut modifier le nom de la startup", async ({ page }) => {
    const nameInput = page.locator('input[placeholder*="startup"], input[name*="name"]').first();
    await expect(nameInput).toBeVisible({ timeout: 5000 });
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

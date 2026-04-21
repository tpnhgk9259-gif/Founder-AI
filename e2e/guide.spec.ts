import { test, expect } from "@playwright/test";

test.describe("Guide de démarrage", () => {
  test("affiche les 3 personas", async ({ page }) => {
    await page.goto("/guide");
    await expect(page.locator("text=Fondateur solo")).toBeVisible();
    await expect(page.locator("text=Fondateur en croissance")).toBeVisible();
    await expect(page.locator("text=Incubateur")).toBeVisible();
  });

  test("le parcours solo affiche 7 étapes", async ({ page }) => {
    await page.goto("/guide");
    await page.locator("text=Fondateur solo").click();
    await expect(page.locator("text=Complétez votre profil")).toBeVisible();
    await expect(page.locator("text=Parler à Maya")).toBeVisible();
    await expect(page.locator("text=Parler à Léo")).toBeVisible();
    await expect(page.locator("text=Parler à Alex")).toBeVisible();
    await expect(page.locator("text=Créer mon Lean Canvas")).toBeVisible();
    await expect(page.locator("text=Créer mon Pitch Deck")).toBeVisible();
    await expect(page.locator("text=preuve de marché")).toBeVisible();
  });

  test("le parcours growth affiche 6 étapes avec le bon ordre", async ({ page }) => {
    await page.goto("/guide");
    await page.locator("text=Fondateur en croissance").click();
    await expect(page.locator("text=Mettez à jour vos KPIs")).toBeVisible();
    await expect(page.locator("text=Scalez vos ventes")).toBeVisible();
    await expect(page.locator("text=Construisez un business plan")).toBeVisible();
    await expect(page.locator("text=Recrutez vos prochains")).toBeVisible();
    await expect(page.locator("text=bonnes décisions")).toBeVisible();
    await expect(page.locator("text=Structurez vos OKR")).toBeVisible();
  });

  test("le parcours partner affiche les étapes de gestion", async ({ page }) => {
    await page.goto("/guide");
    await page.locator("text=Incubateur").click();
    await expect(page.locator("text=espace partenaire")).toBeVisible();
    await expect(page.locator("text=Invitez vos startups")).toBeVisible();
    await expect(page.locator("text=Personnalisez")).toBeVisible();
  });

  test("les liens des étapes pointent vers des pages valides", async ({ page }) => {
    await page.goto("/guide");
    await page.locator("text=Fondateur solo").click();
    // Le premier lien doit pointer vers le tableau de bord
    const firstLink = page.locator('a:has-text("Remplir mon profil")');
    await expect(firstLink).toHaveAttribute("href", /dashboard/);
  });

  test("on peut déselectionner un persona", async ({ page }) => {
    await page.goto("/guide");
    await page.locator("button:has-text('Fondateur solo')").click();
    await expect(page.locator("text=Complétez votre profil")).toBeVisible();
    // Re-cliquer pour déselectionner
    await page.locator("button:has-text('Fondateur solo')").click();
    await expect(page.locator("text=Sélectionnez un profil")).toBeVisible();
  });
});

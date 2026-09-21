import { expect, test } from "@playwright/test";

/** Parcours 3 (docs/05) : Home → tuile Odporność → PLP filtre BIO → PDP → add → koszyk. */
test("home -> potrzeba -> PDP -> koszyk", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Olejki eteryczne BIO");

  await page.getByRole("link", { name: "Odporność" }).first().click();
  await expect(page).toHaveURL(/\/na\/odpornosc/);

  // La collection est paginée : on ouvre la fiche directement
  await page.goto("/produkt/ravintsara-bio");
  await expect(page.locator('script[type="application/ld+json"]').first()).toBeAttached();

  const variant = page.getByRole("radio", { name: /10 ml/ });
  if (await variant.count()) await variant.click();
  await page.getByRole("button", { name: "Dodaj do koszyka" }).first().click();
  await expect(page.getByRole("dialog", { name: "Koszyk" })).toContainText("Ravintsara", { timeout: 20_000 });

  await page.goto("/koszyk");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Koszyk");
  await expect(page.getByText("Ravintsara BIO")).toBeVisible();
});

/** Parcours 2 : Receptura → "Dodaj wszystko" → panier 3 lignes. */
test("receptura -> dodaj wszystko", async ({ page }) => {
  await page.goto("/receptury/na-sen");
  // Attendre l'hydratation avant de cliquer (page statique)
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Dodaj wszystko do koszyka" }).click();
  const dialog = page.getByRole("dialog", { name: "Koszyk" });
  // Le panier réel Shopify peut prendre quelques secondes
  await expect(dialog).toContainText("Lawenda", { timeout: 20_000 });
  await expect(dialog).toContainText("Cedr");
  await expect(dialog).toContainText("Pomarańcza");
});

/** Parcours 4 : recherche. */
test("szukaj ravintsara", async ({ page }) => {
  await page.goto("/szukaj?q=ravintsara");
  await expect(page.getByRole("link", { name: /Ravintsara BIO/ }).first()).toBeVisible();
});

test("robots et sitemap", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("Sitemap:");
  const sitemap = await request.get("/sitemap.xml");
  expect(await sitemap.text()).toContain("/produkt/lawenda-waskolistna-bio");
});

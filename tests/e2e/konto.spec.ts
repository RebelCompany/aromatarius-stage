import { expect, test } from "@playwright/test";

/**
 * Parcours sans mot de passe (Customer Account API). En mode démo, l'écran
 * hébergé par Shopify est remplacé par /konto/demo : la forme du flux, avec
 * redirection puis retour sur /konto/callback, est identique.
 */
function freshEmail() {
  return `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@aromatarius.pl`;
}

async function login(page: import("@playwright/test").Page, email: string, from = "/konto") {
  await page.goto(`/konto/logowanie?powrot=${encodeURIComponent(from)}`);
  await expect(page).toHaveURL(/\/konto\/demo/);
  await page.getByLabel("E-mail", { exact: true }).fill(email);
  await page.getByRole("button", { name: "Zaloguj się" }).click();
}

test("konto niezalogowane pokazuje przycisk logowania", async ({ page }) => {
  await page.goto("/konto");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Zaloguj się");
  await expect(page.getByRole("link", { name: /Zaloguj się/ }).first()).toBeVisible();
});

test("logowanie bez hasła kończy się na koncie", async ({ page }) => {
  await login(page, freshEmail());
  await expect(page).toHaveURL(/\/konto$/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Cześć");
});

test("wylogowanie kończy sesję", async ({ page }) => {
  await login(page, freshEmail());
  await expect(page).toHaveURL(/\/konto$/, { timeout: 15_000 });

  await page.getByRole("button", { name: "Wyloguj się" }).first().click();
  await expect(page).toHaveURL("/", { timeout: 15_000 });

  await page.goto("/konto");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Zaloguj się");
});

test("powrót na stronę, z której zaczęto logowanie", async ({ page }) => {
  await login(page, freshEmail(), "/koszyk");
  await expect(page).toHaveURL(/\/koszyk$/, { timeout: 15_000 });
});

test("powrót poza serwis jest odrzucany", async ({ page }) => {
  // Protection contre une redirection ouverte : on retombe sur /konto.
  await page.goto("/konto/logowanie?powrot=https%3A%2F%2Fexample.com");
  await expect(page).toHaveURL(/\/konto\/demo/);
  await page.getByLabel("E-mail", { exact: true }).fill(freshEmail());
  await page.getByRole("button", { name: "Zaloguj się" }).click();
  await expect(page).toHaveURL(/\/konto$/, { timeout: 15_000 });
});

test("koszyk przeżywa logowanie", async ({ page }) => {
  await page.goto("/produkt/lawenda-waskolistna-bio");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Dodaj do koszyka" }).first().click();
  await expect(page.getByRole("dialog", { name: "Koszyk" })).toContainText("Lawenda", { timeout: 20_000 });

  await login(page, freshEmail(), "/koszyk");
  await expect(page).toHaveURL(/\/koszyk$/, { timeout: 15_000 });
  // Le panier anonyme n'est pas recree a la connexion.
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Koszyk");
  await expect(page.getByText("Lawenda wąskolistna BIO")).toBeVisible();
});

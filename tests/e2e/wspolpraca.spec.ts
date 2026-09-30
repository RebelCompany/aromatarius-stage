import { expect, test } from "@playwright/test";

/** NIP réel du registre public polonais : la somme de contrôle est vraie. */
const NIP_VALIDE = "525-224-84-81";

/** Le formulaire de partenariat, distingue de la newsletter du pied de page. */
function formulaire(page: import("@playwright/test").Page) {
  return page.locator('form').filter({ has: page.locator('[name="nip"]') });
}

async function remplir(page: import("@playwright/test").Page, nip: string) {
  await page.goto("/wspolpraca");
  await page.getByLabel("Imię i nazwisko").fill("Bogusia Kowalska");
  await page.getByLabel("Nazwa firmy").fill("Apteka Pod Lipą");
  await page.getByLabel("NIP").fill(nip);
  await page.getByLabel("Adres e-mail").fill("kontakt@apteka.pl");
  await page.getByLabel("Rodzaj działalności").selectOption("apteka");
  await page.getByLabel("Wiadomość i opis projektu").fill("Chcielibyśmy wprowadzić olejki do naszej apteki.");
}

test("blok B2B na stronie głównej prowadzi do formularza", async ({ page }) => {
  await page.goto("/");
  const blok = page.getByRole("region", { name: "Współpraca dla profesjonalistów" });
  await expect(blok).toBeVisible();
  await blok.getByRole("link", { name: "Załóż konto pro" }).click();
  await expect(page).toHaveURL(/\/wspolpraca$/);
});

test("strona dla profesjonalistów pokazuje trzy profile", async ({ page }) => {
  await page.goto("/dla-profesjonalistow");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Dla profesjonalistów");
  await expect(page.getByRole("heading", { name: "Gabinety i specjaliści" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sklepy i apteki" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Twórcy i ambasadorzy" })).toBeVisible();
});

test("błędny NIP jest odrzucany po stronie serwera", async ({ page }) => {
  // Suma kontrolna jest fałszywa, choć cyfr jest dziesięć.
  await remplir(page, "1234567890");
  await page.getByRole("button", { name: "Wyślij zgłoszenie" }).click();
  await expect(formulaire(page).locator('[name="nip"]')).toHaveAttribute("aria-invalid", "true");
  // Pozostałe pola zostają nietknięte.
  await expect(formulaire(page).locator('[name="email"]')).not.toHaveAttribute("aria-invalid", "true");
});

test("poprawne zgłoszenie kończy się potwierdzeniem", async ({ page }) => {
  await remplir(page, NIP_VALIDE);
  await page.getByRole("button", { name: "Wyślij zgłoszenie" }).click();
  await expect(page.getByRole("status")).toContainText("Dziękujemy za zgłoszenie", { timeout: 15_000 });
  await expect(formulaire(page).locator('[name="nip"]')).toHaveCount(0);
});

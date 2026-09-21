import { expect, test } from "@playwright/test";

/** Parcours guidé : home -> Dobierz olejek -> wybór potrzeby -> selekcja. */
test("dobierz olejek -> selekcja", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Dobierz olejek/ }).first().click();
  await expect(page).toHaveURL(/\/dobierz$/);
  await page.waitForLoadState("networkidle");
  // Le bandeau cookies recouvre la barre d'action sticky sur mobile
  const consent = page.getByRole("button", { name: "Tylko niezbędne" });
  if (await consent.isVisible()) await consent.click();

  const submit = page.getByRole("button", { name: "Pokaż moją selekcję" });
  await expect(submit).toBeDisabled();
  // Les inputs sont sr-only : on clique les tuiles (labels)
  await page.locator('label[for="finder-sen"]').click();
  await page.locator('label[for="finder-odpornosc"]').click();
  await expect(page.locator("#finder-sen")).toBeChecked();
  await expect(page.getByText("Wybrano: 2 z 2")).toBeVisible();
  await submit.click();

  await expect(page).toHaveURL(/\/dobierz\/wyniki\?potrzeba=sen&potrzeba=odpornosc/);
  await expect(page.getByRole("heading", { name: "Polecane dla Ciebie" })).toBeVisible();
  await expect(page.locator('[data-list="finder_results"] a[href^="/produkt/"]').first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Zobacz wszystkie na: Sen i relaks/ })).toBeVisible();
});

test("wyniki bez parametru przekierowują", async ({ page }) => {
  await page.goto("/dobierz/wyniki");
  await expect(page).toHaveURL(/\/dobierz$/);
});

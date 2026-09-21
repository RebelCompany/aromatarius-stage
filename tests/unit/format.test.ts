import { describe, expect, it } from "vitest";
import { formatMoney, formatPricePerMl, pluralPl } from "@/lib/format";

describe("formatMoney", () => {
  it("formate en PLN avec virgule décimale et zł après le montant", () => {
    expect(formatMoney(64)).toBe("64,00 zł");
    expect(formatMoney({ amount: 12345.5, currencyCode: "PLN" })).toBe("12 345,50 zł");
  });
});

describe("formatPricePerMl", () => {
  it("calcule le prix au ml", () => {
    expect(formatPricePerMl({ amount: 54, currencyCode: "PLN" }, 10)).toBe("5,40 zł");
  });
});

describe("pluralPl", () => {
  it("choisit la forme polonaise correcte", () => {
    const forms: [string, string, string] = ["produkt", "produkty", "produktów"];
    expect(pluralPl(1, forms)).toBe("produkt");
    expect(pluralPl(3, forms)).toBe("produkty");
    expect(pluralPl(12, forms)).toBe("produktów");
    expect(pluralPl(22, forms)).toBe("produkty");
  });
});

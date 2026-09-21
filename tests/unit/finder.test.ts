import { describe, expect, it } from "vitest";
import { finderNeeds, parseFinderNeeds, scoreProducts } from "@/lib/finder-core";
import type { Need } from "@/lib/navigation";
import type { ProductCardData } from "@/lib/shopify/types";

function card(handle: string, extra: Partial<ProductCardData> = {}): ProductCardData {
  return {
    id: handle,
    handle,
    title: handle,
    productType: "Olejek eteryczny",
    tags: [],
    featuredImage: null,
    priceRange: { min: { amount: 10, currencyCode: "PLN" }, max: { amount: 10, currencyCode: "PLN" } },
    availableForSale: true,
    nazwaLacinska: null,
    isBio: false,
    chemotyp: null,
    defaultVariantId: "v",
    rating: null,
    ...extra,
  } as ProductCardData;
}

describe("parseFinderNeeds", () => {
  it("garde max 2 besoins valides sans doublon", () => {
    expect(parseFinderNeeds("sen,xxx,sen,stres,dom")).toEqual(["sen", "stres"]);
    expect(parseFinderNeeds(["dom"])).toEqual(["dom"]);
    expect(parseFinderNeeds(undefined)).toEqual([]);
  });
  it("ne propose pas bol dans les tuiles", () => {
    expect(finderNeeds).not.toContain("bol");
  });
});

describe("scoreProducts", () => {
  it("favorise les produits couvrant les deux besoins, exclut numérique et indisponible", () => {
    const both = card("both");
    const senOnly = card("sen-only", { isBio: true });
    const digital = card("kompendium", { productType: "Kompendium" as ProductCardData["productType"] });
    const sold = card("sold", { availableForSale: false });
    const byNeed = new Map<Need, ProductCardData[]>();
    byNeed.set("sen", [senOnly, both, digital, sold]);
    byNeed.set("stres", [both]);
    const out = scoreProducts(byNeed).map((p) => p.handle);
    expect(out).toEqual(["both", "sen-only"]);
  });
  it("classe olejek avant hydrolat à besoin égal, puis BIO", () => {
    const hydro = card("a-hydrolat", { productType: "Hydrolat", isBio: true });
    const oil = card("b-olejek");
    const bioOil = card("c-olejek-bio", { isBio: true });
    const byNeed = new Map<Need, ProductCardData[]>([["skora", [hydro, oil, bioOil]]]);
    expect(scoreProducts(byNeed).map((p) => p.handle)).toEqual(["c-olejek-bio", "b-olejek", "a-hydrolat"]);
  });
  it("départage les ex aequo par la position bestseller", () => {
    const byNeed = new Map<Need, ProductCardData[]>([["dom", [card("second"), card("first")]]]);
    expect(scoreProducts(byNeed).map((p) => p.handle)).toEqual(["second", "first"]);
  });
});

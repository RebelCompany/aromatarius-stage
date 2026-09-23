import { describe, expect, it } from "vitest";
import { parseVolumeMl, productToCard, richTextToHtml } from "@/lib/shopify/mappers";
import type { Money, Product, ProductVariant } from "@/lib/shopify/types";

describe("parseVolumeMl", () => {
  it("extrait la contenance", () => {
    expect(parseVolumeMl("10 ml")).toBe(10);
    expect(parseVolumeMl("5ml")).toBe(5);
    expect(parseVolumeMl("100 ML")).toBe(100);
    expect(parseVolumeMl("Default Title")).toBeNull();
  });
});

describe("richTextToHtml", () => {
  it("convertit le rich text Shopify en HTML", () => {
    const rich = JSON.stringify({
      type: "root",
      children: [
        { type: "paragraph", children: [{ type: "text", value: "Hello ", bold: true }, { type: "text", value: "<b>" }] },
        { type: "list", listType: "unordered", children: [{ type: "list-item", children: [{ type: "text", value: "a" }] }] },
      ],
    });
    expect(richTextToHtml(rich)).toBe("<p><strong>Hello </strong>&lt;b&gt;</p><ul><li>a</li></ul>");
  });
  it("laisse passer le HTML brut", () => {
    expect(richTextToHtml("<p>ok</p>")).toBe("<p>ok</p>");
  });
});

const pln = (amount: number): Money => ({ amount, currencyCode: "PLN" });

function variant(id: string, price: number, compareAt: number | null): ProductVariant {
  return {
    id,
    title: id,
    sku: id,
    availableForSale: true,
    quantityAvailable: 10,
    price: pln(price),
    compareAtPrice: compareAt === null ? null : pln(compareAt),
    volumeMl: null,
    selectedOptions: [],
    image: null,
  };
}

const emptyMetaForTest = {} as Product["meta"];

function productWith(variants: ProductVariant[]): Product {
  const prices = variants.map((v) => v.price.amount);
  return {
    id: "p1",
    handle: "test",
    title: "Test",
    description: "",
    descriptionHtml: "",
    vendor: "Aromatarius",
    productType: "Olejek eteryczny",
    tags: [],
    availableForSale: true,
    updatedAt: "2026-01-01T00:00:00Z",
    featuredImage: null,
    images: [],
    options: [],
    variants,
    priceRange: { min: pln(Math.min(...prices)), max: pln(Math.max(...prices)) },
    seo: { title: null, description: null },
    meta: { ...emptyMetaForTest, najnizszaCena30: pln(31) },
  } as unknown as Product;
}


describe("productToCard : prix barre", () => {
  it("prend le prix barre de la variante la moins chere", () => {
    const card = productToCard(productWith([variant("v10", 29, 34), variant("v30", 69, null)]));
    expect(card.onPromo).toBe(true);
    expect(card.compareAtPrice).toEqual(pln(34));
  });

  it("n'affiche aucun prix barre si la remise porte sur une autre variante", () => {
    // La carte affiche "od 29 zl" : barrer le 89 du format 30 ml annoncerait
    // une remise que le client ne peut pas obtenir a ce prix.
    const card = productToCard(productWith([variant("v10", 29, null), variant("v30", 69, 89)]));
    expect(card.onPromo).toBe(true);
    expect(card.compareAtPrice).toBeNull();
  });

  it("ignore un prix barre inferieur ou egal au prix de vente", () => {
    const card = productToCard(productWith([variant("v10", 29, 29)]));
    expect(card.compareAtPrice).toBeNull();
  });

  it("ne met rien hors promotion", () => {
    const card = productToCard(productWith([variant("v10", 29, null)]));
    expect(card.onPromo).toBe(false);
    expect(card.compareAtPrice).toBeNull();
  });
});

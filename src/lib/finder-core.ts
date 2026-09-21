import { needs, type Need } from "@/lib/navigation";
import type { ProductCardData } from "@/lib/shopify/types";

/** Partie pure du finder (testable sans serveur). */

export const FINDER_MAX_NEEDS = 2;
export const FINDER_TOP = 6;

/** `bol` n'a aucun produit tagué dans le catalogue : on ne le propose pas. */
export const finderNeeds: Need[] = needs.filter((n) => n !== "bol");

function list(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return (Array.isArray(v) ? v : v.split(",")).map((s) => s.trim()).filter(Boolean);
}

/** ?potrzeba=sen,stres (ou répété) -> besoins valides, max 2, sans doublon. */
export function parseFinderNeeds(value: string | string[] | undefined): Need[] {
  const out: Need[] = [];
  for (const v of list(value)) {
    if ((needs as readonly string[]).includes(v) && !out.includes(v as Need)) out.push(v as Need);
    if (out.length === FINDER_MAX_NEEDS) break;
  }
  return out;
}

const excludedTypes = new Set(["Kompendium", "Akcesorium"]);

export function scoreProduct(p: ProductCardData, needsCovered: number): number {
  let score = needsCovered * 10;
  if (p.productType === "Olejek eteryczny") score += 3;
  if (p.isBio) score += 2;
  if (p.tags.includes("promocja")) score += 1;
  return score;
}

/** Fusionne les produits par besoin, score et garde les meilleurs (débutant-friendly). */
export function scoreProducts(byNeed: Map<Need, ProductCardData[]>, top = FINDER_TOP): ProductCardData[] {
  // rank = meilleure position dans une collection (tri BEST_SELLING côté Shopify) : départage des ex aequo
  const merged = new Map<string, { product: ProductCardData; needsCovered: number; rank: number }>();
  for (const products of byNeed.values()) {
    products.forEach((p, rank) => {
      if (!p.availableForSale || excludedTypes.has(p.productType)) return;
      const cur = merged.get(p.handle);
      if (cur) {
        cur.needsCovered += 1;
        cur.rank = Math.min(cur.rank, rank);
      } else merged.set(p.handle, { product: p, needsCovered: 1, rank });
    });
  }
  return [...merged.values()]
    .map(({ product, needsCovered, rank }) => ({ product, rank, score: scoreProduct(product, needsCovered) }))
    .sort((a, b) => b.score - a.score || a.rank - b.rank)
    .slice(0, top)
    .map((x) => x.product);
}

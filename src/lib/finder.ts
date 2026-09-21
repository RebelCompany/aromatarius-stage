import "server-only";
import { getRecipes } from "@/lib/content/loader";
import type { ContentEntry } from "@/lib/content/loader";
import type { RecepturaFrontmatter } from "@/lib/content/schema";
import { needs, type Need } from "@/lib/navigation";
import { getCollectionProducts } from "@/lib/shopify";
import type { ProductCardData } from "@/lib/shopify/types";
import { scoreProducts } from "./finder-core";

export { parseFinderNeeds, finderNeeds, FINDER_MAX_NEEDS } from "./finder-core";

/** Besoins pour lesquels un dyfuzor est un bon complément. */
const diffuserNeeds: Need[] = ["dom", "sen", "stres", "oddychanie"];

export type FinderResults = {
  needs: Need[];
  products: ProductCardData[];
  recipes: ContentEntry<RecepturaFrontmatter>[];
  diffusers: ProductCardData[];
};

/** Sélection personnalisée : union des collections `na-*`, score, receptury et dyfuzory. */
export async function getFinderResults(selected: Need[]): Promise<FinderResults> {
  const wantsDiffuser = selected.some((n) => diffuserNeeds.includes(n));
  const [byNeed, recipes, diffusers] = await Promise.all([
    Promise.all(selected.map((n) => getCollectionProducts(`na-${n}`, { perPage: 250 }))),
    getRecipes(),
    wantsDiffuser ? getCollectionProducts("dyfuzory", { perPage: 2 }) : Promise.resolve(null),
  ]);

  const map = new Map<Need, ProductCardData[]>();
  selected.forEach((n, i) => map.set(n, byNeed[i]?.products ?? []));

  return {
    needs: selected,
    products: scoreProducts(map),
    recipes: recipes.filter((r) => (needs as readonly string[]).includes(r.frontmatter.problem) && selected.includes(r.frontmatter.problem as Need)).slice(0, 2),
    diffusers: diffusers?.products.filter((p) => p.availableForSale).slice(0, 2) ?? [],
  };
}

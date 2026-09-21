import type { CollectionFilters, SortKey } from "@/lib/shopify/types";

export type SearchParams = Record<string, string | string[] | undefined>;

const sortKeys: SortKey[] = ["relevance", "priceAsc", "priceDesc", "newest", "nameAsc"];

function list(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return (Array.isArray(v) ? v : v.split(",")).map((s) => s.trim()).filter(Boolean);
}

/** URL ?bio=1&potrzeba=sen,stres&sort=priceAsc&page=2 -> options pour l'adapter. */
export function parsePlpParams(params: SearchParams): {
  page: number;
  sort: SortKey;
  filters: CollectionFilters;
  hasFilters: boolean;
} {
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const sortRaw = typeof params.sort === "string" ? params.sort : "relevance";
  const sort = sortKeys.includes(sortRaw as SortKey) ? (sortRaw as SortKey) : "relevance";
  const filters: CollectionFilters = {
    bio: params.bio === "1",
    potrzeba: list(params.potrzeba),
    zapach: list(params.zapach),
    uzycie: list(params.uzycie),
    bezpieczny: list(params.bezpieczny),
    ml: list(params.ml).map(Number).filter((n) => !Number.isNaN(n)),
    priceMin: params.cena_od ? Number(params.cena_od) : undefined,
    priceMax: params.cena_do ? Number(params.cena_do) : undefined,
  };
  const hasFilters =
    !!filters.bio ||
    filters.potrzeba!.length > 0 ||
    filters.zapach!.length > 0 ||
    filters.uzycie!.length > 0 ||
    filters.bezpieczny!.length > 0 ||
    filters.ml!.length > 0 ||
    filters.priceMin != null ||
    filters.priceMax != null ||
    sort !== "relevance";
  return { page, sort, filters, hasFilters };
}

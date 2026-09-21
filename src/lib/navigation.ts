import { pl } from "@/i18n/pl";

/** Collections par type (docs/02, docs/06). Handles = URLs /[collection]. */
export const typeCollections = [
  { handle: "olejki-eteryczne", title: "Olejki eteryczne" },
  { handle: "hydrolaty", title: "Hydrolaty" },
  { handle: "oleje-roslinne", title: "Oleje roślinne" },
  { handle: "mieszanki", title: "Mieszanki" },
  { handle: "zestawy", title: "Zestawy" },
  { handle: "dyfuzory", title: "Dyfuzory" },
] as const;

export const featuredCollections = [
  { handle: "bestsellery", title: "Bestsellery" },
  { handle: "nowosci", title: "Nowości" },
  { handle: "promocje", title: "Promocje" },
] as const;

/** Collections besoin : URL /na/[potrzeba], collection Shopify `na-[potrzeba]` (tag potrzeba:*). */
export const needs = [
  "sen",
  "stres",
  "odpornosc",
  "oddychanie",
  "skora",
  "trawienie",
  "bol",
  "dzieci",
  "dom",
  "pielegnacja",
] as const;

export type Need = (typeof needs)[number];

export const homeNeeds: Need[] = ["sen", "stres", "odpornosc", "oddychanie", "skora", "dom"];

export function needTitle(need: string): string {
  return pl.needs[need]?.title ?? need;
}

export function needCollectionHandle(need: string): string {
  return `na-${need}`;
}

/** Menu "Wiedza" (le blog est un lien de premier niveau dans le header). */
export const knowledgeLinks = [
  { href: "/kompendium", title: pl.nav.kompendium },
  { href: "/receptury", title: pl.nav.receptury },
  { href: "/jakosc", title: pl.nav.quality },
] as const;

export const blogLink = { href: "/blog", title: pl.nav.blog } as const;
export const promoLink = { href: "/promocje", title: pl.nav.promotions } as const;

export const legalLinks = [
  { href: "/wysylka", title: pl.footer.shipping },
  { href: "/zwroty", title: pl.footer.returns },
  { href: "/regulamin", title: pl.footer.terms },
  { href: "/polityka-prywatnosci", title: pl.footer.privacy },
] as const;

/** Filtres PLP : valeurs des tags (docs/06). */
export const filterOptions = {
  zapach: ["cytrusowy", "kwiatowy", "drzewny", "ziolowy", "korzenny", "zywiczny"],
  uzycie: ["dyfuzja", "skora", "kapiel", "inhalacja"],
  bezpieczny: ["ciaza", "dzieci3", "dzieci6"],
  ml: [5, 10, 30, 100],
} as const;

export const filterLabels: Record<string, string> = {
  cytrusowy: "Cytrusowe",
  kwiatowy: "Kwiatowe",
  drzewny: "Drzewne",
  ziolowy: "Ziołowe",
  korzenny: "Korzenne",
  zywiczny: "Żywiczne",
  dyfuzja: "Dyfuzja",
  skora: "Na skórę",
  kapiel: "Kąpiel",
  inhalacja: "Inhalacja",
  ciaza: "Bezpieczny w ciąży",
  dzieci3: "Dzieci od 3 lat",
  dzieci6: "Dzieci od 6 lat",
};

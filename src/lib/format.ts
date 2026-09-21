import type { Money } from "@/lib/shopify/types";

const plnFormatter = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const NBSP = " ";

/** 64 -> "64,00 zł" (espace insécable U+00A0 avant zł et entre milliers, règle 8 de CLAUDE.md) */
export function formatMoney(money: Money | number): string {
  const amount = typeof money === "number" ? money : money.amount;
  // Intl peut renvoyer U+00A0 ou U+202F selon le moteur : on normalise.
  return plnFormatter.format(amount).replace(/[\s  ]/g, NBSP);
}

export function formatPricePerMl(money: Money, ml: number): string {
  if (!ml) return "";
  return formatMoney(money.amount / ml);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pl-PL", { dateStyle: "long" }).format(new Date(iso));
}

export function pluralPl(count: number, forms: [string, string, string]): string {
  const n = Math.abs(count);
  if (n === 1) return forms[0];
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return forms[1];
  return forms[2];
}

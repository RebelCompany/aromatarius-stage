"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { pl, t } from "@/i18n/pl";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { useCart } from "./CartProvider";
import { ProductImage } from "./ProductImage";
import type { ProductImage as ProductImageType } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

export type BundleItem = {
  handle: string;
  title: string;
  image: ProductImageType | null;
  variantId: string | null;
  variantTitle: string | null;
  price: number | null;
  drops: number;
  available: boolean;
};

type Props = { items: BundleItem[]; extras: string[] };

/**
 * Carte "Potrzebujesz" d'une receptura (docs/05) : chaque produit peut être
 * décoché ("Mam już") si le client le possède, le total se recalcule et
 * "Dodaj wszystko" n'ajoute que les produits cochés.
 */
export function RecipeBundle({ items, extras }: Props) {
  const { add, pending } = useCart();
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const toggle = (handle: string) =>
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(handle)) next.delete(handle);
      else next.add(handle);
      return next;
    });

  const purchasable = items.filter((i) => i.variantId && i.available && !excluded.has(i.handle));
  const total = purchasable.reduce((s, i) => s + (i.price ?? 0), 0);

  return (
    <aside className="rounded-md border border-sand-200 bg-card p-4 sm:p-6" aria-labelledby="bundle-title">
      <h2 id="bundle-title" className="mb-4 text-xl">
        {pl.content.youNeed}
      </h2>
      <ul className="divide-y divide-sand-200">
        {items.map((item) => {
          const isExcluded = excluded.has(item.handle);
          const checkboxId = `bundle-${item.handle}`;
          return (
            <li key={item.handle} className={cn("flex items-center gap-3 py-3 transition-opacity", isExcluded && "opacity-50")}>
              <input
                id={checkboxId}
                type="checkbox"
                checked={!isExcluded}
                onChange={() => toggle(item.handle)}
                disabled={!item.variantId || !item.available}
                className="size-5 shrink-0 accent-leaf-700"
                aria-label={`${item.title}: ${isExcluded ? pl.content.includeAgain : pl.content.alreadyHave}`}
              />
              <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-cream-50">
                <ProductImage image={item.image} sizes="56px" />
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/produkt/${item.handle}`} className={cn("font-serif hover:text-leaf-700", isExcluded && "line-through")}>
                  {item.title}
                </Link>
                <p className="text-sm text-ink-600">
                  {t(pl.content.drops, { count: item.drops })}
                  {item.variantTitle ? ` · ${item.variantTitle}` : ""}
                  {isExcluded ? ` · ${pl.content.bundleExcluded}` : ""}
                </p>
              </div>
              <p className={cn("text-sm font-semibold tabular-nums", isExcluded && "line-through")}>
                {item.price != null ? formatMoney(item.price) : "–"}
              </p>
            </li>
          );
        })}
        {extras.map((e) => (
          <li key={e} className="py-3 text-sm text-ink-600">
            {e}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-ink-600">{pl.content.bundleHint}</p>
      <div className="mt-4 flex flex-col gap-2">
        <Button
          type="button"
          size="lg"
          className="h-12 bg-leaf-900 text-base hover:bg-leaf-700"
          disabled={pending || purchasable.length === 0}
          onClick={() => add(purchasable.map((i) => ({ merchandiseId: i.variantId!, quantity: 1 })))}
        >
          <ShoppingBag data-icon="inline-start" aria-hidden />
          {pl.content.addAll}
        </Button>
        <p className="text-center text-sm text-ink-600">
          {purchasable.length === 0 ? pl.content.bundleNothing : t(pl.content.addAllTotal, { amount: formatMoney(total) })}
        </p>
      </div>
    </aside>
  );
}

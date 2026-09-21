"use client";

import { pl, t } from "@/i18n/pl";
import { formatMoney, formatPricePerMl } from "@/lib/format";
import type { ProductVariant } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

type Props = {
  variants: ProductVariant[];
  selectedId: string;
  onSelect: (id: string) => void;
};

/** Pills 5 ml / 10 ml / 30 ml avec prix par variante et prix au ml (docs/05). */
export function VariantSelector({ variants, selectedId, onSelect }: Props) {
  if (variants.length <= 1) return null;
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-ink-900">{pl.product.variantLabel}</legend>
      <div className="flex flex-wrap gap-2" role="radiogroup">
        {variants.map((v) => {
          const selected = v.id === selectedId;
          return (
            <button
              key={v.id}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={!v.availableForSale}
              onClick={() => onSelect(v.id)}
              className={cn(
                "flex min-h-11 min-w-24 flex-col items-start rounded-md border px-3 py-2 text-left transition-colors",
                selected ? "border-leaf-900 bg-leaf-100" : "border-sand-200 bg-card hover:border-leaf-500",
                !v.availableForSale && "cursor-not-allowed opacity-50 line-through",
              )}
            >
              <span className="text-sm font-semibold">{v.title}</span>
              <span className="text-xs text-ink-600">
                {formatMoney(v.price)}
                {v.volumeMl ? ` · ${t(pl.product.pricePerMl, { amount: formatPricePerMl(v.price, v.volumeMl) })}` : ""}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

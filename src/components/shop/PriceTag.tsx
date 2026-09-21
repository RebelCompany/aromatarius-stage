import { pl, t } from "@/i18n/pl";
import { formatMoney, formatPricePerMl } from "@/lib/format";
import type { Money } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

type Props = {
  price: Money;
  compareAtPrice?: Money | null;
  /** Omnibus : najniższa cena z 30 dni, obligatoire si promo (docs/06) */
  lowestPrice30?: Money | null;
  volumeMl?: number | null;
  size?: "sm" | "lg";
  className?: string;
};

export function PriceTag({ price, compareAtPrice, lowestPrice30, volumeMl, size = "lg", className }: Props) {
  const onSale = !!compareAtPrice && compareAtPrice.amount > price.amount;
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <div className="flex items-baseline gap-2">
        <span className={cn("font-semibold text-ink-900", size === "lg" ? "text-2xl" : "text-base", onSale && "text-amber-500")}>
          {formatMoney(price)}
        </span>
        {onSale && (
          <s className={cn("text-ink-600", size === "lg" ? "text-base" : "text-sm")}>{formatMoney(compareAtPrice)}</s>
        )}
        {volumeMl ? (
          <span className="text-sm text-ink-600">{t(pl.product.pricePerMl, { amount: formatPricePerMl(price, volumeMl) })}</span>
        ) : null}
      </div>
      {onSale && lowestPrice30 && (
        <p className="text-xs text-ink-600">{t(pl.product.lowestPrice30, { amount: formatMoney(lowestPrice30) })}</p>
      )}
    </div>
  );
}

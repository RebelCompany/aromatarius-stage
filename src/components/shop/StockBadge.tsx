import { pl } from "@/i18n/pl";
import { cn } from "@/lib/utils";

type Props = { available: boolean; quantity?: number | null; className?: string };

export function StockBadge({ available, quantity, className }: Props) {
  const low = available && quantity != null && quantity > 0 && quantity <= 3;
  const label = !available ? pl.product.outOfStock : low ? pl.product.lowStock : pl.product.inStock;
  return (
    <p className={cn("flex items-center gap-2 text-sm", className)} aria-live="polite">
      <span
        aria-hidden
        className={cn("size-2 rounded-full", !available ? "bg-ink-600" : low ? "bg-amber-500" : "bg-leaf-500")}
      />
      <span className={cn(!available ? "text-ink-600" : low ? "text-amber-500" : "text-leaf-700")}>{label}</span>
    </p>
  );
}

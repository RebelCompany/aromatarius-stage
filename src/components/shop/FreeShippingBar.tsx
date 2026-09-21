import { pl, t } from "@/i18n/pl";
import { formatMoney } from "@/lib/format";
import type { Money } from "@/lib/shopify/types";

type Props = { subtotal: Money; threshold: Money };

export function FreeShippingBar({ subtotal, threshold }: Props) {
  const remaining = Math.max(0, threshold.amount - subtotal.amount);
  const progress = Math.min(100, Math.round((subtotal.amount / threshold.amount) * 100));
  return (
    <div className="rounded-md bg-leaf-100 p-3 text-sm text-leaf-900">
      <p>
        {remaining > 0
          ? t(pl.cart.freeShippingLeft, { amount: formatMoney(remaining) })
          : pl.cart.freeShippingReached}
      </p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-leaf-500 transition-[width]" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

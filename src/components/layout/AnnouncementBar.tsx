import { pl, t } from "@/i18n/pl";
import { formatMoney } from "@/lib/format";
import type { Money } from "@/lib/shopify/types";

export function AnnouncementBar({ threshold }: { threshold: Money }) {
  return (
    <div className="bg-leaf-900 text-center text-xs text-cream-50 sm:text-sm">
      <p className="container-page truncate py-1.5">{t(pl.announcement, { amount: formatMoney(threshold) })}</p>
    </div>
  );
}

import { FlaskConical, Leaf, Tag, Truck } from "lucide-react";
import { pl } from "@/i18n/pl";
import { cn } from "@/lib/utils";

const items = [
  { icon: FlaskConical, title: pl.trust.analysis, sub: pl.trust.analysisSub },
  { icon: Leaf, title: pl.trust.bio, sub: pl.trust.bioSub },
  { icon: Tag, title: pl.trust.chemotype, sub: pl.trust.chemotypeSub },
  { icon: Truck, title: pl.trust.shipping, sub: pl.trust.shippingSub },
];

export function TrustBar({ className }: { className?: string }) {
  return (
    <ul className={cn("grid grid-cols-2 gap-3 md:grid-cols-4", className)}>
      {items.map(({ icon: Icon, title, sub }) => (
        <li key={title} className="flex items-start gap-3 rounded-md border border-sand-200 bg-card p-3">
          <Icon className="mt-0.5 size-5 shrink-0 text-leaf-500" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-ink-900">{title}</p>
            <p className="text-xs text-ink-600">{sub}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

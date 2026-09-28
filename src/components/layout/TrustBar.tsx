import { FlaskConical, Leaf, Tag, Truck } from "lucide-react";
import { pl } from "@/i18n/pl";
import { cn } from "@/lib/utils";

const items = [
  { icon: FlaskConical, title: pl.trust.analysis, sub: pl.trust.analysisSub },
  { icon: Leaf, title: pl.trust.bio, sub: pl.trust.bioSub },
  { icon: Tag, title: pl.trust.chemotype, sub: pl.trust.chemotypeSub },
  { icon: Truck, title: pl.trust.shipping, sub: pl.trust.shippingSub },
];

/**
 * Barre de reassurance : pastille ronde beige, icone centree, texte dessous.
 * Le beige est le sand-200 du theme, la palette n'ayant pas de rose.
 */
export function TrustBar({ className }: { className?: string }) {
  return (
    <ul className={cn("grid grid-cols-2 gap-x-4 gap-y-8 py-8 md:grid-cols-4 md:gap-x-6", className)}>
      {items.map(({ icon: Icon, title, sub }) => (
        <li key={title} className="flex flex-col items-center gap-3 px-2 text-center">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-sand-200" aria-hidden>
            <Icon className="size-7 text-leaf-700" strokeWidth={1.5} />
          </span>
          <div>
            <p className="text-sm font-semibold text-leaf-900">{title}</p>
            <p className="mt-0.5 text-xs text-ink-600">{sub}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

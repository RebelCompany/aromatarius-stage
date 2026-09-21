import { Info } from "lucide-react";
import { pl } from "@/i18n/pl";
import { cn } from "@/lib/utils";

/** Obligatoire sur PDP, receptury, kompendium (docs/04, conformité santé). */
export function HealthDisclaimer({ className }: { className?: string }) {
  return (
    <p className={cn("flex items-start gap-2 rounded-md border border-sand-200 bg-muted p-3 text-sm text-ink-600", className)}>
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>{pl.disclaimer}</span>
    </p>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { pl } from "@/i18n/pl";
import { cn } from "@/lib/utils";

/**
 * Bloc d'appel B2B, bicolore comme la reference : visuel a gauche, panneau
 * plein a droite. Le vert du panneau est le leaf-900 de la marque, la
 * reference utilisant un turquoise etranger a la palette.
 */
export function B2bCallout({ className }: { className?: string }) {
  return (
    <section className={cn("overflow-hidden rounded-md", className)} aria-labelledby="b2b-title">
      <div className="grid md:grid-cols-2">
        <div className="relative min-h-56 bg-sand-200 md:min-h-full">
          <Image
            src="/images/collection-banner.svg"
            alt=""
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            unoptimized
            className="object-cover"
          />
        </div>

        <div className="bg-leaf-900 px-6 py-8 text-cream-50 md:px-10 md:py-12">
          <h2 id="b2b-title" className="text-cream-50">
            {pl.b2b.calloutTitle}
          </h2>
          <p className="mt-3 text-cream-50/85">{pl.b2b.calloutLead}</p>

          <ul className="mt-4 space-y-2">
            {pl.b2b.calloutBullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-leaf-500" aria-hidden />
                <span className="text-cream-50/90">{bullet}</span>
              </li>
            ))}
          </ul>

          <p className="mt-6 font-medium">{pl.b2b.calloutQuestion}</p>
          <p className="mt-1 text-sm text-cream-50/85">{pl.b2b.calloutText}</p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/wspolpraca"
              className="inline-flex h-12 items-center justify-center rounded-full border border-cream-50 px-6 text-center text-sm font-medium uppercase tracking-[0.12em] text-cream-50 transition-colors hover:bg-cream-50 hover:text-leaf-900"
            >
              {pl.b2b.calloutCta}
            </Link>
            <Link
              href="/dla-profesjonalistow"
              className="inline-flex items-center gap-1 text-sm font-medium text-cream-50/90 underline-offset-4 hover:underline"
            >
              {pl.b2b.learnMore}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

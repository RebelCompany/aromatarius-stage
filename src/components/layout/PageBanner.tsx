import Image from "next/image";
import type { ProductImage } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

/** Visuel de repli tant qu'aucune photo n'est fournie. */
const FALLBACK = "/images/collection-banner.svg";

type Props = {
  title: string;
  /** Intro en texte simple. */
  intro?: string;
  /** Intro en HTML (metafield Shopify). Prioritaire sur `intro`. */
  introHtml?: string | null;
  /** Ligne secondaire, par exemple le compteur de produits. */
  meta?: string;
  /** Photo de la collection quand Shopify en fournit une. */
  image?: ProductImage | null;
  className?: string;
};

/**
 * Banniere de tete : image de fond, titre et intro par dessus.
 * Utilisee par les collections et par les index editoriaux.
 *
 * Le voile degrade n'est pas decoratif : sans lui le contraste du titre
 * dependrait de la photo televersee par le marchand (regle 6).
 */
export function PageBanner({ title, intro, introHtml, meta, image, className }: Props) {
  return (
    <section className={cn("relative isolate mb-6 overflow-hidden rounded-md", className)}>
      <div className="absolute inset-0 -z-10">
        <Image
          src={image?.url ?? FALLBACK}
          alt=""
          fill
          sizes="100vw"
          priority
          unoptimized={!image}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-leaf-900/85 via-leaf-900/60 to-leaf-900/25" />
      </div>

      <div className="px-6 py-10 md:px-10 md:py-14 lg:py-16">
        <h1 className="max-w-2xl text-cream-50">{title}</h1>
        {introHtml ? (
          <div
            className="prose-aroma mt-3 max-w-xl [&_a]:text-cream-50 [&_p]:text-cream-50/90"
            dangerouslySetInnerHTML={{ __html: introHtml }}
          />
        ) : intro ? (
          <p className="mt-3 max-w-xl text-lg text-cream-50/90">{intro}</p>
        ) : null}
        {meta && <p className="mt-3 text-sm text-cream-50/80">{meta}</p>}
      </div>
    </section>
  );
}

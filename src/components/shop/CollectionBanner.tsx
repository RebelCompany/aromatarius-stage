import Image from "next/image";
import type { Collection } from "@/lib/shopify/types";

/** Visuel de repli tant que la collection n'a pas d'image dans Shopify. */
const FALLBACK = "/images/collection-banner.svg";

type Props = {
  collection: Collection;
  /** Compteur de produits, affiche sous l'intro. */
  count: string;
};

/**
 * Banniere de collection : image de fond, titre et intro par dessus.
 * L'image vient de Shopify quand elle existe, sinon du visuel de repli.
 * Le voile degrade est indispensable : sans lui le contraste du texte
 * dependrait de la photo televersee par le marchand (regle 6).
 */
export function CollectionBanner({ collection, count }: Props) {
  const image = collection.image;
  return (
    <section className="relative isolate mb-6 overflow-hidden rounded-md">
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
        <h1 className="max-w-2xl text-cream-50">{collection.title}</h1>
        {collection.meta.introHtml && (
          <div
            className="prose-aroma mt-3 max-w-xl text-cream-50/90 [&_a]:text-cream-50 [&_p]:text-cream-50/90"
            dangerouslySetInnerHTML={{ __html: collection.meta.introHtml }}
          />
        )}
        <p className="mt-3 text-sm text-cream-50/80">{count}</p>
      </div>
    </section>
  );
}

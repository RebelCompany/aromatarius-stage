import type { Metadata } from "next";
import { pl } from "@/i18n/pl";
import { parseFinderNeeds } from "@/lib/finder-core";
import { buildMetadata } from "@/lib/seo/metadata";
import { Finder } from "@/components/shop/Finder";

type Props = { searchParams: Promise<{ potrzeba?: string | string[] }> };

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: `${pl.finder.title} | Aromatarius`,
    description: pl.finder.intro,
    path: "/dobierz",
  });
}

/** Parcours guidé pour débutants (docs/02 : quiz « Jaki olejek dla Ciebie? »). */
export default async function FinderPage({ searchParams }: Props) {
  const { potrzeba } = await searchParams;
  const initial = parseFinderNeeds(potrzeba);
  return (
    <div className="container-page max-w-3xl py-8 md:py-12">
      <h1>{pl.finder.title}</h1>
      <p className="mt-3 max-w-prose text-lg text-ink-600">{pl.finder.intro}</p>
      <div className="mt-8">
        <Finder initial={initial} />
      </div>
    </div>
  );
}

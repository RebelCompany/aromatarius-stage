import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, RotateCcw } from "lucide-react";
import { pl, t } from "@/i18n/pl";
import { getFinderResults, parseFinderNeeds } from "@/lib/finder";
import { pluralPl } from "@/lib/format";
import { needTitle } from "@/lib/navigation";
import { buildMetadata } from "@/lib/seo/metadata";
import { ContentCard } from "@/components/content/ContentCard";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { ButtonLink } from "@/components/ui/button-link";

type Props = { searchParams: Promise<{ potrzeba?: string | string[] }> };

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: `${pl.finder.resultsTitle} | Aromatarius`,
    description: pl.finder.intro,
    path: "/dobierz/wyniki",
    noindex: true,
  });
}

/** Sélection personnalisée issue du parcours guidé (noindex : page paramétrée). */
export default async function FinderResultsPage({ searchParams }: Props) {
  const { potrzeba } = await searchParams;
  const selected = parseFinderNeeds(potrzeba);
  if (selected.length === 0) redirect("/dobierz");

  const results = await getFinderResults(selected);
  const changeHref = `/dobierz?potrzeba=${selected.join(",")}`;

  return (
    <div className="container-page py-8 md:py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-leaf-700">{t(pl.finder.step, { n: 2, total: 2 })}</p>
      <h1 className="mt-2">{pl.finder.resultsTitle}</h1>
      <p className="mt-3 flex flex-wrap items-center gap-2 text-ink-600">
        <span>{pl.finder.yourChoice}</span>
        {selected.map((n) => (
          <span key={n} className="rounded-full bg-leaf-100 px-3 py-1 text-sm font-medium text-leaf-900">
            {needTitle(n)}
          </span>
        ))}
        <Link href={changeHref} className="text-sm font-medium text-leaf-700 underline-offset-2 hover:underline">
          {pl.finder.change}
        </Link>
      </p>

      <section className="mt-8" aria-labelledby="finder-recommended">
        <h2 id="finder-recommended" className="text-2xl">
          {pl.finder.recommended}
        </h2>
        <ul className="mt-2 max-w-prose space-y-1 text-ink-600">
          {selected.map((n) => (
            <li key={n}>{pl.finder.why[n]}</li>
          ))}
        </ul>
        {results.products.length > 0 ? (
          <ProductGrid products={results.products} listName="finder_results" className="mt-6" />
        ) : (
          <div className="mt-6 rounded-md border border-sand-200 bg-card p-6">
            <p className="text-ink-600">{pl.finder.empty}</p>
            <ButtonLink href="/bestsellery" className="mt-4 bg-leaf-900 hover:bg-leaf-700">
              {pl.finder.emptyCta}
            </ButtonLink>
          </div>
        )}
      </section>

      {results.recipes.length > 0 && (
        <section className="mt-12" aria-labelledby="finder-recipes">
          <h2 id="finder-recipes" className="mb-4 text-2xl">
            {pl.finder.recipes}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {results.recipes.map((r) => (
              <ContentCard
                key={r.frontmatter.slug}
                href={`/receptury/${r.frontmatter.slug}`}
                eyebrow={needTitle(r.frontmatter.problem)}
                title={r.frontmatter.title}
                description={r.frontmatter.directAnswer}
                meta={`${r.frontmatter.products.length} ${pluralPl(r.frontmatter.products.length, pl.content.ingredients)}`}
              />
            ))}
          </div>
        </section>
      )}

      {results.diffusers.length > 0 && (
        <section className="mt-12" aria-labelledby="finder-diffusers">
          <h2 id="finder-diffusers" className="mb-4 text-2xl">
            {pl.finder.diffuser}
          </h2>
          <ProductGrid products={results.diffusers} listName="finder_diffusers" />
        </section>
      )}

      <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {selected.map((n) => (
          <ButtonLink key={n} href={`/na/${n}`} size="lg" className="h-12 bg-leaf-900 text-base hover:bg-leaf-700">
            {t(pl.finder.seeAll, { need: needTitle(n) })}
            <ArrowRight data-icon="inline-end" aria-hidden />
          </ButtonLink>
        ))}
        <ButtonLink href="/dobierz" variant="outline" size="lg" className="h-12 text-base">
          <RotateCcw data-icon="inline-start" aria-hidden />
          {pl.finder.restart}
        </ButtonLink>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pl } from "@/i18n/pl";
import { getRecipes } from "@/lib/content/loader";
import { needCollectionHandle, needs, needTitle } from "@/lib/navigation";
import { parsePlpParams, type SearchParams } from "@/lib/plp";
import { buildMetadata } from "@/lib/seo/metadata";
import { getCollection, getCollectionProducts } from "@/lib/shopify";
import { ContentCard } from "@/components/content/ContentCard";
import { CollectionView } from "@/components/shop/CollectionView";

type Props = { params: Promise<{ potrzeba: string }>; searchParams: Promise<SearchParams> };

export const revalidate = 3600;

export function generateStaticParams() {
  return needs.map((potrzeba) => ({ potrzeba }));
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { potrzeba } = await params;
  const sp = await searchParams;
  const collection = await getCollection(needCollectionHandle(potrzeba));
  if (!collection) return {};
  const { hasFilters } = parsePlpParams(sp);
  return buildMetadata({
    title: collection.meta.seoTitle ?? `Olejki eteryczne na ${needTitle(potrzeba).toLowerCase()}: co wybrać | Aromatarius`,
    description: collection.meta.seoDescription ?? collection.description,
    path: `/na/${potrzeba}`,
    noindex: hasFilters,
  });
}

/** Collections besoin : landing SEO et Ads (intro, preuves, produits, receptury, FAQ). */
export default async function NeedPage({ params, searchParams }: Props) {
  const { potrzeba } = await params;
  const sp = await searchParams;
  const handle = needCollectionHandle(potrzeba);
  const { page, sort, filters, hasFilters } = parsePlpParams(sp);
  const [collection, result, recipes] = await Promise.all([
    getCollection(handle),
    getCollectionProducts(handle, { page, sort, filters }),
    getRecipes(),
  ]);
  if (!collection || !result) notFound();

  const related = recipes.filter((r) => r.frontmatter.problem === potrzeba).slice(0, 3);

  return (
    <>
      <CollectionView
        collection={{ ...collection, title: needTitle(potrzeba) }}
        result={result}
        path={`/na/${potrzeba}`}
        params={sp}
        sort={sort}
        filters={filters}
        hasFilters={hasFilters}
        hideNeedFilter
      />
      {related.length > 0 && (
        <section className="container-page pb-12" aria-labelledby="need-recipes-title">
          <div className="mb-4 flex items-end justify-between">
            <h2 id="need-recipes-title">{pl.content.relatedRecipes}</h2>
            <Link href="/receptury" className="text-sm font-medium text-leaf-700 hover:underline">
              {pl.home.recepturyLink}
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {related.map((r) => (
              <ContentCard
                key={r.frontmatter.slug}
                href={`/receptury/${r.frontmatter.slug}`}
                title={r.frontmatter.title}
                description={r.frontmatter.directAnswer}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

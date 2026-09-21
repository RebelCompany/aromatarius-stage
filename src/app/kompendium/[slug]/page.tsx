import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pl, t } from "@/i18n/pl";
import { getKompendiumEntries, getKompendiumEntry, getRecipesBySlugs } from "@/lib/content/loader";
import { formatMoney } from "@/lib/format";
import { needTitle } from "@/lib/navigation";
import { buildMetadata } from "@/lib/seo/metadata";
import { articleSchema } from "@/lib/seo/schema";
import { getProduct } from "@/lib/shopify";
import { AuthorBox, Sources } from "@/components/content/AuthorBox";
import { ContentCard } from "@/components/content/ContentCard";
import { DosageTable } from "@/components/content/DosageTable";
import { FaqAccordion } from "@/components/content/FaqAccordion";
import { HealthDisclaimer } from "@/components/content/HealthDisclaimer";
import { Mdx } from "@/components/content/Mdx";
import { RelatedProducts } from "@/components/content/RelatedProducts";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getKompendiumEntries()).map((k) => ({ slug: k.frontmatter.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getKompendiumEntry(slug);
  if (!entry) return {};
  return buildMetadata({
    title: `${entry.frontmatter.title}: właściwości, zastosowanie, przeciwwskazania`,
    description: entry.frontmatter.description,
    path: `/kompendium/${slug}`,
    type: "article",
    publishedTime: entry.frontmatter.publishedAt,
    modifiedTime: entry.frontmatter.updatedAt,
  });
}

export default async function KompendiumEntryPage({ params }: Props) {
  const { slug } = await params;
  const entry = await getKompendiumEntry(slug);
  if (!entry) notFound();
  const fm = entry.frontmatter;
  const [product, recipes] = await Promise.all([
    fm.productHandle ? getProduct(fm.productHandle) : null,
    getRecipesBySlugs(fm.recipes),
  ]);
  const faq = fm.faq.map((f) => ({ pytanie: f.q, odpowiedzHtml: `<p>${f.a}</p>` }));

  const card: [string, string | null][] = [
    [pl.product.latinName, fm.card.nazwaLacinska],
    [pl.product.family, fm.card.rodzina],
    [pl.product.chemotype, fm.card.chemotyp],
    [pl.product.plantPart, fm.card.czescRosliny],
    [pl.product.method, fm.card.metoda],
    [pl.product.origin, fm.card.pochodzenie],
    [pl.product.mainComponents, fm.card.glowneSkladniki.join(", ") || null],
  ];

  return (
    <article className="container-page py-8 md:py-12">
      <JsonLd
        data={articleSchema({
          title: fm.title,
          description: fm.description,
          path: `/kompendium/${slug}`,
          publishedAt: fm.publishedAt,
          updatedAt: fm.updatedAt,
          image: fm.cover,
          author: "Bogusia",
        })}
      />
      <Breadcrumbs
        items={[
          { name: pl.nav.kompendium, href: "/kompendium" },
          { name: fm.title, href: `/kompendium/${slug}` },
        ]}
        className="mb-4"
      />
      <header className="max-w-[68ch]">
        <h1>{fm.title}</h1>
        <p className="latin mt-1 text-xl">{fm.card.nazwaLacinska}</p>
        <div className="mt-4">
          <AuthorBox publishedAt={fm.publishedAt} updatedAt={fm.updatedAt} readingMinutes={entry.readingMinutes} />
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <section aria-labelledby="direct-title" className="rounded-md bg-leaf-100 p-5">
            <h2 id="direct-title" className="text-base font-semibold uppercase tracking-wide text-leaf-700">
              {pl.content.directAnswer}
            </h2>
            <p className="mt-2 text-lg">{fm.directAnswer}</p>
          </section>

          <section aria-labelledby="card-title" className="mt-8">
            <h2 id="card-title" className="text-xl">
              {pl.content.card}
            </h2>
            <dl className="mt-3 grid gap-3 rounded-md border border-sand-200 bg-card p-4 text-sm sm:grid-cols-2">
              {card
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-ink-600">{k}</dt>
                    <dd className={k === pl.product.latinName ? "latin" : "font-medium"}>{v}</dd>
                  </div>
                ))}
            </dl>
          </section>

          <div className="prose-aroma mt-8">
            <Mdx source={entry.body} />
            {fm.dosage.length > 0 && (
              <>
                <h2 id="dawkowanie">{pl.product.howToUse}</h2>
                <DosageTable rows={fm.dosage} caption={pl.product.howToUse} />
              </>
            )}
          </div>

          <div className="mt-10 max-w-[68ch]">
            <FaqAccordion items={faq} title={pl.content.faq} />
            <Sources sources={fm.sources} />
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {product && (
            <Link
              href={`/produkt/${product.handle}`}
              className="block rounded-md border border-leaf-500/40 bg-card p-4 transition-colors hover:bg-leaf-100"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-leaf-500">{pl.nav.shop}</p>
              <p className="mt-1 font-serif text-lg text-leaf-900">
                {t(pl.content.buyOil, { name: product.title.replace(/ BIO$/, ""), amount: formatMoney(product.priceRange.min) })}
              </p>
            </Link>
          )}
          <HealthDisclaimer />
        </aside>
      </div>

      {recipes.length > 0 && (
        <section className="mt-12" aria-labelledby="recipes-title">
          <h2 id="recipes-title" className="mb-4">
            {pl.product.recipesWith}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {recipes.map((r) => (
              <ContentCard
                key={r.frontmatter.slug}
                href={`/receptury/${r.frontmatter.slug}`}
                eyebrow={needTitle(r.frontmatter.problem)}
                title={r.frontmatter.title}
                description={r.frontmatter.directAnswer}
              />
            ))}
          </div>
        </section>
      )}

      <RelatedProducts handles={fm.pairsWith} title={pl.product.pairsWith} listName="kompendium_pairs" />
    </article>
  );
}

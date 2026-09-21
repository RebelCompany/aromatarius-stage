import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FileDown } from "lucide-react";
import { pl, t } from "@/i18n/pl";
import { getKompendiumEntry, getRecipesBySlugs } from "@/lib/content/loader";
import { formatMoney } from "@/lib/format";
import { needTitle } from "@/lib/navigation";
import { buildMetadata } from "@/lib/seo/metadata";
import { itemListSchema, productSchema } from "@/lib/seo/schema";
import { getAllProductHandles, getProduct, getProductsByHandles, getShopInfo } from "@/lib/shopify";
import type { Product } from "@/lib/shopify/types";
import { ContentCard } from "@/components/content/ContentCard";
import { DosageTable } from "@/components/content/DosageTable";
import { FaqAccordion } from "@/components/content/FaqAccordion";
import { HealthDisclaimer } from "@/components/content/HealthDisclaimer";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { BuyBox } from "@/components/shop/BuyBox";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { ProductImage } from "@/components/shop/ProductImage";
import { Badge } from "@/components/ui/badge";

type Props = { params: Promise<{ handle: string }> };

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const handles = await getAllProductHandles();
  return handles.map(({ handle }) => ({ handle }));
}

const typeCollection: Record<string, { handle: string; title: string }> = {
  "Olejek eteryczny": { handle: "olejki-eteryczne", title: "Olejki eteryczne" },
  Hydrolat: { handle: "hydrolaty", title: "Hydrolaty" },
  "Olej roślinny": { handle: "oleje-roslinne", title: "Oleje roślinne" },
  Mieszanka: { handle: "mieszanki", title: "Mieszanki" },
  Zestaw: { handle: "zestawy", title: "Zestawy" },
  Dyfuzor: { handle: "dyfuzory", title: "Dyfuzory" },
};

function seoTitle(p: Product): string {
  if (p.meta.seoTitle) return p.meta.seoTitle;
  const ml = p.variants.map((v) => v.volumeMl).filter(Boolean).join("/");
  return `${p.title} ${ml ? `${ml} ml` : ""}: ${p.productType.toLowerCase()}, cena | Aromatarius`.replace(/\s+/g, " ");
}

function seoDescription(p: Product): string {
  if (p.meta.seoDescription) return p.meta.seoDescription;
  const proof = p.meta.numerPartii ? `Analiza GC/MS partii ${p.meta.numerPartii} do pobrania.` : "";
  return `${p.title} (${p.meta.nazwaLacinska ?? ""}) ${p.tags.includes("bio") ? "BIO" : ""}. ${p.meta.naCo.slice(0, 2).join(", ")}. ${proof} Od ${formatMoney(p.priceRange.min)}, wysyłka InPost 24h.`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) return {};
  return buildMetadata({
    title: seoTitle(product),
    description: seoDescription(product),
    path: `/produkt/${handle}`,
    image: product.featuredImage ? { url: product.featuredImage.url, width: 1200, height: 1200, alt: product.featuredImage.alt } : null,
  });
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();

  const [shop, recipes, kompendium, pairsWith] = await Promise.all([
    getShopInfo(),
    getRecipesBySlugs(product.meta.recepturySlugs),
    product.meta.kompendiumSlug ? getKompendiumEntry(product.meta.kompendiumSlug) : null,
    getProductsByHandles(product.meta.pasujeDo),
  ]);

  const parent = typeCollection[product.productType];
  const crumbs = [
    ...(parent ? [{ name: parent.title, href: `/${parent.handle}` }] : []),
    { name: product.title, href: `/produkt/${product.handle}` },
  ];
  const isBio = product.tags.includes("bio");
  const needTags = product.tags.filter((t) => t.startsWith("potrzeba:")).map((t) => t.slice(9));

  return (
    <article className="container-page py-6 md:py-10">
      <JsonLd data={productSchema(product)} />
      {pairsWith.length > 0 && <JsonLd data={itemListSchema(pairsWith, pl.product.pairsWith)} />}
      <Breadcrumbs items={crumbs} className="mb-4" />

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Galerie (sticky desktop) */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative aspect-square overflow-hidden rounded-md bg-cream-50">
            <ProductImage image={product.featuredImage} sizes="(min-width: 1024px) 50vw, 100vw" priority />
          </div>
          {product.images.length > 1 && (
            <ul className="mt-3 flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <li key={img.url} className="relative size-20 shrink-0 overflow-hidden rounded-md border border-sand-200">
                  <ProductImage image={img} sizes="80px" />
                  <span className="sr-only">Zdjęcie {i + 1}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Colonne achat */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-2">
            {isBio && <Badge className="bg-amber-500 text-white">{pl.product.bioBadge}</Badge>}
            {product.meta.chemotyp && <Badge variant="secondary" className="bg-leaf-100 text-leaf-900">ct. {product.meta.chemotyp}</Badge>}
            {product.meta.analizaPdf && <Badge variant="outline">{pl.product.analysisBadge}</Badge>}
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl">{product.title}</h1>
            {product.meta.nazwaLacinska && <p className="latin mt-1 text-lg">{product.meta.nazwaLacinska}</p>}
          </div>
          <a href="#opinie" className="text-sm text-ink-600 hover:underline">
            {pl.product.noReviews}
          </a>

          <Suspense fallback={null}>
            <BuyBox product={product} freeShippingThreshold={shop.freeShippingThreshold} />
          </Suspense>

          {/* Bloc preuve */}
          {(product.meta.analizaPdf || product.meta.glowneSkladniki.length > 0) && (
            <section className="rounded-md border border-leaf-500/40 bg-leaf-100/60 p-4" aria-labelledby="proof-title">
              <h2 id="proof-title" className="text-base font-semibold text-leaf-900">
                {product.meta.numerPartii ? t(pl.product.batch, { batch: product.meta.numerPartii }) : pl.product.analysisBadge}
              </h2>
              {product.meta.analizaPdf && (
                <a
                  href={product.meta.analizaPdf.url}
                  className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-leaf-700 hover:underline"
                  download
                >
                  <FileDown className="size-4" aria-hidden />
                  {pl.product.downloadAnalysis}
                </a>
              )}
              {product.meta.glowneSkladniki.length > 0 && (
                <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
                  {product.meta.glowneSkladniki.slice(0, 3).map((c) => (
                    <div key={c.nazwa} className="rounded bg-card p-2">
                      <dt className="text-xs text-ink-600">{c.nazwa}</dt>
                      <dd className="font-semibold tabular-nums">{c.procent.toLocaleString("pl-PL")} %</dd>
                    </div>
                  ))}
                </dl>
              )}
            </section>
          )}

          {/* Résumé 3 puces */}
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="font-semibold text-leaf-900">{pl.product.forWhat}</dt>
              <dd className="text-ink-600">{product.meta.naCo.join(", ")}</dd>
            </div>
            <div>
              <dt className="font-semibold text-leaf-900">{pl.product.scent}</dt>
              <dd className="text-ink-600">{product.meta.zapachOpis}</dd>
            </div>
            <div>
              <dt className="font-semibold text-leaf-900">{pl.product.howToUse}</dt>
              <dd className="text-ink-600">{product.meta.dawkowanie[0]?.dawka ?? product.meta.dawkowanie[0]?.metoda}</dd>
            </div>
          </dl>
          {needTags.length > 0 && (
            <ul className="flex flex-wrap gap-2 text-xs">
              {needTags.map((n) => (
                <li key={n}>
                  <Link href={`/na/${n}`} className="rounded-full border border-sand-200 px-3 py-1 hover:bg-leaf-100">
                    {needTitle(n)}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Accordéons rendus serveur */}
      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="divide-y divide-sand-200 rounded-md border border-sand-200 bg-card">
          {product.descriptionHtml.length > 300 && (
            <Accordion title={pl.product.description} html={product.descriptionHtml} open />
          )}
          <Accordion title={pl.product.properties} html={product.meta.wlasciwosciHtml} open={product.descriptionHtml.length <= 300} />
          <Accordion title={pl.product.howToUse} html={product.meta.jakStosowacHtml}>
            <DosageTable rows={product.meta.dawkowanie} caption={pl.product.howToUse} />
          </Accordion>
          <Accordion title={pl.product.safety} html={product.meta.bezpieczenstwoHtml} />
          <Accordion title={pl.product.composition}>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              {[
                [pl.product.latinName, product.meta.nazwaLacinska],
                [pl.product.family, product.meta.rodzinaBotaniczna],
                [pl.product.plantPart, product.meta.czescRosliny],
                [pl.product.method, product.meta.metodaEkstrakcji],
                [pl.product.origin, product.meta.pochodzenie],
                [pl.product.chemotype, product.meta.chemotyp],
                [pl.product.bioCert, product.meta.certyfikatBio],
              ]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k as string}>
                    <dt className="text-ink-600">{k}</dt>
                    <dd className={k === pl.product.latinName ? "latin" : "font-medium"}>{v}</dd>
                  </div>
                ))}
            </dl>
          </Accordion>
          {product.meta.wplywEmocjonalnyHtml && <Accordion title={pl.product.emotional} html={product.meta.wplywEmocjonalnyHtml} />}
        </div>
        <aside className="space-y-4">
          {kompendium && (
            <ContentCard
              href={`/kompendium/${kompendium.frontmatter.slug}`}
              eyebrow={pl.nav.kompendium}
              title={t(pl.product.learnMore, { name: kompendium.frontmatter.title })}
              description={kompendium.frontmatter.directAnswer}
            />
          )}
          <HealthDisclaimer />
        </aside>
      </div>

      {product.meta.faq.length > 0 && (
        <div className="mt-12">
          <FaqAccordion items={product.meta.faq} title={pl.product.faq} />
        </div>
      )}

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

      {pairsWith.length > 0 && (
        <section className="mt-12" aria-labelledby="pairs-title">
          <h2 id="pairs-title" className="mb-4">
            {pl.product.pairsWith}
          </h2>
          <ProductGrid products={pairsWith} listName="pdp_pairs_with" />
        </section>
      )}

      <section id="opinie" className="mt-12 scroll-mt-24" aria-labelledby="reviews-title">
        <h2 id="reviews-title" className="mb-4">
          {pl.product.reviews}
        </h2>
        {/* Judge.me widget headless : branché en semaine 2 (docs/09) */}
        <p className="rounded-md border border-sand-200 bg-card p-6 text-ink-600">{pl.product.noReviews}</p>
      </section>
    </article>
  );
}

function Accordion({ title, html, open, children }: { title: string; html?: string | null; open?: boolean; children?: React.ReactNode }) {
  if (!html && !children) return null;
  return (
    <details open={open} className="group px-5">
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 font-serif text-lg text-leaf-900 [&::-webkit-details-marker]:hidden">
        <h2 className="text-lg">{title}</h2>
        <span className="text-ink-600 transition-transform group-open:rotate-45" aria-hidden>
          +
        </span>
      </summary>
      <div className="prose-aroma pb-5 text-[0.95rem]">
        {html && <div dangerouslySetInnerHTML={{ __html: html }} />}
        {children}
      </div>
    </details>
  );
}

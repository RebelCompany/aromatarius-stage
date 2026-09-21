import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { pl } from "@/i18n/pl";
import { pluralPl } from "@/lib/format";
import { getKompendiumEntries, getRecipes } from "@/lib/content/loader";
import { homeNeeds, needTitle } from "@/lib/navigation";
import { buildMetadata } from "@/lib/seo/metadata";
import { getCollectionProducts } from "@/lib/shopify";
import { ContentCard } from "@/components/content/ContentCard";
import { TrustBar } from "@/components/layout/TrustBar";
import { NeedIcon } from "@/components/shop/NeedIcon";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { ButtonLink } from "@/components/ui/button-link";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Olejki eteryczne BIO z analizą partii | Aromatarius",
    description:
      "Certyfikowane olejki eteryczne BIO z analizą GC/MS każdej partii, chemotypem i nazwą łacińską. Receptury, kompendium, wysyłka InPost w 24h.",
    path: "/",
  });
}

export default async function HomePage() {
  const [bestsellers, recipes, kompendium] = await Promise.all([
    getCollectionProducts("bestsellery", { perPage: 8 }),
    getRecipes(),
    getKompendiumEntries(),
  ]);

  return (
    <>
      {/* 1. Hero */}
      <section className="container-page grid gap-8 py-10 md:grid-cols-2 md:items-center md:py-16">
        <div className="order-1">
          <h1>{pl.home.heroTitle}</h1>
          <p className="mt-4 max-w-prose text-lg text-ink-600">{pl.home.heroSubtitle}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/olejki-eteryczne" size="lg" className="h-12 bg-leaf-900 px-6 text-base hover:bg-leaf-700">
              {pl.home.heroCta}
              <ArrowRight data-icon="inline-end" aria-hidden />
            </ButtonLink>
            <ButtonLink href="/dobierz" variant="outline" size="lg" className="h-12 px-6 text-base">
              <Compass data-icon="inline-start" aria-hidden />
              {pl.finder.homeCta}
            </ButtonLink>
          </div>
          <Link href="/jakosc" className="mt-4 inline-block text-sm font-medium text-leaf-700 hover:underline">
            {pl.home.heroCtaSecondary}
          </Link>
        </div>
        <div className="order-2 relative aspect-[4/3] overflow-hidden rounded-md bg-leaf-100">
          <Image
            src="/images/products/drzewo-herbaciane-bio.svg"
            alt="Flakon olejku eterycznego Aromatarius z kartą analizy GC/MS"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            priority
            unoptimized
            className="object-cover"
          />
          <div className="absolute bottom-4 left-4 rounded-md bg-card/90 px-3 py-2 text-xs shadow">
            <p className="font-semibold text-leaf-900">Analiza GC/MS partii LAV-04.26</p>
            <p className="text-ink-600">linalol 36,4 % · octan linalylu 33,1 %</p>
          </div>
        </div>
      </section>

      {/* 2. TrustBar */}
      <section className="container-page" aria-label="Dlaczego warto">
        <TrustBar />
      </section>

      {/* 3. Na co szukasz */}
      <section className="container-page py-12" aria-labelledby="needs-title">
        <h2 id="needs-title" className="mb-6">
          {pl.home.needsTitle}
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {homeNeeds.map((n) => (
            <li key={n}>
              <Link
                href={`/na/${n}`}
                className="flex h-full flex-col items-center justify-center gap-2 rounded-md border border-sand-200 bg-card p-4 text-center transition-colors hover:border-leaf-500 hover:bg-leaf-100"
              >
                <NeedIcon need={n} />
                <span className="font-serif text-base text-leaf-900">{needTitle(n)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 4. Bestsellery */}
      {bestsellers && bestsellers.products.length > 0 && (
        <section className="container-page pb-12" aria-labelledby="bestsellers-title">
          <div className="mb-6 flex items-end justify-between">
            <h2 id="bestsellers-title">{pl.home.bestsellersTitle}</h2>
            <Link href="/olejki-eteryczne" className="text-sm font-medium text-leaf-700 hover:underline">
              {pl.nav.allProducts}
            </Link>
          </div>
          <ProductGrid products={bestsellers.products} listName="home_bestsellers" />
        </section>
      )}

      {/* 5. Dlaczego Aromatarius */}
      <section className="bg-leaf-100/60 py-12" aria-labelledby="why-title">
        <div className="container-page">
          <h2 id="why-title" className="mb-6">
            {pl.home.whyTitle}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              [pl.home.whyAnalysisTitle, pl.home.whyAnalysisText],
              [pl.home.whyBioTitle, pl.home.whyBioText],
              [pl.home.whyKnowledgeTitle, pl.home.whyKnowledgeText],
            ].map(([title, text]) => (
              <div key={title} className="rounded-md bg-card p-6">
                <h3 className="text-lg">{title}</h3>
                <p className="mt-2 text-ink-600">{text}</p>
              </div>
            ))}
          </div>
          <Link href="/jakosc" className="mt-6 inline-block font-medium text-leaf-700 hover:underline">
            {pl.home.whyLink}
          </Link>
        </div>
      </section>

      {/* 6. Receptury */}
      {recipes.length > 0 && (
        <section className="container-page py-12" aria-labelledby="recipes-title">
          <div className="mb-6 flex items-end justify-between">
            <h2 id="recipes-title">{pl.home.recepturyTitle}</h2>
            <Link href="/receptury" className="text-sm font-medium text-leaf-700 hover:underline">
              {pl.home.recepturyLink}
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {recipes.slice(0, 3).map((r) => (
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

      {/* 7. Kompendium */}
      {kompendium.length > 0 && (
        <section className="container-page pb-12" aria-labelledby="kompendium-title">
          <div className="mb-6 flex items-end justify-between">
            <h2 id="kompendium-title">{pl.home.kompendiumTitle}</h2>
            <Link href="/kompendium" className="text-sm font-medium text-leaf-700 hover:underline">
              {pl.home.kompendiumLink}
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kompendium.slice(0, 4).map((k) => (
              <ContentCard
                key={k.frontmatter.slug}
                href={`/kompendium/${k.frontmatter.slug}`}
                eyebrow={k.frontmatter.card.nazwaLacinska}
                title={k.frontmatter.title}
                description={k.frontmatter.directAnswer}
              />
            ))}
          </div>
        </section>
      )}

      {/* 8. Bogusia */}
      <section className="container-page pb-12" aria-labelledby="founder-title">
        <div className="flex flex-col gap-6 rounded-md border border-sand-200 bg-card p-6 md:flex-row md:items-center">
          <div className="flex size-24 shrink-0 items-center justify-center rounded-full bg-leaf-100 font-serif text-3xl text-leaf-900" aria-hidden>
            B
          </div>
          <div>
            <h2 id="founder-title" className="text-xl">
              {pl.home.founderTitle}
            </h2>
            <p className="mt-2 text-ink-600">{pl.home.founderText}</p>
            <Link href="/o-nas" className="mt-3 inline-block font-medium text-leaf-700 hover:underline">
              {pl.home.founderLink}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

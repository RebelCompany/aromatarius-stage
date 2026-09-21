import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pl, t } from "@/i18n/pl";
import { getRecipe, getRecipes, getRecipesBySlugs } from "@/lib/content/loader";
import { needTitle } from "@/lib/navigation";
import { buildMetadata } from "@/lib/seo/metadata";
import { howToSchema, itemListSchema } from "@/lib/seo/schema";
import { getProduct } from "@/lib/shopify";
import { productToCard } from "@/lib/shopify/mappers";
import { AuthorBox } from "@/components/content/AuthorBox";
import { Callout } from "@/components/content/Callout";
import { ContentCard } from "@/components/content/ContentCard";
import { FaqAccordion } from "@/components/content/FaqAccordion";
import { HealthDisclaimer } from "@/components/content/HealthDisclaimer";
import { Mdx } from "@/components/content/Mdx";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { RecipeBundle, type BundleItem } from "@/components/shop/RecipeBundle";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getRecipes()).map((r) => ({ slug: r.frontmatter.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await getRecipe(slug);
  if (!recipe) return {};
  return buildMetadata({
    title: `${recipe.frontmatter.title}: receptura aromaterapeutyczna | Aromatarius`,
    description: recipe.frontmatter.description,
    path: `/receptury/${slug}`,
    type: "article",
    publishedTime: recipe.frontmatter.publishedAt,
    modifiedTime: recipe.frontmatter.updatedAt,
  });
}

export default async function RecipePage({ params }: Props) {
  const { slug } = await params;
  const recipe = await getRecipe(slug);
  if (!recipe) notFound();
  const fm = recipe.frontmatter;

  // Résolution des produits via l'adapter : prix et dispo toujours à jour
  const products = await Promise.all(fm.products.map((p) => getProduct(p.handle)));
  const items: BundleItem[] = fm.products.map((p, i) => {
    const product = products[i];
    const variant = product?.variants.find((v) => v.volumeMl === p.ml) ?? product?.variants.find((v) => v.availableForSale) ?? product?.variants[0];
    return {
      handle: p.handle,
      title: product?.title ?? p.handle,
      image: product?.featuredImage ?? null,
      variantId: variant?.id ?? null,
      variantTitle: variant?.title ?? null,
      price: variant?.price.amount ?? null,
      drops: p.drops,
      available: variant?.availableForSale ?? false,
    };
  });
  const cards = products.filter((p): p is NonNullable<typeof p> => !!p).map(productToCard);
  const related = await getRecipesBySlugs(fm.relatedRecipes);
  const faq = fm.faq.map((f) => ({ pytanie: f.q, odpowiedzHtml: `<p>${f.a}</p>` }));

  return (
    <article className="container-page py-8 md:py-12">
      <JsonLd
        data={[
          howToSchema({
            title: fm.title,
            description: fm.description,
            path: `/receptury/${slug}`,
            totalTime: fm.totalTime,
            supplies: items.map((i) => `${i.title} (${t(pl.content.drops, { count: i.drops })})`),
            steps: fm.steps.map((s, i) => ({ name: t(pl.content.step, { n: i + 1 }), text: s })),
          }),
          itemListSchema(cards, fm.title),
        ]}
      />
      <Breadcrumbs
        items={[
          { name: pl.nav.receptury, href: "/receptury" },
          { name: fm.title, href: `/receptury/${slug}` },
        ]}
        className="mb-4"
      />
      <header className="max-w-[68ch]">
        <p className="text-xs font-semibold uppercase tracking-wide text-leaf-500">{needTitle(fm.problem)}</p>
        <h1 className="mt-2">{fm.title}</h1>
        <div className="mt-4">
          <AuthorBox publishedAt={fm.publishedAt} updatedAt={fm.updatedAt} />
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          {/* Réponse directe : citée par les moteurs IA (docs/04) */}
          <section aria-labelledby="direct-title" className="rounded-md bg-leaf-100 p-5">
            <h2 id="direct-title" className="text-base font-semibold uppercase tracking-wide text-leaf-700">
              {pl.content.directAnswer}
            </h2>
            <p className="mt-2 text-lg">{fm.directAnswer}</p>
          </section>

          <section aria-labelledby="prep-title" className="mt-10">
            <h2 id="prep-title">{pl.content.preparation}</h2>
            <ol className="mt-4 space-y-3">
              {fm.steps.map((s, i) => (
                <li key={i} id={`krok-${i + 1}`} className="flex gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-leaf-900 text-sm font-semibold text-cream-50" aria-hidden>
                    {i + 1}
                  </span>
                  <p className="pt-1">{s}</p>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="usage-title" className="mt-10">
            <h2 id="usage-title">{pl.content.usage}</h2>
            <p className="mt-3 max-w-[68ch]">{fm.usage}</p>
          </section>

          <section aria-labelledby="safety-title" className="mt-10">
            <h2 id="safety-title">{pl.content.safety}</h2>
            <Callout type="warning">
              <ul className="list-disc pl-5">
                {fm.precautions.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </Callout>
          </section>

          <section aria-labelledby="why-title" className="prose-aroma mt-10">
            <h2 id="why-title">{pl.content.whyTheseOils}</h2>
            <Mdx source={recipe.body} />
          </section>

          <div className="mt-10 max-w-[68ch]">
            <FaqAccordion items={faq} title={pl.content.faq} />
          </div>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <RecipeBundle items={items} extras={fm.extras} />
          <HealthDisclaimer className="mt-4" />
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-12" aria-labelledby="related-title">
          <h2 id="related-title" className="mb-4">
            {pl.content.relatedRecipes}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {related.map((r) => (
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
    </article>
  );
}

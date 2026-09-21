import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage, getPages } from "@/lib/content/loader";
import { parsePlpParams, type SearchParams } from "@/lib/plp";
import { buildMetadata } from "@/lib/seo/metadata";
import { getCollection, getCollectionProducts, getCollections } from "@/lib/shopify";
import { Mdx } from "@/components/content/Mdx";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { CollectionView } from "@/components/shop/CollectionView";
import { absoluteUrl } from "@/lib/seo/metadata";

/**
 * Segment racine partagé : /[collection] (Shopify) ou /[page] (MDX content/pages).
 * Next.js n'autorise pas deux segments dynamiques parallèles au même niveau,
 * on résout donc ici : collection d'abord, puis page statique, sinon 404.
 */

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<SearchParams> };

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const [collections, pages] = await Promise.all([getCollections(), getPages()]);
  return [
    ...collections.filter((c) => !c.handle.startsWith("na-")).map((c) => ({ slug: c.handle })),
    ...pages.map((p) => ({ slug: p.frontmatter.slug })),
  ];
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const collection = await getCollection(slug);
  if (collection) {
    const { hasFilters, page } = parsePlpParams(sp);
    return buildMetadata({
      title: collection.meta.seoTitle ?? `${collection.title} BIO: sklep z olejkami | Aromatarius`,
      description: collection.meta.seoDescription ?? collection.description,
      path: page > 1 ? `/${slug}?page=${page}` : `/${slug}`,
      image: collection.image,
      noindex: hasFilters,
    });
  }
  const page = await getPage(slug);
  if (!page) return {};
  return buildMetadata({ title: page.frontmatter.title, description: page.frontmatter.description, path: `/${slug}` });
}

export default async function RootSlugPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;

  const collection = await getCollection(slug);
  if (collection) {
    const { page, sort, filters, hasFilters } = parsePlpParams(sp);
    const result = await getCollectionProducts(slug, { page, sort, filters });
    if (!result) notFound();
    return (
      <CollectionView
        collection={collection}
        result={result}
        path={`/${slug}`}
        params={sp}
        sort={sort}
        filters={filters}
        hasFilters={hasFilters}
      />
    );
  }

  const page = await getPage(slug);
  if (!page) notFound();

  const schemaType = page.frontmatter.kind === "about" ? "AboutPage" : page.frontmatter.kind === "contact" ? "ContactPage" : "WebPage";
  return (
    <article className="container-page py-8 md:py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": schemaType,
          name: page.frontmatter.title,
          description: page.frontmatter.description,
          url: absoluteUrl(`/${slug}`),
          dateModified: page.frontmatter.updatedAt,
          inLanguage: "pl-PL",
        }}
      />
      <Breadcrumbs items={[{ name: page.frontmatter.title, href: `/${slug}` }]} className="mb-4" />
      <h1>{page.frontmatter.title}</h1>
      <p className="mt-3 max-w-prose text-lg text-ink-600">{page.frontmatter.description}</p>
      <div className="prose-aroma mt-8">
        <Mdx source={page.body} />
      </div>
    </article>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pl } from "@/i18n/pl";
import { getBlogPost, getBlogPosts } from "@/lib/content/loader";
import { buildMetadata } from "@/lib/seo/metadata";
import { articleSchema } from "@/lib/seo/schema";
import { AuthorBox, Sources } from "@/components/content/AuthorBox";
import { FaqAccordion } from "@/components/content/FaqAccordion";
import { HealthDisclaimer } from "@/components/content/HealthDisclaimer";
import { Mdx } from "@/components/content/Mdx";
import { RelatedProducts } from "@/components/content/RelatedProducts";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getBlogPosts()).map((p) => ({ slug: p.frontmatter.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return {};
  return buildMetadata({
    title: `${post.frontmatter.title} | Blog Aromatarius`,
    description: post.frontmatter.description,
    path: `/blog/${slug}`,
    type: "article",
    image: post.frontmatter.cover ? { url: post.frontmatter.cover } : null,
    publishedTime: post.frontmatter.publishedAt,
    modifiedTime: post.frontmatter.updatedAt,
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();
  const fm = post.frontmatter;
  const faq = fm.faq.map((f) => ({ pytanie: f.q, odpowiedzHtml: `<p>${f.a}</p>` }));

  return (
    <article className="container-page py-8 md:py-12">
      <JsonLd
        data={articleSchema({
          title: fm.title,
          description: fm.description,
          path: `/blog/${slug}`,
          publishedAt: fm.publishedAt,
          updatedAt: fm.updatedAt,
          image: fm.cover,
          author: "Bogusia",
        })}
      />
      <Breadcrumbs items={[{ name: pl.nav.blog, href: "/blog" }, { name: fm.title, href: `/blog/${slug}` }]} className="mb-4" />
      <header className="max-w-[68ch]">
        <p className="text-xs font-semibold uppercase tracking-wide text-leaf-500">{fm.category}</p>
        <h1 className="mt-2">{fm.title}</h1>
        <p className="mt-3 text-lg text-ink-600">{fm.description}</p>
        <div className="mt-4">
          <AuthorBox publishedAt={fm.publishedAt} updatedAt={fm.updatedAt} readingMinutes={post.readingMinutes} />
        </div>
      </header>
      <div className="prose-aroma mt-8">
        <Mdx source={post.body} />
      </div>
      <div className="max-w-[68ch]">
        <FaqAccordion items={faq} title={pl.content.faq} />
        <Sources sources={fm.sources} />
        <HealthDisclaimer className="mt-8" />
      </div>
      <RelatedProducts handles={fm.relatedProducts} title={pl.content.relatedProducts} listName="blog_related" />
    </article>
  );
}

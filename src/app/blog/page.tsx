import type { Metadata } from "next";
import { pl, t } from "@/i18n/pl";
import { getBlogPosts } from "@/lib/content/loader";
import { formatDate } from "@/lib/format";
import { buildMetadata } from "@/lib/seo/metadata";
import { ContentCard } from "@/components/content/ContentCard";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

export function generateMetadata(): Metadata {
  return buildMetadata({ title: `Blog o olejkach eterycznych | Aromatarius`, description: pl.content.blogIntro, path: "/blog" });
}

export default async function BlogIndexPage() {
  const posts = await getBlogPosts();
  return (
    <div className="container-page py-8 md:py-12">
      <Breadcrumbs items={[{ name: pl.nav.blog, href: "/blog" }]} className="mb-4" />
      <h1>{pl.content.blogTitle}</h1>
      <p className="mt-3 max-w-prose text-lg text-ink-600">{pl.content.blogIntro}</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <ContentCard
            key={p.frontmatter.slug}
            href={`/blog/${p.frontmatter.slug}`}
            eyebrow={p.frontmatter.category}
            title={p.frontmatter.title}
            description={p.frontmatter.description}
            meta={`${formatDate(p.frontmatter.publishedAt)} · ${t(pl.content.readingTime, { minutes: p.readingMinutes })}`}
          />
        ))}
      </div>
    </div>
  );
}

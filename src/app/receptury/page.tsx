import type { Metadata } from "next";
import { pl } from "@/i18n/pl";
import { pluralPl } from "@/lib/format";
import { getRecipes } from "@/lib/content/loader";
import { needTitle } from "@/lib/navigation";
import { buildMetadata } from "@/lib/seo/metadata";
import { ContentCard } from "@/components/content/ContentCard";
import { PageBanner } from "@/components/layout/PageBanner";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Receptury aromaterapeutyczne: gotowe mieszanki na sen, stres, odporność | Aromatarius",
    description: pl.content.recepturyIntro,
    path: "/receptury",
  });
}

export default async function RecipesIndexPage() {
  const recipes = await getRecipes();
  return (
    <div className="container-page py-8 md:py-12">
      <Breadcrumbs items={[{ name: pl.nav.receptury, href: "/receptury" }]} className="mb-4" />
      <PageBanner title={pl.content.recepturyTitle} intro={pl.content.recepturyIntro} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recipes.map((r) => (
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
    </div>
  );
}

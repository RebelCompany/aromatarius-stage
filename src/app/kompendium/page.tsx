import type { Metadata } from "next";
import { pl } from "@/i18n/pl";
import { getKompendiumEntries } from "@/lib/content/loader";
import { buildMetadata } from "@/lib/seo/metadata";
import { ContentCard } from "@/components/content/ContentCard";
import { PageBanner } from "@/components/layout/PageBanner";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Kompendium olejków eterycznych: właściwości, dawkowanie, przeciwwskazania | Aromatarius",
    description: pl.content.kompendiumIntro,
    path: "/kompendium",
  });
}

export default async function KompendiumIndexPage() {
  const entries = await getKompendiumEntries();
  return (
    <div className="container-page py-8 md:py-12">
      <Breadcrumbs items={[{ name: pl.nav.kompendium, href: "/kompendium" }]} className="mb-4" />
      <PageBanner title={pl.content.kompendiumTitle} intro={pl.content.kompendiumIntro} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((k) => (
          <ContentCard
            key={k.frontmatter.slug}
            href={`/kompendium/${k.frontmatter.slug}`}
            eyebrow={k.frontmatter.card.nazwaLacinska}
            title={k.frontmatter.title}
            description={k.frontmatter.directAnswer}
          />
        ))}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { pl } from "@/i18n/pl";
import { buildMetadata } from "@/lib/seo/metadata";
import { PartnershipForm } from "@/components/b2b/PartnershipForm";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: `${pl.b2b.formTitle} | Aromatarius`,
    description: pl.b2b.formIntro,
    path: "/wspolpraca",
  });
}

export default function PartnershipPage() {
  return (
    <div className="container-page max-w-2xl py-8 md:py-12">
      <Breadcrumbs items={[{ name: pl.b2b.pageTitle, href: "/dla-profesjonalistow" }, { name: pl.b2b.formTitle, href: "/wspolpraca" }]} className="mb-4" />
      <h1>{pl.b2b.formTitle}</h1>
      <p className="mt-3 max-w-prose text-lg text-ink-600">{pl.b2b.formIntro}</p>
      <div className="mt-8">
        <PartnershipForm />
      </div>
    </div>
  );
}

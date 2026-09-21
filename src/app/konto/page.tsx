import type { Metadata } from "next";
import { pl } from "@/i18n/pl";
import { buildMetadata } from "@/lib/seo/metadata";

export function generateMetadata(): Metadata {
  return buildMetadata({ title: `${pl.account.title} | Aromatarius`, description: pl.account.comingSoon, path: "/konto", noindex: true });
}

/** Customer Account API (OAuth) : login + commandes en semaine 3 (docs/09). */
export default function AccountPage() {
  return (
    <div className="container-page max-w-xl py-12">
      <h1>{pl.account.title}</h1>
      <p className="mt-4 text-ink-600">{pl.account.comingSoon}</p>
    </div>
  );
}

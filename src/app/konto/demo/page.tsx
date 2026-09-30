import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pl } from "@/i18n/pl";
import { buildMetadata } from "@/lib/seo/metadata";
import { isMockMode } from "@/lib/shopify";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return buildMetadata({ title: `${pl.account.demoTitle} | Aromatarius`, description: pl.account.demoIntro, path: "/konto/demo", noindex: true });
}

/**
 * Remplace l'écran de connexion hébergé par Shopify tant qu'aucun store n'est
 * branché. Même forme de parcours : saisie d'un e-mail, puis retour sur le
 * callback avec un code. Cette page n'existe qu'en mode démo.
 */
export default async function DemoLoginPage({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  if (!isMockMode()) notFound();
  const { state = "" } = await searchParams;

  return (
    <div className="container-page max-w-md py-8 md:py-12">
      <h1>{pl.account.demoTitle}</h1>
      <p className="mt-2 text-ink-600">{pl.account.demoIntro}</p>

      <p className="mt-4 rounded-md border border-amber-500/50 bg-amber-500/10 p-3 text-sm" role="status">
        {pl.account.demoNotice}
      </p>

      <form action="/konto/demo/potwierdz" method="post" className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="state" value={state} />
        <div className="flex flex-col gap-1">
          <label htmlFor="demo-email" className="text-sm font-medium text-leaf-900">
            {pl.account.email}
          </label>
          <input
            id="demo-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="h-12 rounded-lg border border-sand-200 bg-card px-4 text-base text-ink-900 focus:border-leaf-500 focus:outline-none focus:ring-2 focus:ring-leaf-500/40"
          />
        </div>
        <Button type="submit" size="lg" className="h-12 bg-leaf-900 text-base hover:bg-leaf-700">
          {pl.account.login}
        </Button>
      </form>
    </div>
  );
}

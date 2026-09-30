import type { Metadata } from "next";
import Link from "next/link";
import { pl, t } from "@/i18n/pl";
import { buildMetadata } from "@/lib/seo/metadata";
import { getCurrentCustomer } from "@/lib/shopify";
import type { AuthErrorCode } from "@/lib/shopify/types";
import { LogoutButton } from "@/components/account/LogoutButton";

/** Session lue a chaque requete : jamais de page compte en cache. */
export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return buildMetadata({ title: `${pl.account.title} | Aromatarius`, description: pl.account.loginIntro, path: "/konto", noindex: true });
}

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ blad?: string }> }) {
  const [customer, sp] = await Promise.all([getCurrentCustomer(), searchParams]);
  const error = sp.blad && sp.blad in pl.account.errors ? (sp.blad as AuthErrorCode) : null;

  if (!customer) {
    return (
      <div className="container-page max-w-md py-8 md:py-12">
        <h1>{pl.account.loginTitle}</h1>
        <p className="mt-2 text-ink-600">{pl.account.loginIntro}</p>

        {error && (
          <p role="alert" className="mt-4 rounded-md border border-danger/40 bg-danger/5 px-3 py-2 text-sm text-danger">
            {pl.account.errors[error]}
          </p>
        )}

        {/* Lien et non bouton : le flux commence par une navigation vers Shopify. */}
        <Link
          href="/konto/logowanie"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-lg bg-leaf-900 px-6 text-base font-medium text-cream-50 hover:bg-leaf-700"
        >
          {pl.account.loginCta}
        </Link>
      </div>
    );
  }

  const name = customer.firstName ?? customer.email;
  return (
    <div className="container-page max-w-xl py-8 md:py-12">
      <h1>{t(pl.account.greeting, { name })}</h1>
      <p className="mt-2 text-ink-600">{t(pl.account.loggedInAs, { email: customer.email })}</p>

      <div className="mt-8 rounded-md border border-sand-200 bg-card p-6">
        <p className="text-ink-600">{pl.account.comingSoon}</p>
      </div>

      <div className="mt-6">
        <LogoutButton />
      </div>
    </div>
  );
}

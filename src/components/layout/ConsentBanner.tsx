"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { pl } from "@/i18n/pl";
import { applyConsent, getConsentSnapshot, subscribeConsent } from "@/lib/analytics/consent";
import { Button } from "@/components/ui/button";

/**
 * Bannière Consent Mode v2 (docs/08) : en bas d'écran, deux boutons égaux,
 * n'affecte pas le LCP. Le choix est stocké 6 mois en cookie.
 */
export function ConsentBanner() {
  // Serveur : pas de bannière (évite le flash) ; client : selon le cookie.
  const choice = useSyncExternalStore(subscribeConsent, getConsentSnapshot, () => "pending" as const);
  if (choice !== null) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="consent-title"
      aria-describedby="consent-text"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-sand-200 bg-card p-4 shadow-lg"
    >
      <div className="container-page flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <p id="consent-title" className="font-semibold">
            {pl.consent.title}
          </p>
          <p id="consent-text" className="text-sm text-ink-600">
            {pl.consent.text}{" "}
            <Link href="/polityka-prywatnosci" className="underline">
              {pl.consent.settings}
            </Link>
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="lg" className="h-11 flex-1 md:flex-none" onClick={() => applyConsent("essential")}>
            {pl.consent.essentialOnly}
          </Button>
          <Button type="button" size="lg" className="h-11 flex-1 bg-leaf-900 hover:bg-leaf-700 md:flex-none" onClick={() => applyConsent("all")}>
            {pl.consent.acceptAll}
          </Button>
        </div>
      </div>
    </div>
  );
}

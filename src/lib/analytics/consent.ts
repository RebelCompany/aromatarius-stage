/**
 * Consent Mode v2 (docs/08). Défaut "denied" avant tout script,
 * mise à jour au clic sur la bannière, propagation à Shopify Customer Privacy API.
 */

export const CONSENT_COOKIE = "aromatarius_consent";
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 180; // 6 mois

export type ConsentChoice = "all" | "essential";

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: Gtag;
    Shopify?: {
      customerPrivacy?: {
        setTrackingConsent: (consent: Record<string, boolean>, cb?: () => void) => void;
      };
    };
  }
}

/** Script inline à placer avant GTM : gtag('consent','default', ...) */
export const consentDefaultScript = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent','default',{
  ad_storage:'denied',
  ad_user_data:'denied',
  ad_personalization:'denied',
  analytics_storage:'denied',
  functionality_storage:'granted',
  security_storage:'granted',
  region:['PL'],
  wait_for_update: 500
});
(function(){
  var m = document.cookie.match(/(?:^|; )${CONSENT_COOKIE}=(all|essential)/);
  if (m && m[1] === 'all') {
    gtag('consent','update',{ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted',analytics_storage:'granted'});
  }
})();
`.trim();

export function readConsent(): ConsentChoice | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=(all|essential)`));
  return (m?.[1] as ConsentChoice | undefined) ?? null;
}

/* Store minimal pour useSyncExternalStore (bannière) */
const listeners = new Set<() => void>();
export function subscribeConsent(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function getConsentSnapshot(): ConsentChoice | "pending" | null {
  return readConsent();
}

export function applyConsent(choice: ConsentChoice): void {
  if (typeof window === "undefined") return;
  const granted = choice === "all";
  const state = granted ? "granted" : "denied";
  document.cookie = `${CONSENT_COOKIE}=${choice}; Max-Age=${CONSENT_MAX_AGE}; Path=/; SameSite=Lax${
    location.protocol === "https:" ? "; Secure" : ""
  }`;
  window.gtag?.("consent", "update", {
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
    analytics_storage: state,
  });
  window.Shopify?.customerPrivacy?.setTrackingConsent({
    analytics: granted,
    marketing: granted,
    preferences: true,
    sale_of_data: granted,
  });
  for (const l of listeners) l();
}

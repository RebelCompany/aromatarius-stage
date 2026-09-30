import "server-only";
import { shopifyConfig } from "./config";
import type { Customer } from "./types";

/**
 * Client Customer Account API (OAuth 2.0 + PKCE), decision de docs/03.
 *
 * Les endpoints ne sont jamais ecrits en dur : Shopify impose de les decouvrir
 * via /.well-known, ce qui evite de casser quand leur infrastructure evolue.
 */

type OpenIdConfig = {
  authorization_endpoint: string;
  token_endpoint: string;
  end_session_endpoint: string;
};

type ApiConfig = { graphql_api: string };

export type CustomerTokens = {
  accessToken: string;
  /** Necessaire pour la deconnexion : Shopify l'exige en id_token_hint. */
  idToken: string;
  refreshToken: string | null;
  /** ISO 8601. */
  expiresAt: string;
};

const DISCOVERY_TTL_MS = 60 * 60 * 1000;
let openIdCache: { value: OpenIdConfig; at: number } | null = null;
let apiCache: { value: ApiConfig; at: number } | null = null;

async function discover<T>(pathname: string, cache: { value: T; at: number } | null): Promise<{ value: T; at: number }> {
  if (cache && Date.now() - cache.at < DISCOVERY_TTL_MS) return cache;
  const res = await fetch(`https://${shopifyConfig.storeDomain}${pathname}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Discovery ${pathname} : ${res.status}`);
  return { value: (await res.json()) as T, at: Date.now() };
}

async function openIdConfig(): Promise<OpenIdConfig> {
  openIdCache = await discover<OpenIdConfig>("/.well-known/openid-configuration", openIdCache);
  return openIdCache.value;
}

async function apiConfig(): Promise<ApiConfig> {
  apiCache = await discover<ApiConfig>("/.well-known/customer-account-api", apiCache);
  return apiCache.value;
}

/* ---------- PKCE ---------- */

/** base64url sans remplissage : Shopify rejette le "=" avec invalid_grant. */
function base64url(bytes: ArrayBuffer): string {
  return Buffer.from(bytes).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function randomToken(bytes = 32): string {
  return base64url(crypto.getRandomValues(new Uint8Array(bytes)).buffer as ArrayBuffer);
}

export async function codeChallengeFor(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return base64url(digest);
}

/* ---------- Flux OAuth ---------- */

export async function buildAuthorizationUrl(params: {
  redirectUri: string;
  state: string;
  nonce: string;
  codeChallenge: string;
}): Promise<string> {
  const { authorization_endpoint } = await openIdConfig();
  const url = new URL(authorization_endpoint);
  url.searchParams.set("scope", "openid email customer-account-api:full");
  url.searchParams.set("client_id", shopifyConfig.customerAccountClientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("state", params.state);
  url.searchParams.set("nonce", params.nonce);
  url.searchParams.set("code_challenge", params.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  // Interface de connexion en polonais, comme le reste du site.
  url.searchParams.set("locale", "pl");
  return url.toString();
}

export async function exchangeCodeForTokens(params: {
  code: string;
  redirectUri: string;
  codeVerifier: string;
}): Promise<CustomerTokens> {
  const { token_endpoint } = await openIdConfig();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: shopifyConfig.customerAccountClientId,
    redirect_uri: params.redirectUri,
    code: params.code,
    code_verifier: params.codeVerifier,
  });

  const res = await fetch(token_endpoint, {
    method: "POST",
    // origin et user-agent sont exiges : sans eux Shopify renvoie 401 ou 403.
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      origin: shopifyConfig.siteOrigin,
      "user-agent": "Aromatarius/1.0",
    },
    body,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Token endpoint : ${res.status}`);

  const json = (await res.json()) as {
    access_token: string;
    id_token: string;
    refresh_token?: string;
    expires_in: number;
  };
  return {
    accessToken: json.access_token,
    idToken: json.id_token,
    refreshToken: json.refresh_token ?? null,
    expiresAt: new Date(Date.now() + json.expires_in * 1000).toISOString(),
  };
}

export async function buildLogoutUrl(idToken: string, postLogoutRedirectUri: string): Promise<string> {
  const { end_session_endpoint } = await openIdConfig();
  const url = new URL(end_session_endpoint);
  url.searchParams.set("id_token_hint", idToken);
  url.searchParams.set("post_logout_redirect_uri", postLogoutRedirectUri);
  return url.toString();
}

/* ---------- Requetes API ---------- */

const CUSTOMER_QUERY = /* GraphQL */ `
  query CurrentCustomer {
    customer {
      id
      firstName
      lastName
      emailAddress {
        emailAddress
      }
    }
  }
`;

export async function fetchCustomer(accessToken: string): Promise<Customer | null> {
  const { graphql_api } = await apiConfig();
  const res = await fetch(graphql_api, {
    method: "POST",
    headers: { "content-type": "application/json", Authorization: accessToken },
    body: JSON.stringify({ query: CUSTOMER_QUERY }),
    cache: "no-store",
  });
  if (!res.ok) return null;

  const json = (await res.json()) as {
    data?: {
      customer: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        emailAddress: { emailAddress: string } | null;
      } | null;
    };
  };
  const c = json.data?.customer;
  if (!c) return null;
  return {
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.emailAddress?.emailAddress ?? "",
  };
}

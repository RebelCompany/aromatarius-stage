import "server-only";
import { shopifyConfig } from "./config";

/**
 * Client Storefront API minimal (fetch + tags Next).
 * Décision "règle de sortie" de docs/03 : appels directs Storefront API,
 * interface identique pour les pages. Le SDK Hydrogen preview peut remplacer
 * l'intérieur de ce fichier sans toucher au reste.
 */

type GraphQLResponse<T> = {
  data?: T;
  errors?: { message: string; extensions?: unknown }[];
};

export class ShopifyError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly errors?: unknown,
  ) {
    super(message);
    this.name = "ShopifyError";
  }
}

export type FetchOptions = {
  tags?: string[];
  /** false = jamais caché (panier, recherche) */
  cache?: boolean;
  revalidate?: number;
};

export async function storefront<T, V extends Record<string, unknown> = Record<string, unknown>>(
  query: string,
  variables?: V,
  options: FetchOptions = {},
): Promise<T> {
  const { storeDomain, apiVersion, privateToken, publicToken } = shopifyConfig;
  const endpoint = `https://${storeDomain}/api/${apiVersion}/graphql.json`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (privateToken) headers["Shopify-Storefront-Private-Token"] = privateToken;
  else headers["X-Shopify-Storefront-Access-Token"] = publicToken;

  const cacheEnabled = options.cache ?? true;
  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
    ...(cacheEnabled
      ? {
          next: {
            tags: options.tags ?? [],
            revalidate: options.revalidate ?? shopifyConfig.revalidateSeconds,
          },
        }
      : { cache: "no-store" }),
  });

  if (!res.ok) {
    throw new ShopifyError(`Storefront API HTTP ${res.status}`, res.status);
  }
  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors?.length) {
    throw new ShopifyError(json.errors.map((e) => e.message).join("; "), res.status, json.errors);
  }
  if (!json.data) throw new ShopifyError("Storefront API: réponse vide");
  return json.data;
}

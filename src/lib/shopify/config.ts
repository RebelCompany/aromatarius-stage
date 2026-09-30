/**
 * Configuration de l'adapter. Mode "mock" automatique tant que les identifiants
 * Shopify ne sont pas renseignés (store Aromatarius pas encore créé).
 */
export const shopifyConfig = {
  storeDomain: process.env.SHOPIFY_STORE_DOMAIN ?? "",
  publicToken: process.env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN ?? "",
  privateToken: process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN ?? "",
  apiVersion: process.env.SHOPIFY_API_VERSION ?? "2026-07",
  revalidationSecret: process.env.SHOPIFY_REVALIDATION_SECRET ?? "",
  checkoutDomain: process.env.SHOPIFY_CHECKOUT_DOMAIN ?? "",
  /** Seuil de livraison gratuite en PLN, à fixer avec Bogusia (docs/06) */
  freeShippingThreshold: Number(process.env.FREE_SHIPPING_THRESHOLD ?? 150),
  /** Fallback ISR (secondes) quand le webhook ne passe pas */
  revalidateSeconds: 3600,
  cartCookie: "aromatarius_cart",
  cartCookieMaxAge: 60 * 60 * 24 * 30,
  customerAccountClientId: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID ?? "",
  /** Origine publique du site, exigee en en-tete par le token endpoint. */
  siteOrigin: process.env.SITE_URL ?? "http://localhost:3000",
  customerCookie: "aromatarius_customer",
  /** Plafond de duree du cookie de session, meme si Shopify annonce plus long. */
  customerCookieMaxAge: 60 * 60 * 24 * 14,
  /** Cookies courts du flux OAuth : state, nonce et verifieur PKCE. */
  oauthCookieMaxAge: 60 * 10,
} as const;

export function isMockMode(): boolean {
  if (process.env.SHOPIFY_MOCK === "1") return true;
  return !shopifyConfig.storeDomain || !(shopifyConfig.privateToken || shopifyConfig.publicToken);
}

export const cacheTags = {
  products: "products",
  collections: "collections",
  product: (handle: string) => `product:${handle}`,
  collection: (handle: string) => `collection:${handle}`,
  shop: "shop",
} as const;

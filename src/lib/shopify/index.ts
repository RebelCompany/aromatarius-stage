import "server-only";
import { cookies } from "next/headers";
import { isMockMode, shopifyConfig } from "./config";
import { safeReturnPath } from "./return-path";
import type { ShopifyProvider } from "./provider";
import type {
  AuthResult,
  Cart,
  Collection,
  CollectionFilters,
  CollectionProductsResult,
  Customer,
  Metaobject,
  CustomerSession,
  Product,
  ProductCardData,
  SearchResult,
  ShopInfo,
  SortKey,
} from "./types";

export type * from "./types";
export { isMockMode } from "./config";
export { safeReturnPath } from "./return-path";

/**
 * ADAPTER : unique point de contact avec Shopify (règle 1 de CLAUDE.md).
 * Les pages et composants n'importent que ce fichier.
 */

let providerPromise: Promise<ShopifyProvider> | null = null;
function provider(): Promise<ShopifyProvider> {
  if (!providerPromise) {
    providerPromise = isMockMode()
      ? import("./mock").then((m) => m.mockProvider)
      : import("./storefront").then((m) => m.storefrontProvider);
  }
  return providerPromise;
}

/* ---------- Catalogue ---------- */

export async function getProduct(handle: string): Promise<Product | null> {
  return (await provider()).getProduct(handle);
}

export async function getProductsByHandles(handles: string[]): Promise<ProductCardData[]> {
  return (await provider()).getProductsByHandles(handles);
}

export async function getAllProductHandles(): Promise<{ handle: string; updatedAt: string }[]> {
  return (await provider()).getAllProductHandles();
}

export async function getCollection(handle: string): Promise<Collection | null> {
  return (await provider()).getCollection(handle);
}

export async function getCollections(): Promise<Collection[]> {
  return (await provider()).getCollections();
}

export async function getCollectionProducts(
  handle: string,
  options: { page?: number; perPage?: number; sort?: SortKey; filters?: CollectionFilters } = {},
): Promise<CollectionProductsResult | null> {
  return (await provider()).getCollectionProducts(handle, {
    page: Math.max(1, options.page ?? 1),
    perPage: options.perPage ?? 24,
    sort: options.sort ?? "relevance",
    filters: options.filters ?? {},
  });
}

export async function searchProducts(query: string, limit = 24): Promise<SearchResult> {
  if (!query.trim()) return { products: [], collections: [] };
  return (await provider()).searchProducts(query.trim(), limit);
}

export async function getShopInfo(): Promise<ShopInfo> {
  return (await provider()).getShopInfo();
}

export async function getMetaobject(type: string, handle: string): Promise<Metaobject | null> {
  return (await provider()).getMetaobject(type, handle);
}

/** Receptury : MDX dans content/, l'adapter résout uniquement les produits liés. */
export async function getReceptury(slugs: string[]): Promise<ProductCardData[]> {
  return getProductsByHandles(slugs);
}

/* ---------- Panier (cookie httpOnly, jamais localStorage) ---------- */

async function readCartId(): Promise<string | null> {
  const store = await cookies();
  return store.get(shopifyConfig.cartCookie)?.value ?? null;
}

async function writeCartId(id: string): Promise<void> {
  const store = await cookies();
  store.set(shopifyConfig.cartCookie, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: shopifyConfig.cartCookieMaxAge,
  });
}

export async function getCart(): Promise<Cart | null> {
  const id = await readCartId();
  if (!id) return null;
  try {
    return await (await provider()).getCart(id);
  } catch {
    return null;
  }
}

export async function addToCart(lines: { merchandiseId: string; quantity: number }[]): Promise<Cart> {
  const p = await provider();
  const id = await readCartId();
  if (id) {
    try {
      const cart = await p.addCartLines(id, lines);
      if (cart.id !== id) await writeCartId(cart.id);
      return cart;
    } catch {
      // panier expiré ou invalide : on en recrée un
    }
  }
  const cart = await p.createCart(lines);
  await writeCartId(cart.id);
  return cart;
}

export async function updateCartLine(lineId: string, quantity: number): Promise<Cart | null> {
  const id = await readCartId();
  if (!id) return null;
  const p = await provider();
  const cart = quantity <= 0 ? await p.removeCartLines(id, [lineId]) : await p.updateCartLines(id, [{ id: lineId, quantity }]);
  if (cart.id !== id) await writeCartId(cart.id);
  return cart;
}

export async function removeCartLine(lineId: string): Promise<Cart | null> {
  const id = await readCartId();
  if (!id) return null;
  const cart = await (await provider()).removeCartLines(id, [lineId]);
  if (cart.id !== id) await writeCartId(cart.id);
  return cart;
}

/**
 * Ajoute un code promo au panier. Shopify (ou la table de demo) decide seul de
 * sa validite : un code refuse revient dans cart.discountCodes en applicable=false,
 * on le retire alors pour ne pas le trainer jusqu'au checkout.
 */
export async function applyDiscountCode(code: string): Promise<{ cart: Cart; applied: boolean } | null> {
  const id = await readCartId();
  if (!id) return null;
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;
  const p = await provider();
  const current = (await p.getCart(id))?.discountCodes.map((d) => d.code) ?? [];
  if (current.includes(normalized)) {
    const cart = await p.getCart(id);
    return cart ? { cart, applied: true } : null;
  }
  const cart = await p.updateCartDiscountCodes(id, [...current, normalized]);
  if (cart.id !== id) await writeCartId(cart.id);
  const applied = cart.discountCodes.some((d) => d.code === normalized && d.applicable);
  if (applied) return { cart, applied: true };
  // Code refuse : on remet la liste precedente pour laisser le panier propre.
  const reverted = await p.updateCartDiscountCodes(cart.id, current);
  if (reverted.id !== cart.id) await writeCartId(reverted.id);
  return { cart: reverted, applied: false };
}

/** Retire un code promo. Sans argument, retire tous les codes. */
export async function removeDiscountCode(code?: string): Promise<Cart | null> {
  const id = await readCartId();
  if (!id) return null;
  const p = await provider();
  const current = (await p.getCart(id))?.discountCodes.map((d) => d.code) ?? [];
  const normalized = code?.trim().toUpperCase();
  const next = normalized ? current.filter((c) => c !== normalized) : [];
  const cart = await p.updateCartDiscountCodes(id, next);
  if (cart.id !== id) await writeCartId(cart.id);
  return cart;
}

export async function getCheckoutUrl(): Promise<string | null> {
  const cart = await getCart();
  return cart?.checkoutUrl ?? null;
}

/* ---------- Compte client : OAuth (cookies httpOnly, jamais localStorage) ---------- */

const OAUTH_COOKIE = {
  state: "aromatarius_oauth_state",
  verifier: "aromatarius_oauth_verifier",
  back: "aromatarius_oauth_back",
} as const;

type StoredSession = { accessToken: string; idToken: string };

async function readSession(): Promise<StoredSession | null> {
  const store = await cookies();
  const raw = store.get(shopifyConfig.customerCookie)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as StoredSession;
  } catch {
    return null;
  }
}

async function writeSession(session: CustomerSession): Promise<void> {
  const store = await cookies();
  // Plus court des deux : l'expiration annoncee par Shopify ou notre plafond.
  const remaining = Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000);
  const maxAge = Math.max(0, Math.min(shopifyConfig.customerCookieMaxAge, Number.isFinite(remaining) ? remaining : 0));
  const payload: StoredSession = { accessToken: session.accessToken, idToken: session.idToken };
  store.set(shopifyConfig.customerCookie, Buffer.from(JSON.stringify(payload), "utf8").toString("base64url"), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
}

async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(shopifyConfig.customerCookie);
}

/** Prepare la redirection vers Shopify et memorise de quoi valider le retour. */
export async function beginLogin(redirectUri: string, returnTo: string | null): Promise<string> {
  const { url, state, codeVerifier } = await (await provider()).startAuthorization(redirectUri);
  const store = await cookies();
  const options = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: shopifyConfig.oauthCookieMaxAge,
  };
  store.set(OAUTH_COOKIE.state, state, options);
  store.set(OAUTH_COOKIE.verifier, codeVerifier, options);
  store.set(OAUTH_COOKIE.back, safeReturnPath(returnTo), options);
  return url;
}

/**
 * Retour de Shopify : valide l'etat, echange le code, ouvre la session et
 * rattache le panier au compte. Renvoie la page de destination.
 */
export async function completeLogin(params: {
  code: string | null;
  state: string | null;
  redirectUri: string;
}): Promise<AuthResult<{ customer: Customer; returnTo: string }>> {
  const store = await cookies();
  const expectedState = store.get(OAUTH_COOKIE.state)?.value ?? null;
  const codeVerifier = store.get(OAUTH_COOKIE.verifier)?.value ?? null;
  const returnTo = safeReturnPath(store.get(OAUTH_COOKIE.back)?.value);

  store.delete(OAUTH_COOKIE.state);
  store.delete(OAUTH_COOKIE.verifier);
  store.delete(OAUTH_COOKIE.back);

  if (!params.code) return { ok: false, code: "ACCESS_DENIED" };
  // L'etat lie la redirection a ce navigateur : c'est la protection CSRF du flux.
  if (!expectedState || !codeVerifier || params.state !== expectedState) return { ok: false, code: "STATE_MISMATCH" };

  const p = await provider();
  const session = await p.completeAuthorization({ code: params.code, redirectUri: params.redirectUri, codeVerifier });
  if (!session.ok) return session;

  await writeSession(session.data);
  const customer = await p.getCustomer(session.data.accessToken);
  if (!customer) return { ok: false, code: "EXCHANGE_FAILED" };

  await attachCartToCustomer(session.data.accessToken);
  return { ok: true, data: { customer, returnTo } };
}

/**
 * Rattache le panier anonyme au compte. Le panier n'est pas recree : c'est ce
 * qui evite de perdre les lignes a la connexion, et ce qui pre-remplit le
 * checkout (docs/03, "buyer identity : email si connecte").
 */
async function attachCartToCustomer(accessToken: string | null): Promise<void> {
  const cartId = await readCartId();
  if (!cartId) return;
  try {
    const cart = await (await provider()).updateCartBuyerIdentity(cartId, accessToken);
    if (cart.id !== cartId) await writeCartId(cart.id);
  } catch {
    // Un panier expire ne doit pas faire echouer la connexion.
  }
}

/** Efface la session locale et renvoie l'URL de deconnexion Shopify, si besoin. */
export async function beginLogout(postLogoutRedirectUri: string): Promise<string | null> {
  const session = await readSession();
  await clearSession();
  await attachCartToCustomer(null);
  if (!session) return null;
  try {
    return await (await provider()).buildLogoutUrl(session.idToken, postLogoutRedirectUri);
  } catch {
    return null;
  }
}

/** Client connecte, ou null. Le cookie est nettoye si le jeton a expire. */
export async function getCurrentCustomer(): Promise<Customer | null> {
  const session = await readSession();
  if (!session) return null;
  try {
    const customer = await (await provider()).getCustomer(session.accessToken);
    if (!customer) await clearSession();
    return customer;
  } catch {
    return null;
  }
}

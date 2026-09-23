import "server-only";
import { cookies } from "next/headers";
import { isMockMode, shopifyConfig } from "./config";
import type { ShopifyProvider } from "./provider";
import type {
  Cart,
  Collection,
  CollectionFilters,
  CollectionProductsResult,
  Metaobject,
  Product,
  ProductCardData,
  SearchResult,
  ShopInfo,
  SortKey,
} from "./types";

export type * from "./types";
export { isMockMode } from "./config";

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

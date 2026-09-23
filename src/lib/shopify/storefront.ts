import "server-only";
import { storefront } from "./client";
import { cacheTags, shopifyConfig } from "./config";
import {
  mapCart,
  mapCollection,
  mapProduct,
  mapProductCard,
  type RawCart,
  type RawCollection,
  type RawProduct,
  type RawProductCard,
} from "./mappers";
import type { ShopifyProvider } from "./provider";
import * as q from "./queries";
import type { Cart, CollectionFilters, SortKey } from "./types";

const sortMap: Record<SortKey, { sortKey: string; reverse: boolean }> = {
  relevance: { sortKey: "BEST_SELLING", reverse: false },
  priceAsc: { sortKey: "PRICE", reverse: false },
  priceDesc: { sortKey: "PRICE", reverse: true },
  newest: { sortKey: "CREATED", reverse: true },
  nameAsc: { sortKey: "TITLE", reverse: false },
};

function buildFilters(filters: CollectionFilters): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];
  if (filters.bio) out.push({ tag: "bio" });
  for (const p of filters.potrzeba ?? []) out.push({ tag: `potrzeba:${p}` });
  for (const z of filters.zapach ?? []) out.push({ tag: `zapach:${z}` });
  for (const u of filters.uzycie ?? []) out.push({ tag: `uzycie:${u}` });
  for (const b of filters.bezpieczny ?? []) out.push({ tag: `bezpieczny:${b}` });
  for (const ml of filters.ml ?? []) out.push({ variantOption: { name: "Pojemność", value: `${ml} ml` } });
  if (filters.priceMin != null || filters.priceMax != null) {
    out.push({ price: { min: filters.priceMin ?? 0, max: filters.priceMax ?? 100000 } });
  }
  return out;
}

function assertNoUserErrors(errors: { message: string }[] | undefined, context: string) {
  if (errors?.length) throw new Error(`${context}: ${errors.map((e) => e.message).join(", ")}`);
}

function withCheckoutDomain(cart: Cart): Cart {
  if (!shopifyConfig.checkoutDomain) return cart;
  try {
    const url = new URL(cart.checkoutUrl);
    url.host = shopifyConfig.checkoutDomain;
    return { ...cart, checkoutUrl: url.toString() };
  } catch {
    return cart;
  }
}

export const storefrontProvider: ShopifyProvider = {
  async getProduct(handle) {
    const data = await storefront<{ product: RawProduct | null }>(
      q.GET_PRODUCT_QUERY,
      { handle },
      { tags: [cacheTags.products, cacheTags.product(handle)] },
    );
    return data.product ? mapProduct(data.product) : null;
  },

  async getProductsByHandles(handles) {
    if (!handles.length) return [];
    const query = handles.map((h) => `handle:${h}`).join(" OR ");
    const data = await storefront<{ products: { nodes: RawProductCard[] } }>(
      q.GET_PRODUCTS_BY_HANDLES_QUERY,
      { query, first: handles.length },
      { tags: [cacheTags.products, ...handles.map(cacheTags.product)] },
    );
    const byHandle = new Map(data.products.nodes.map((p) => [p.handle, mapProductCard(p)]));
    return handles.map((h) => byHandle.get(h)).filter((p): p is NonNullable<typeof p> => !!p);
  },

  async getAllProductHandles() {
    const all: { handle: string; updatedAt: string }[] = [];
    let cursor: string | null = null;
    do {
      const data: {
        products: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: { handle: string; updatedAt: string }[] };
      } = await storefront(q.GET_ALL_PRODUCT_HANDLES_QUERY, { cursor }, { tags: [cacheTags.products] });
      all.push(...data.products.nodes);
      cursor = data.products.pageInfo.hasNextPage ? data.products.pageInfo.endCursor : null;
    } while (cursor);
    return all;
  },

  async getCollection(handle) {
    const data = await storefront<{ collection: RawCollection | null }>(
      q.GET_COLLECTION_QUERY,
      { handle },
      { tags: [cacheTags.collections, cacheTags.collection(handle)] },
    );
    return data.collection ? mapCollection(data.collection) : null;
  },

  async getCollections() {
    const data = await storefront<{ collections: { nodes: RawCollection[] } }>(
      q.GET_COLLECTIONS_QUERY,
      {},
      { tags: [cacheTags.collections] },
    );
    return data.collections.nodes.map(mapCollection);
  },

  async getCollectionProducts(handle, { page, perPage, sort, filters }) {
    // Storefront API pagine par curseur : on parcourt jusqu'à la page demandée
    // (catalogue < 300 références, coût négligeable, mis en cache par tags).
    const { sortKey, reverse } = sortMap[sort];
    const gqlFilters = buildFilters(filters);
    let cursor: string | null = null;
    let currentPage = 1;
    let nodes: RawProductCard[] = [];
    let hasNext = false;
    // Récupération large pour connaître le total (jusqu'à 250 par requête)
    const collected: RawProductCard[] = [];
    do {
      const data: {
        collection: {
          products: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: RawProductCard[] };
        } | null;
      } = await storefront(
        q.GET_COLLECTION_PRODUCTS_QUERY,
        { handle, first: 250, after: cursor, sortKey, reverse, filters: gqlFilters },
        { tags: [cacheTags.products, cacheTags.collections, cacheTags.collection(handle)] },
      );
      if (!data.collection) return null;
      collected.push(...data.collection.products.nodes);
      hasNext = data.collection.products.pageInfo.hasNextPage;
      cursor = data.collection.products.pageInfo.endCursor;
      currentPage++;
    } while (hasNext && currentPage < 5);
    const total = collected.length;
    const start = (page - 1) * perPage;
    nodes = collected.slice(start, start + perPage);
    return {
      products: nodes.map(mapProductCard),
      total,
      page,
      perPage,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
    };
  },

  async searchProducts(query, limit) {
    const data = await storefront<{
      search: { nodes: RawProductCard[] };
      predictiveSearch: { collections: { handle: string; title: string }[] } | null;
    }>(q.SEARCH_QUERY, { query, first: limit }, { cache: false });
    return {
      products: data.search.nodes.filter((n) => n.handle).map(mapProductCard),
      collections: data.predictiveSearch?.collections ?? [],
    };
  },

  async getShopInfo() {
    const data = await storefront<{
      shop: {
        name: string;
        description: string | null;
        primaryDomain: { host: string };
        freeShipping: { value: string } | null;
      };
    }>(q.GET_SHOP_QUERY, {}, { tags: [cacheTags.shop] });
    // Le metafield money est dans la devise du store : ignoré tant que le store n'est pas en PLN
    let threshold = shopifyConfig.freeShippingThreshold;
    if (data.shop.freeShipping) {
      try {
        const parsed = JSON.parse(data.shop.freeShipping.value) as { amount: string; currency_code?: string };
        if (parsed.currency_code === "PLN") threshold = Number(parsed.amount);
      } catch {
        // valeur invalide : fallback config
      }
    }
    return {
      name: data.shop.name,
      description: data.shop.description ?? "",
      primaryDomain: data.shop.primaryDomain.host,
      freeShippingThreshold: { amount: threshold, currencyCode: "PLN" },
    };
  },

  async getMetaobject(type, handle) {
    const data = await storefront<{
      metaobject: { id: string; type: string; handle: string; fields: { key: string; value: string | null }[] } | null;
    }>(q.GET_METAOBJECT_QUERY, { handle: { type, handle } }, { tags: [cacheTags.shop] });
    if (!data.metaobject) return null;
    return {
      id: data.metaobject.id,
      type: data.metaobject.type,
      handle: data.metaobject.handle,
      fields: Object.fromEntries(data.metaobject.fields.map((f) => [f.key, f.value])),
    };
  },

  async createCart(lines) {
    const data = await storefront<{ cartCreate: { cart: RawCart; userErrors: { message: string }[] } }>(
      q.CART_CREATE_MUTATION,
      {
        input: {
          lines,
          buyerIdentity: { countryCode: "PL" },
        },
      },
      { cache: false },
    );
    assertNoUserErrors(data.cartCreate.userErrors, "cartCreate");
    return withCheckoutDomain(mapCart(data.cartCreate.cart));
  },

  async getCart(cartId) {
    const data = await storefront<{ cart: RawCart | null }>(q.CART_QUERY, { id: cartId }, { cache: false });
    return data.cart ? withCheckoutDomain(mapCart(data.cart)) : null;
  },

  async addCartLines(cartId, lines) {
    const data = await storefront<{ cartLinesAdd: { cart: RawCart; userErrors: { message: string }[] } }>(
      q.CART_LINES_ADD_MUTATION,
      { cartId, lines },
      { cache: false },
    );
    assertNoUserErrors(data.cartLinesAdd.userErrors, "cartLinesAdd");
    return withCheckoutDomain(mapCart(data.cartLinesAdd.cart));
  },

  async updateCartLines(cartId, lines) {
    const data = await storefront<{ cartLinesUpdate: { cart: RawCart; userErrors: { message: string }[] } }>(
      q.CART_LINES_UPDATE_MUTATION,
      { cartId, lines },
      { cache: false },
    );
    assertNoUserErrors(data.cartLinesUpdate.userErrors, "cartLinesUpdate");
    return withCheckoutDomain(mapCart(data.cartLinesUpdate.cart));
  },

  async removeCartLines(cartId, lineIds) {
    const data = await storefront<{ cartLinesRemove: { cart: RawCart; userErrors: { message: string }[] } }>(
      q.CART_LINES_REMOVE_MUTATION,
      { cartId, lineIds },
      { cache: false },
    );
    assertNoUserErrors(data.cartLinesRemove.userErrors, "cartLinesRemove");
    return withCheckoutDomain(mapCart(data.cartLinesRemove.cart));
  },

  async updateCartDiscountCodes(cartId, codes) {
    const data = await storefront<{ cartDiscountCodesUpdate: { cart: RawCart; userErrors: { message: string }[] } }>(
      q.CART_DISCOUNT_CODES_UPDATE_MUTATION,
      { cartId, discountCodes: codes },
      { cache: false },
    );
    // Un code inconnu ne remonte pas en userErrors : Shopify le renvoie dans
    // cart.discountCodes avec applicable=false. C'est l'appelant qui tranche.
    assertNoUserErrors(data.cartDiscountCodesUpdate.userErrors, "cartDiscountCodesUpdate");
    return withCheckoutDomain(mapCart(data.cartDiscountCodesUpdate.cart));
  },
};

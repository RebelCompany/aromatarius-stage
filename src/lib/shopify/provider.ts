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

/**
 * Interface interne de l'adapter. Deux implémentations :
 * - storefront.ts : Shopify Storefront API (prod)
 * - mock.ts : données de démo (dev sans store)
 */
export interface ShopifyProvider {
  getProduct(handle: string): Promise<Product | null>;
  getProductsByHandles(handles: string[]): Promise<ProductCardData[]>;
  getAllProductHandles(): Promise<{ handle: string; updatedAt: string }[]>;
  getCollection(handle: string): Promise<Collection | null>;
  getCollections(): Promise<Collection[]>;
  getCollectionProducts(
    handle: string,
    options: { page: number; perPage: number; sort: SortKey; filters: CollectionFilters },
  ): Promise<CollectionProductsResult | null>;
  searchProducts(query: string, limit: number): Promise<SearchResult>;
  getShopInfo(): Promise<ShopInfo>;
  getMetaobject(type: string, handle: string): Promise<Metaobject | null>;

  createCart(lines: { merchandiseId: string; quantity: number }[]): Promise<Cart>;
  getCart(cartId: string): Promise<Cart | null>;
  addCartLines(cartId: string, lines: { merchandiseId: string; quantity: number }[]): Promise<Cart>;
  updateCartLines(cartId: string, lines: { id: string; quantity: number }[]): Promise<Cart>;
  removeCartLines(cartId: string, lineIds: string[]): Promise<Cart>;
}

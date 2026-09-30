import type { PartnershipInput } from "@/lib/b2b";
import type { LeadResultCode } from "./admin";
import type {
  AuthResult,
  AuthorizationRequest,
  Cart,
  Collection,
  CollectionFilters,
  CollectionProductsResult,
  Metaobject,
  Customer,
  CustomerSession,
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
  /** Remplace la liste des codes promo du panier (liste vide = tout retirer). */
  updateCartDiscountCodes(cartId: string, codes: string[]): Promise<Cart>;

  /**
   * Rattache le panier au client, ou le detache avec null. C'est ce qui
   * pre-remplit le checkout et lie la commande au compte (docs/03).
   */
  updateCartBuyerIdentity(cartId: string, customerAccessToken: string | null): Promise<Cart>;

  /* ---- Compte client : OAuth Customer Account API ---- */

  /** Prepare la redirection vers Shopify. state, nonce et verifieur a stocker. */
  startAuthorization(redirectUri: string): Promise<AuthorizationRequest>;
  /** Echange le code recu au retour contre une session. */
  completeAuthorization(params: { code: string; redirectUri: string; codeVerifier: string }): Promise<AuthResult<CustomerSession>>;
  /** URL de deconnexion Shopify, ou null si le flux ne l'exige pas (demo). */
  buildLogoutUrl(idToken: string, postLogoutRedirectUri: string): Promise<string | null>;
  getCustomer(accessToken: string): Promise<Customer | null>;

  /**
   * Enregistre une demande de partenariat. Le contact est cree avec le tag
   * "b2b-pending", ce qui permet a la proprietaire de les filtrer dans l'admin.
   */
  createPartnerLead(input: PartnershipInput): Promise<LeadResultCode>;
}

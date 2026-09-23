/**
 * Types métier de l'adapter Shopify.
 * Seuls ces types sortent de src/lib/shopify/. Jamais les types bruts Storefront API.
 */

export type Money = { amount: number; currencyCode: "PLN" };

export type ProductImage = {
  url: string;
  alt: string;
  width: number;
  height: number;
};

export type SelectedOption = { name: string; value: string };

export type ProductVariant = {
  id: string;
  title: string;
  sku: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  price: Money;
  compareAtPrice: Money | null;
  /** Contenance en ml extraite de l'option "Pojemność" */
  volumeMl: number | null;
  selectedOptions: SelectedOption[];
  image: ProductImage | null;
};

export type ProductOption = { name: string; values: string[] };

export type Component = { nazwa: string; procent: number };
export type Dosage = { metoda: string; dawka: string };
export type Faq = { pytanie: string; odpowiedzHtml: string };

/** Metafields namespace `aromatarius` (docs/06) */
export type ProductMeta = {
  nazwaLacinska: string | null;
  rodzinaBotaniczna: string | null;
  czescRosliny: string | null;
  metodaEkstrakcji: string | null;
  chemotyp: string | null;
  pochodzenie: string | null;
  certyfikatBio: string | null;
  analizaPdf: { url: string; filename: string } | null;
  numerPartii: string | null;
  glowneSkladniki: Component[];
  naCo: string[];
  zapachOpis: string | null;
  wlasciwosciHtml: string | null;
  jakStosowacHtml: string | null;
  dawkowanie: Dosage[];
  bezpieczenstwoHtml: string | null;
  wplywEmocjonalnyHtml: string | null;
  faq: Faq[];
  recepturySlugs: string[];
  kompendiumSlug: string | null;
  pasujeDo: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  najnizszaCena30: Money | null;
};

export type ProductType =
  | "Olejek eteryczny"
  | "Hydrolat"
  | "Olej roślinny"
  | "Mieszanka"
  | "Zestaw"
  | "Dyfuzor"
  | "Akcesorium";

export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  productType: ProductType | string;
  vendor: string;
  tags: string[];
  images: ProductImage[];
  featuredImage: ProductImage | null;
  options: ProductOption[];
  variants: ProductVariant[];
  priceRange: { min: Money; max: Money };
  availableForSale: boolean;
  updatedAt: string;
  meta: ProductMeta;
};

/** Version allégée pour les grilles (ProductCard) */
export type ProductCardData = Pick<
  Product,
  | "id"
  | "handle"
  | "title"
  | "productType"
  | "tags"
  | "featuredImage"
  | "priceRange"
  | "availableForSale"
> & {
  nazwaLacinska: string | null;
  isBio: boolean;
  chemotyp: string | null;
  defaultVariantId: string;
  rating: { value: number; count: number } | null;
  /** Au moins une variante a un prix barre : le produit est dans la collection promocje. */
  onPromo: boolean;
};

export type CollectionMeta = {
  introHtml: string | null;
  seoTextHtml: string | null;
  faq: Faq[];
  ikona: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type Collection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: ProductImage | null;
  updatedAt: string;
  meta: CollectionMeta;
};

export type SortKey = "relevance" | "priceAsc" | "priceDesc" | "newest" | "nameAsc";

export type CollectionFilters = {
  bio?: boolean;
  potrzeba?: string[];
  zapach?: string[];
  uzycie?: string[];
  bezpieczny?: string[];
  ml?: number[];
  priceMin?: number;
  priceMax?: number;
};

export type CollectionProductsResult = {
  products: ProductCardData[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export type CartLine = {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    sku: string;
    volumeMl: number | null;
    price: Money;
    product: { handle: string; title: string; featuredImage: ProductImage | null };
  };
  cost: { total: Money };
};

/** Code promo du panier. applicable=false : code refuse (inconnu, expire, conditions non remplies). */
export type CartDiscountCode = { code: string; applicable: boolean };
export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: CartLine[];
  discountCodes: CartDiscountCode[];
  /** Total des remises, toujours positif. 0 si aucun code actif. */
  discountTotal: Money;
  cost: { subtotal: Money; total: Money };
};

export type SearchResult = {
  products: ProductCardData[];
  collections: Pick<Collection, "handle" | "title">[];
};

export type ShopInfo = {
  name: string;
  description: string;
  primaryDomain: string;
  /** Seuil de livraison gratuite (PLN) : metafield shop ou valeur par défaut */
  freeShippingThreshold: Money;
};

export type Metaobject = {
  id: string;
  type: string;
  handle: string;
  fields: Record<string, string | null>;
};

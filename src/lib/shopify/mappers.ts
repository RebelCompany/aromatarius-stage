import type {
  Cart,
  CartLine,
  Collection,
  Component,
  Dosage,
  Faq,
  Money,
  Product,
  ProductCardData,
  ProductImage,
  ProductMeta,
  ProductVariant,
} from "./types";

/* ---------- Types bruts (sous-ensemble Storefront API) ---------- */

type RawMoney = { amount: string; currencyCode: string };
type RawImage = { url: string; altText: string | null; width: number; height: number } | null;
type RawMetafield = {
  key: string;
  type: string;
  value: string;
  reference?: { url?: string; image?: { url: string } } | null;
  references?: {
    nodes: ({ handle?: string; fields?: { key: string; value: string }[] } | null)[];
  } | null;
} | null;

export type RawProductCard = {
  id: string;
  handle: string;
  title: string;
  productType: string;
  tags: string[];
  availableForSale: boolean;
  updatedAt: string;
  featuredImage: RawImage;
  priceRange: { minVariantPrice: RawMoney; maxVariantPrice: RawMoney };
  variants: { nodes: { id: string }[] };
  nazwaLacinska: { value: string } | null;
  chemotyp: { value: string } | null;
};

export type RawProduct = Omit<RawProductCard, "variants" | "nazwaLacinska" | "chemotyp"> & {
  description: string;
  descriptionHtml: string;
  vendor: string;
  seo: { title: string | null; description: string | null };
  images: { nodes: NonNullable<RawImage>[] };
  options: { name: string; values: string[] }[];
  variants: {
    nodes: {
      id: string;
      title: string;
      sku: string | null;
      availableForSale: boolean;
      /** Nécessite le scope unauthenticated_read_product_inventory (non activé sur le canal Headless) */
      quantityAvailable?: number | null;
      price: RawMoney;
      compareAtPrice: RawMoney | null;
      selectedOptions: { name: string; value: string }[];
      image: RawImage;
    }[];
  };
  metafields: RawMetafield[];
};

export type RawCollection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  updatedAt: string;
  image: RawImage;
  seo: { title: string | null; description: string | null };
  intro: { value: string } | null;
  seoText: { value: string } | null;
  seoTitle: { value: string } | null;
  seoDescription: { value: string } | null;
  ikona: { reference: { image?: { url: string } } | null } | null;
  faq: { references: { nodes: ({ fields: { key: string; value: string }[] } | null)[] } | null } | null;
};

export type RawCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { subtotalAmount: RawMoney; totalAmount: RawMoney };
  lines: {
    nodes: {
      id: string;
      quantity: number;
      cost: { totalAmount: RawMoney };
      merchandise: {
        id: string;
        title: string;
        sku: string | null;
        price: RawMoney;
        selectedOptions: { name: string; value: string }[];
        product: { handle: string; title: string; featuredImage: RawImage };
      };
    }[];
  };
};

/* ---------- Helpers ---------- */

export function toMoney(raw: RawMoney | null | undefined): Money {
  return { amount: raw ? Number(raw.amount) : 0, currencyCode: "PLN" };
}

export function toImage(raw: RawImage, fallbackAlt = ""): ProductImage | null {
  if (!raw) return null;
  return {
    url: raw.url,
    alt: raw.altText ?? fallbackAlt,
    width: raw.width || 1200,
    height: raw.height || 1200,
  };
}

/** "10 ml" -> 10 */
export function parseVolumeMl(value: string | null | undefined): number | null {
  if (!value) return null;
  const match = value.replace(",", ".").match(/([\d.]+)\s*ml/i);
  return match ? Number(match[1]) : null;
}

/** Rich text Shopify (JSON) -> HTML simple. Retourne la valeur telle quelle si déjà HTML. */
export function richTextToHtml(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.trim().startsWith("{")) return value;
  try {
    const doc = JSON.parse(value) as RichNode;
    return renderRich(doc);
  } catch {
    return value;
  }
}

type RichNode = {
  type: string;
  value?: string;
  url?: string;
  level?: number;
  listType?: "ordered" | "unordered";
  bold?: boolean;
  italic?: boolean;
  children?: RichNode[];
};

function renderRich(node: RichNode): string {
  const children = (node.children ?? []).map(renderRich).join("");
  switch (node.type) {
    case "root":
      return children;
    case "paragraph":
      return `<p>${children}</p>`;
    case "heading":
      return `<h${node.level ?? 3}>${children}</h${node.level ?? 3}>`;
    case "list":
      return node.listType === "ordered" ? `<ol>${children}</ol>` : `<ul>${children}</ul>`;
    case "list-item":
      return `<li>${children}</li>`;
    case "link":
      return `<a href="${node.url ?? "#"}">${children}</a>`;
    case "text": {
      let text = escapeHtml(node.value ?? "");
      if (node.bold) text = `<strong>${text}</strong>`;
      if (node.italic) text = `<em>${text}</em>`;
      return text;
    }
    default:
      return children;
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function faqFromMetaobjects(
  nodes: ({ fields?: { key: string; value: string }[] } | null)[] | undefined,
): Faq[] {
  return (nodes ?? [])
    .filter((n): n is { fields: { key: string; value: string }[] } => !!n?.fields)
    .map((n) => {
      const get = (k: string) => n.fields.find((f) => f.key === k)?.value ?? "";
      return { pytanie: get("pytanie"), odpowiedzHtml: richTextToHtml(get("odpowiedz")) ?? "" };
    })
    .filter((f) => f.pytanie);
}

export const emptyMeta: ProductMeta = {
  nazwaLacinska: null,
  rodzinaBotaniczna: null,
  czescRosliny: null,
  metodaEkstrakcji: null,
  chemotyp: null,
  pochodzenie: null,
  certyfikatBio: null,
  analizaPdf: null,
  numerPartii: null,
  glowneSkladniki: [],
  naCo: [],
  zapachOpis: null,
  wlasciwosciHtml: null,
  jakStosowacHtml: null,
  dawkowanie: [],
  bezpieczenstwoHtml: null,
  wplywEmocjonalnyHtml: null,
  faq: [],
  recepturySlugs: [],
  kompendiumSlug: null,
  pasujeDo: [],
  seoTitle: null,
  seoDescription: null,
  najnizszaCena30: null,
};

function mapMeta(metafields: RawMetafield[]): ProductMeta {
  const byKey = new Map<string, NonNullable<RawMetafield>>();
  for (const m of metafields) if (m) byKey.set(m.key, m);
  const str = (k: string) => byKey.get(k)?.value ?? null;
  const list = (k: string) => parseJson<string[]>(byKey.get(k)?.value, []);

  const pdf = byKey.get("analiza_pdf");
  const pdfUrl = pdf?.reference?.url ?? null;
  const money = byKey.get("najnizsza_cena_30");
  const moneyParsed = parseJson<{ amount: string } | null>(money?.value, null);

  return {
    nazwaLacinska: str("nazwa_lacinska"),
    rodzinaBotaniczna: str("rodzina_botaniczna"),
    czescRosliny: str("czesc_rosliny"),
    metodaEkstrakcji: str("metoda_ekstrakcji"),
    chemotyp: str("chemotyp"),
    pochodzenie: str("pochodzenie"),
    certyfikatBio: str("certyfikat_bio"),
    analizaPdf: pdfUrl ? { url: pdfUrl, filename: pdfUrl.split("/").pop() ?? "analiza.pdf" } : null,
    numerPartii: str("numer_partii"),
    glowneSkladniki: parseJson<Component[]>(byKey.get("glowne_skladniki")?.value, []),
    naCo: list("na_co"),
    zapachOpis: str("zapach_opis"),
    wlasciwosciHtml: richTextToHtml(str("wlasciwosci")),
    jakStosowacHtml: richTextToHtml(str("jak_stosowac")),
    dawkowanie: parseJson<Dosage[]>(byKey.get("dawkowanie")?.value, []),
    bezpieczenstwoHtml: richTextToHtml(str("bezpieczenstwo")),
    wplywEmocjonalnyHtml: richTextToHtml(str("wplyw_emocjonalny")),
    faq: faqFromMetaobjects(byKey.get("faq")?.references?.nodes),
    recepturySlugs: list("receptury_slugs"),
    kompendiumSlug: str("kompendium_slug"),
    pasujeDo: (byKey.get("pasuje_do")?.references?.nodes ?? [])
      .map((n) => n?.handle)
      .filter((h): h is string => !!h),
    seoTitle: str("seo_title"),
    seoDescription: str("seo_description"),
    najnizszaCena30: moneyParsed ? { amount: Number(moneyParsed.amount), currencyCode: "PLN" } : null,
  };
}

/* ---------- Mappers publics ---------- */

export function mapProductCard(raw: RawProductCard): ProductCardData {
  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    productType: raw.productType,
    tags: raw.tags,
    featuredImage: toImage(raw.featuredImage, raw.title),
    priceRange: { min: toMoney(raw.priceRange.minVariantPrice), max: toMoney(raw.priceRange.maxVariantPrice) },
    availableForSale: raw.availableForSale,
    nazwaLacinska: raw.nazwaLacinska?.value ?? null,
    isBio: raw.tags.includes("bio"),
    chemotyp: raw.chemotyp?.value ?? null,
    defaultVariantId: raw.variants.nodes[0]?.id ?? "",
    rating: null,
  };
}

export function mapProduct(raw: RawProduct): Product {
  const variants: ProductVariant[] = raw.variants.nodes.map((v) => {
    const option = v.selectedOptions.find((o) => /pojemno/i.test(o.name)) ?? v.selectedOptions[0];
    return {
      id: v.id,
      title: v.title,
      sku: v.sku ?? "",
      availableForSale: v.availableForSale,
      quantityAvailable: v.quantityAvailable ?? null,
      price: toMoney(v.price),
      compareAtPrice: v.compareAtPrice ? toMoney(v.compareAtPrice) : null,
      volumeMl: parseVolumeMl(option?.value),
      selectedOptions: v.selectedOptions,
      image: toImage(v.image, raw.title),
    };
  });
  const meta = mapMeta(raw.metafields);
  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    description: raw.description,
    descriptionHtml: raw.descriptionHtml,
    productType: raw.productType,
    vendor: raw.vendor,
    tags: raw.tags,
    images: raw.images.nodes.map((i) => toImage(i, raw.title)!).filter(Boolean),
    featuredImage: toImage(raw.featuredImage, raw.title),
    options: raw.options,
    variants,
    priceRange: { min: toMoney(raw.priceRange.minVariantPrice), max: toMoney(raw.priceRange.maxVariantPrice) },
    availableForSale: raw.availableForSale,
    updatedAt: raw.updatedAt,
    meta: {
      ...meta,
      seoTitle: meta.seoTitle ?? raw.seo.title,
      seoDescription: meta.seoDescription ?? raw.seo.description,
    },
  };
}

export function productToCard(p: Product): ProductCardData {
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    productType: p.productType,
    tags: p.tags,
    featuredImage: p.featuredImage,
    priceRange: p.priceRange,
    availableForSale: p.availableForSale,
    nazwaLacinska: p.meta.nazwaLacinska,
    isBio: p.tags.includes("bio"),
    chemotyp: p.meta.chemotyp,
    defaultVariantId: p.variants[0]?.id ?? "",
    rating: null,
  };
}

export function mapCollection(raw: RawCollection): Collection {
  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    description: raw.description,
    image: toImage(raw.image, raw.title),
    updatedAt: raw.updatedAt,
    meta: {
      introHtml: richTextToHtml(raw.intro?.value),
      seoTextHtml: richTextToHtml(raw.seoText?.value),
      faq: faqFromMetaobjects(raw.faq?.references?.nodes),
      ikona: raw.ikona?.reference?.image?.url ?? null,
      seoTitle: raw.seoTitle?.value ?? raw.seo.title,
      seoDescription: raw.seoDescription?.value ?? raw.seo.description,
    },
  };
}

export function mapCart(raw: RawCart): Cart {
  // Shopify laisse à 0 les lignes invendables dans le contexte acheteur (ex. pas de zone de livraison) : on les masque
  const lines: CartLine[] = raw.lines.nodes.filter((l) => l.quantity > 0).map((l) => {
    const option = l.merchandise.selectedOptions.find((o) => /pojemno/i.test(o.name));
    return {
      id: l.id,
      quantity: l.quantity,
      merchandise: {
        id: l.merchandise.id,
        title: l.merchandise.title,
        sku: l.merchandise.sku ?? "",
        volumeMl: parseVolumeMl(option?.value),
        price: toMoney(l.merchandise.price),
        product: {
          handle: l.merchandise.product.handle,
          title: l.merchandise.product.title,
          featuredImage: toImage(l.merchandise.product.featuredImage, l.merchandise.product.title),
        },
      },
      cost: { total: toMoney(l.cost.totalAmount) },
    };
  });
  return {
    id: raw.id,
    checkoutUrl: raw.checkoutUrl,
    totalQuantity: raw.totalQuantity,
    lines,
    cost: { subtotal: toMoney(raw.cost.subtotalAmount), total: toMoney(raw.cost.totalAmount) },
  };
}

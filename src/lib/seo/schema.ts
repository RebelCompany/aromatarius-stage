import type {
  Article,
  BreadcrumbList,
  CollectionPage,
  FAQPage,
  HowTo,
  ItemList,
  Organization,
  Product as ProductSchema,
  WebSite,
  WithContext,
} from "schema-dts";
import type { Faq, Product, ProductCardData } from "@/lib/shopify/types";
import { absoluteUrl, SITE_NAME } from "./metadata";

export type Crumb = { name: string; href: string };

const ORGANIZATION_ID = absoluteUrl("/#organization");

export function organizationSchema(): WithContext<Organization> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/images/logo.svg"),
    telephone: "+48 576 105 864",
    email: "sklep@aromatarius.pl",
    sameAs: [
      "https://www.facebook.com/aromatarius",
      "https://www.instagram.com/aromatarius",
      "https://www.youtube.com/@aromatarius",
    ],
  };
}

export function websiteSchema(): WithContext<WebSite> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    inLanguage: "pl-PL",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${absoluteUrl("/szukaj")}?q={search_term_string}` },
      // schema-dts n'inclut pas query-input, requis par Google
      ...({ "query-input": "required name=search_term_string" } as object),
    },
  };
}

export function breadcrumbSchema(crumbs: Crumb[]): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.href),
    })),
  };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

export function faqSchema(faq: Faq[]): WithContext<FAQPage> | null {
  if (!faq.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.pytanie,
      acceptedAnswer: { "@type": "Answer", text: stripHtml(f.odpowiedzHtml) },
    })),
  };
}

export function productSchema(product: Product): WithContext<ProductSchema> {
  const url = absoluteUrl(`/produkt/${product.handle}`);
  const additionalProperty = [
    product.meta.nazwaLacinska && { "@type": "PropertyValue" as const, name: "Nazwa łacińska", value: product.meta.nazwaLacinska },
    product.meta.chemotyp && { "@type": "PropertyValue" as const, name: "Chemotyp", value: product.meta.chemotyp },
    product.meta.metodaEkstrakcji && { "@type": "PropertyValue" as const, name: "Metoda ekstrakcji", value: product.meta.metodaEkstrakcji },
    product.meta.pochodzenie && { "@type": "PropertyValue" as const, name: "Pochodzenie", value: product.meta.pochodzenie },
  ].filter((p): p is { "@type": "PropertyValue"; name: string; value: string } => !!p);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.title,
    description: product.description,
    image: product.images.map((i) => absoluteUrl(i.url)),
    brand: { "@type": "Brand", name: SITE_NAME },
    category: product.productType,
    url,
    additionalProperty,
    offers: product.variants.map((v) => ({
      "@type": "Offer",
      url: `${url}?variant=${encodeURIComponent(v.id)}`,
      name: `${product.title} ${v.title}`,
      sku: v.sku,
      price: v.price.amount.toFixed(2),
      priceCurrency: "PLN",
      availability: v.availableForSale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: SITE_NAME },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "PL",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
      },
    })),
  };
}

export function itemListSchema(products: ProductCardData[], name: string): WithContext<ItemList> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(`/produkt/${p.handle}`),
      name: p.title,
    })),
  };
}

export function collectionPageSchema(input: { name: string; description: string; path: string }): WithContext<CollectionPage> {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    isPartOf: { "@type": "WebSite", url: absoluteUrl("/") },
  };
}

export function articleSchema(input: {
  title: string;
  description: string;
  path: string;
  publishedAt: string;
  updatedAt: string;
  image?: string | null;
  author: string;
}): WithContext<Article> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    url: absoluteUrl(input.path),
    mainEntityOfPage: absoluteUrl(input.path),
    datePublished: input.publishedAt,
    dateModified: input.updatedAt,
    inLanguage: "pl-PL",
    image: input.image ? [absoluteUrl(input.image)] : undefined,
    author: { "@type": "Person", name: input.author, url: absoluteUrl("/o-nas") },
    publisher: { "@id": ORGANIZATION_ID } as Organization,
  };
}

export function howToSchema(input: {
  title: string;
  description: string;
  path: string;
  totalTime?: string;
  supplies: string[];
  steps: { name: string; text: string }[];
}): WithContext<HowTo> {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: input.title,
    description: input.description,
    url: absoluteUrl(input.path),
    inLanguage: "pl-PL",
    totalTime: input.totalTime,
    supply: input.supplies.map((s) => ({ "@type": "HowToSupply", name: s })),
    step: input.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
      url: `${absoluteUrl(input.path)}#krok-${i + 1}`,
    })),
  };
}

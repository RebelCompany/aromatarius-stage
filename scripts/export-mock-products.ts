/**
 * pnpm tsx scripts/export-mock-products.ts > data/shopify-products.json
 * Convertit le catalogue de démo (src/lib/shopify/mock.ts) en inputs `productSet`
 * (Admin API) : variantes, tags, metafields namespace `aromatarius`.
 * HTML des metafields rich_text -> format rich text JSON de Shopify.
 * `pasuje_do` (références produit) et `analiza_pdf` (fichier) sont exclus :
 * ils demandent des GID existants (2e passe) et des fichiers uploadés.
 */
import { mockProducts } from "../src/lib/shopify/mock";

type RichNode = Record<string, unknown>;

/** Convertisseur minimal HTML (p, ul/ol, li, strong, em, a) -> rich text Shopify. */
function htmlToRichText(html: string): string {
  const children: RichNode[] = [];
  const blockRe = /<(p|ul|ol|h[1-6])(?:\s[^>]*)?>([\s\S]*?)<\/\1>/g;
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(html))) {
    const [, tag, inner] = m;
    if (tag === "p") children.push({ type: "paragraph", children: inlines(inner) });
    else if (tag === "ul" || tag === "ol") {
      const items = [...inner.matchAll(/<li(?:\s[^>]*)?>([\s\S]*?)<\/li>/g)].map((li) => ({
        type: "list-item",
        children: inlines(li[1]),
      }));
      children.push({ type: "list", listType: tag === "ol" ? "ordered" : "unordered", children: items });
    } else {
      children.push({ type: "heading", level: Number(tag[1]), children: inlines(inner) });
    }
  }
  if (!children.length) children.push({ type: "paragraph", children: inlines(html) });
  return JSON.stringify({ type: "root", children });
}

function inlines(html: string): RichNode[] {
  const out: RichNode[] = [];
  const re = /<(strong|b|em|i|a)(?:\s+href="([^"]*)")?[^>]*>([\s\S]*?)<\/\1>|([^<]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const [, tag, href, inner, text] = m;
    if (text) out.push({ type: "text", value: decode(text) });
    else if (tag === "a") out.push({ type: "link", url: href ?? "#", children: [{ type: "text", value: decode(inner) }] });
    else out.push({ type: "text", value: decode(inner), ...(tag === "strong" || tag === "b" ? { bold: true } : { italic: true }) });
  }
  return out.length ? out : [{ type: "text", value: "" }];
}

function decode(s: string): string {
  return s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ");
}

const gramsFor = (ml: number | null) => (ml === 5 ? 30 : ml === 10 ? 45 : ml === 30 ? 80 : 160);

const inputs = mockProducts.map((p) => {
  const m = p.meta;
  const metafields: { namespace: string; key: string; type: string; value: string }[] = [];
  const add = (key: string, type: string, value: string | null | undefined) => {
    if (value == null || value === "") return;
    metafields.push({ namespace: "aromatarius", key, type, value });
  };
  add("nazwa_lacinska", "single_line_text_field", m.nazwaLacinska);
  add("rodzina_botaniczna", "single_line_text_field", m.rodzinaBotaniczna);
  add("czesc_rosliny", "single_line_text_field", m.czescRosliny);
  add("metoda_ekstrakcji", "single_line_text_field", m.metodaEkstrakcji);
  add("chemotyp", "single_line_text_field", m.chemotyp);
  add("pochodzenie", "single_line_text_field", m.pochodzenie);
  add("certyfikat_bio", "single_line_text_field", m.certyfikatBio);
  add("numer_partii", "single_line_text_field", m.numerPartii);
  add("glowne_skladniki", "json", JSON.stringify(m.glowneSkladniki));
  add("na_co", "list.single_line_text_field", JSON.stringify(m.naCo));
  add("zapach_opis", "single_line_text_field", m.zapachOpis);
  add("wlasciwosci", "rich_text_field", m.wlasciwosciHtml ? htmlToRichText(m.wlasciwosciHtml) : null);
  add("jak_stosowac", "rich_text_field", m.jakStosowacHtml ? htmlToRichText(m.jakStosowacHtml) : null);
  add("dawkowanie", "json", JSON.stringify(m.dawkowanie));
  add("bezpieczenstwo", "rich_text_field", m.bezpieczenstwoHtml ? htmlToRichText(m.bezpieczenstwoHtml) : null);
  add("wplyw_emocjonalny", "rich_text_field", m.wplywEmocjonalnyHtml ? htmlToRichText(m.wplywEmocjonalnyHtml) : null);
  add("receptury_slugs", "list.single_line_text_field", m.recepturySlugs.length ? JSON.stringify(m.recepturySlugs) : null);
  add("kompendium_slug", "single_line_text_field", m.kompendiumSlug);
  if (m.najnizszaCena30) add("najnizsza_cena_30", "money", JSON.stringify({ amount: m.najnizszaCena30.amount.toFixed(2), currency_code: "PLN" }));

  return {
    handle: p.handle,
    title: p.title,
    descriptionHtml: p.descriptionHtml,
    productType: p.productType,
    vendor: "Aromatarius",
    status: "ACTIVE",
    tags: p.tags,
    productOptions: [{ name: "Pojemność", position: 1, values: p.variants.map((v) => ({ name: v.title })) }],
    variants: p.variants.map((v, i) => ({
      optionValues: [{ optionName: "Pojemność", name: v.title }],
      sku: v.sku,
      price: v.price.amount.toFixed(2),
      compareAtPrice: v.compareAtPrice ? v.compareAtPrice.amount.toFixed(2) : null,
      position: i + 1,
      inventoryPolicy: "DENY",
      inventoryItem: { tracked: true, measurement: { weight: { unit: "GRAMS", value: gramsFor(v.volumeMl) } } },
    })),
    seo: { title: null, description: null },
    metafields,
  };
});

process.stdout.write(JSON.stringify(inputs, null, 2));

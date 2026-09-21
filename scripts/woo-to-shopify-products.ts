/**
 * pnpm tsx scripts/woo-to-shopify-products.ts
 * Transforme l'export WooCommerce (docs/07 §3) en inputs `productSet` Shopify.
 *
 * Entrées (data/woo-export/) :
 *   products-csv.json   export admin Woo (183 produits : stock, prix, attributs, meta SEO, images)
 *   product-posts.json  WP REST : id -> slug/permalink (redirections)
 *   posts.json          articles de blog (redirections vers /blog)
 * Sorties (data/) :
 *   shopify-import.json     produits Shopify (handle, variantes, tags, metafields, images)
 *   receptury-source.json   receptury Woo (produits PDF payants) -> MDX gratuits (semaine 3)
 *   redirects.csv           old_url -> new_url
 *   tag-mapping.csv         tags potrzeba:* proposés, à valider par Bogusia
 *   import-report.md        compte rendu et avertissements
 */
import fs from "node:fs";
import path from "node:path";

type CsvRow = Record<string, string>;
type ProductPost = { id: number; slug: string; link: string; title: { rendered: string }; modified: string };
type Post = { id: number; slug: string; link: string; title: { rendered: string }; _embedded?: { "wp:term"?: { name: string; taxonomy: string }[][] } };

const DATA = path.join(process.cwd(), "data");
const EXPORT = path.join(DATA, "woo-export");
/** Le CSV Woo contient des "\n" littéraux (CR + backslash + n) à la place des sauts de ligne. */
const unescapeNl = (v: string) => v.replace(/\r?\\n/g, "\n").replace(/\r\n/g, "\n");
const rows: CsvRow[] = (JSON.parse(fs.readFileSync(path.join(EXPORT, "products-csv.json"), "utf8")) as CsvRow[]).map((r) => ({
  ...r,
  Description: unescapeNl(r["Description"] ?? ""),
  "Description courte": unescapeNl(r["Description courte"] ?? ""),
}));
const posts: ProductPost[] = JSON.parse(fs.readFileSync(path.join(EXPORT, "product-posts.json"), "utf8"));
const blogPosts: Post[] = JSON.parse(fs.readFileSync(path.join(EXPORT, "posts.json"), "utf8"));
const slugById = new Map(posts.map((p) => [String(p.id), p.slug]));

const warnings: string[] = [];
const warn = (s: string) => warnings.push(s);

/* ---------- Helpers texte ---------- */

const decode = (s: string) =>
  s
    .replace(/&#8211;/g, "-")
    .replace(/&#8217;|&#8216;/g, "'")
    .replace(/&#8222;|&#8220;|&#8221;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ")
    .trim();

const stripTags = (html: string) =>
  html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|h[1-6]|li|div|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .split("\n")
    .map((l) => decode(l))
    .filter(Boolean)
    .join("\n");

function slugify(s: string): string {
  const map: Record<string, string> = { ą: "a", ć: "c", ę: "e", ł: "l", ń: "n", ó: "o", ś: "s", ź: "z", ż: "z" };
  return decode(s)
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (c) => map[c])
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** HTML/texte simple -> rich text Shopify (paragraphes et listes) */
function toRichText(blocks: { type: "p" | "ul" | "h3"; lines: string[] }[]): string | null {
  const children = blocks
    .filter((b) => b.lines.some((l) => l.trim()))
    .map((b) => {
      if (b.type === "ul")
        return { type: "list", listType: "unordered", children: b.lines.map((l) => ({ type: "list-item", children: [{ type: "text", value: l.trim() }] })) };
      if (b.type === "h3") return { type: "heading", level: 3, children: [{ type: "text", value: b.lines.join(" ").trim() }] };
      return { type: "paragraph", children: [{ type: "text", value: b.lines.join(" ").trim() }] };
    });
  return children.length ? JSON.stringify({ type: "root", children }) : null;
}

const paragraphsToRich = (text: string) =>
  toRichText(
    text
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => ({ type: "p" as const, lines: [l] })),
  );

/* ---------- Classification ---------- */

type Kind = "product" | "receptura" | "digital";
type ShopifyType = "Olejek eteryczny" | "Hydrolat" | "Olej roślinny" | "Mieszanka" | "Zestaw" | "Dyfuzor" | "Akcesorium" | "Kompendium";

function categoriesOf(row: CsvRow): string[] {
  return row["Catégories"]
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
}

function classify(row: CsvRow): { kind: Kind; type: ShopifyType } {
  const cats = categoriesOf(row).join(" | ");
  const name = row["Nom"];
  const downloadable = row["Type"].includes("downloadable");
  if (/Receptury/.test(cats) || /-\s*Receptura/i.test(name) || /Receptura$/i.test(name)) return { kind: "receptura", type: "Akcesorium" };
  if (/Kompendium/.test(cats) || /^Fiszka/i.test(name) || /Kompendium Aromaterapii/i.test(name)) return { kind: "digital", type: "Kompendium" };
  if (downloadable) return { kind: "digital", type: "Kompendium" };
  if (/Olejki eteryczne/.test(cats)) return { kind: "product", type: "Olejek eteryczny" };
  if (/Hydrolaty/.test(cats) || /^Hydrolat/i.test(name)) return { kind: "product", type: "Hydrolat" };
  if (/Oleje roślinne/.test(cats) || /^Olej /i.test(name)) return { kind: "product", type: "Olej roślinny" };
  if (/Mieszanki/.test(cats)) return { kind: "product", type: "Mieszanka" };
  if (/Zestawy/.test(cats) || /^Zestaw|^Trio /i.test(name)) return { kind: "product", type: "Zestaw" };
  if (/Dyfuzory/.test(cats) || /^Dyfuzor|^Podgrzewacz|^Podrzewacz|Nebulizator/i.test(name)) return { kind: "product", type: "Dyfuzor" };
  if (/Problemy zdrowotne/.test(cats) && /olejek|BIO/i.test(name) && /\d+\s?ml/i.test(name)) return { kind: "product", type: "Olejek eteryczny" };
  return { kind: "product", type: "Akcesorium" };
}

/* ---------- Tags ---------- */

const needRules: [string, RegExp][] = [
  ["sen", /bezsenno|\bsen\b|zasypian|snu\b/i],
  ["stres", /stres|uspokaj|relaks|odpręż|wyczerpan|nerwow|lęk|niepok/i],
  ["odpornosc", /immunolog|odporno|wirus|infekc|przeziębi|grypa|bakter/i],
  ["oddychanie", /oddech|katar|zatok|oskrzel|kaszel|gardł|drogi oddechowe/i],
  ["skora", /skór|trądzik|egzem|oparzen|ran\b|blizn|łuszczyc/i],
  ["trawienie", /trawien|jelit|wątrob|żołąd|niestraw|wzdęc/i],
  ["bol", /\bból|bole|mięśn|staw|reumat|migren|napięciow/i],
  ["dom", /powietrz|dezynfek|oczyszcza|odświeża|dyfuzor|komar|mole|kleszcz/i],
  ["pielegnacja", /włos|łupież|cellulit|pielęgn|zmarszcz|cera\b|paznok/i],
];

const usageRules: [string, RegExp][] = [
  ["dyfuzja", /dyfuz|kominek|rozpyl|nawan/i],
  ["skora", /skór|masaż|kąpiel|okład|kompres/i],
  ["kapiel", /kąpiel/i],
  ["inhalacja", /inhal|wdych/i],
  ["doustnie", /doustn|wewnętrzn/i],
];

function attr(row: CsvRow, name: string): string {
  for (let i = 1; i <= 8; i++) if (row[`Nom de l'attribut ${i}`] === name) return decode(row[`Valeur(s) de l'attribut ${i}`] ?? "");
  return "";
}
const attrList = (row: CsvRow, name: string) =>
  attr(row, name)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

function proposeTags(row: CsvRow, type: ShopifyType): { potrzeba: string[]; uzycie: string[]; other: string[] } {
  const cats = categoriesOf(row).join(" ");
  const corpus = [attr(row, "Działanie"), attr(row, "Dobrostan"), attr(row, "Uroda"), attr(row, "Inne zastosowania"), attr(row, "Włosy"), attr(row, "Co to jest?")].join(" ");
  const potrzeba = new Set<string>();
  for (const [tag, re] of needRules) if (re.test(corpus)) potrzeba.add(tag);
  if (/Dla dzieci/.test(cats)) potrzeba.add("dzieci");
  if (/Dla kobiet/.test(cats)) potrzeba.add("pielegnacja");
  if (/Borelioza/.test(cats)) potrzeba.add("odpornosc");
  if (type === "Dyfuzor") {
    potrzeba.clear();
    potrzeba.add("dom");
  }
  const uzycie = new Set<string>();
  const methods = attr(row, "Popularne metody stosowania");
  for (const [tag, re] of usageRules) if (re.test(methods)) uzycie.add(tag);
  const other: string[] = [];
  if (/\bBIO\b/i.test(row["Nom"])) other.push("bio");
  if (/fototoks/i.test(row["Description"] + attr(row, "Środki ostrożności"))) other.push("fototoksyczny");
  if (/Dla mężczyzn/.test(cats)) other.push("dla:mezczyzn");
  if (/Dla kobiet/.test(cats)) other.push("dla:kobiet");
  if (row["Tarif promo"]) other.push("promocja");
  if (/Suplement diety/.test(attr(row, "Suplement diety") + cats)) other.push("suplement");
  return { potrzeba: [...potrzeba].slice(0, 4), uzycie: [...uzycie], other };
}

/* ---------- Parsing description olejki ---------- */

type Parsed = {
  latin: string | null;
  family: string | null;
  method: string | null;
  origin: string | null;
  pdf: string | null;
  batch: string | null;
  sections: Record<string, string>;
  bodyHtml: string;
};

const SECTION_HEADINGS = ["Prezentacja", "Właściwości", "Wpływ psycho-emocjonalny", "Wpływ emocjonalny", "Środki ostrożności", "Zastosowanie", "Stosowanie", "Dawkowanie", "Uwagi", "Przeciwwskazania", "Skład", "Właściwości składników", "Mocne strony", "Dodatkowe informacje"];

function parseDescription(html: string): Parsed {
  const pdf = html.match(/href="([^"]+\.pdf)"/i)?.[1] ?? null;
  const batch = pdf ? decodeURIComponent(path.basename(pdf, ".pdf")) : null;
  const text = stripTags(html);
  const lines = text.split("\n");
  const grab = (re: RegExp) => {
    const l = lines.find((x) => re.test(x));
    return l ? decode(l.replace(re, "")).replace(/^[:\s]+/, "") || null : null;
  };
  const latinFromH2 = html.match(/<h[1-6][^>]*>[^<(]*\(([^)]+)\)/)?.[1] ?? null;
  const latin = grab(/^Nazwa łacińska\s*:?/i) ?? (latinFromH2 ? decode(latinFromH2) : null);
  const family = grab(/^Rodzina botaniczna\s*:?/i);
  const method = lines.find((l) => /^(Pozyskiwan|Esencja otrzyman|Otrzymywan|Uzyskiwan|Destylacja|Tłoczenie)/i.test(l)) ?? null;
  const origin = grab(/^Pochodzenie\s*:?/i);

  // Sections : titre seul sur une ligne, contenu jusqu'au titre suivant
  const sections: Record<string, string> = {};
  let current: string | null = null;
  for (const l of lines) {
    const clean = l.replace(/[:\s]+$/, "");
    const heading = SECTION_HEADINGS.find((h) => clean.toLowerCase() === h.toLowerCase());
    if (heading && clean.length < 40) {
      current = heading;
      sections[current] = sections[current] ?? "";
      continue;
    }
    if (current) sections[current] += (sections[current] ? "\n" : "") + l;
  }
  // Corps HTML : sans le lien PDF, sans le disclaimer (composant HealthDisclaimer), sans styles inline
  const cleaned = html
    .replace(/^\s*<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/i, "")
    .replace(/<a[^>]*\.pdf[^>]*>[\s\S]*?<\/a>/gi, "")
    .replace(/<em>\s*Poniższe podsumowanie[\s\S]*?<\/em>\.?/gi, "")
    .replace(/\sstyle="[^"]*"/g, "")
    .replace(
      /<(strong|b)>\s*(Prezentacja|Właściwości|Wpływ psycho-emocjonalny|Wpływ emocjonalny|Środki ostrożności|Zastosowanie|Stosowanie|Dawkowanie|Uwagi|Przeciwwskazania|Skład|Właściwości składników|Mocne strony|Dodatkowe informacje)\s*:?\s*<\/(strong|b)>/gi,
      "<h3>$2</h3>",
    )
    .replace(/<p>\s*(&nbsp;|\s)*<\/p>/g, "");
  const bodyHtml = autop(cleaned);
  return { latin, family, method: method ? decode(method) : null, origin, pdf, batch, sections, bodyHtml };
}

/** Woo stocke le contenu sans <p> (autop au rendu) : on reconstruit les paragraphes. */
function autop(html: string): string {
  return html
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => (/^<(h[1-6]|ul|ol|p|table|div|blockquote|figure)/i.test(block) ? block : `<p>${block.replace(/\n/g, "<br>")}</p>`))
    .join("\n");
}

/* ---------- Regroupement en variantes ---------- */

const VOLUME_RE = /\s*[-–]?\s*(\d+(?:[.,]\d+)?)\s?ml\b/i;

function volumeOf(row: CsvRow): number | null {
  const a = attr(row, "Pojemność").match(/(\d+)\s?ml/i);
  if (a) return Number(a[1]);
  const n = row["Nom"].match(VOLUME_RE);
  return n ? Number(n[1].replace(",", ".")) : null;
}

function baseName(name: string): string {
  return decode(name)
    .replace(VOLUME_RE, "")
    .replace(/\s+/g, " ")
    .replace(/\s*[-–]\s*$/, "")
    .trim();
}

function cleanHandle(slug: string, name: string, type: ShopifyType): string {
  let h = slug
    .replace(/-\d+-?ml\b/g, "")
    .replace(/-olejek-klasy-terapeutycznej/g, "")
    .replace(/-olejek-eteryczny/g, "")
    .replace(/^olejek-eteryczny-/, "")
    .replace(/-\d+(-\d+)*$/, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  if (!h || /^\d+$/.test(h)) h = slugify(baseName(name));
  if (/\bBIO\b/i.test(name) && !/(^|-)bio($|-)/.test(h)) h += "-bio";
  if (type === "Hydrolat" && !h.startsWith("hydrolat-")) h = `hydrolat-${h.replace(/-hydrolat/g, "")}`;
  return h;
}

const gramsFor = (ml: number | null, type: ShopifyType) => {
  if (type === "Dyfuzor") return 800;
  if (type === "Zestaw") return 200;
  if (!ml) return 100;
  if (ml <= 5) return 30;
  if (ml <= 10) return 45;
  if (ml <= 30) return 80;
  if (ml <= 100) return 160;
  return 300;
};

/* ---------- Main ---------- */

type Variant = { row: CsvRow; ml: number | null; slug: string };
type Group = { key: string; title: string; type: ShopifyType; variants: Variant[]; primary: CsvRow };

const receptury: unknown[] = [];
const groups = new Map<string, Group>();
const redirects = new Map<string, string>();
const tagMapping: string[] = ["handle,title,type,potrzeba_proposed,uzycie_proposed,other_tags,source_dzialanie"];

for (const row of rows) {
  const slug = slugById.get(row["ID"]) ?? slugify(row["Nom"]);
  const { kind, type } = classify(row);
  if (kind === "receptura") {
    const newSlug = slugify(baseName(row["Nom"]).replace(/\s*-\s*Receptura.*$/i, "").replace(/\s*Receptura$/i, ""));
    receptury.push({
      wooId: row["ID"],
      slug,
      proposedSlug: newSlug,
      title: decode(row["Nom"]),
      price: row["Tarif régulier"],
      categories: categoriesOf(row),
      pdf: [1, 2, 3, 4].map((i) => row[`URL de téléchargement ${i}`]).filter(Boolean),
      descriptionText: stripTags(row["Description"]),
      seoTitle: row["Méta : rank_math_title"] || row["Méta : _yoast_wpseo_title"] || "",
      seoDescription: row["Méta : rank_math_description"] || row["Méta : _yoast_wpseo_metadesc"] || "",
      images: row["Images"].split(",").map((s) => s.trim()).filter(Boolean),
    });
    redirects.set(`/produkt/${slug}`, `/receptury/${newSlug}`);
    continue;
  }
  const ml = volumeOf(row);
  const groupable = ["Olejek eteryczny", "Hydrolat", "Olej roślinny", "Mieszanka"].includes(type) && ml != null;
  const key = groupable ? `${type}::${baseName(row["Nom"]).toLowerCase()}` : `${type}::${row["ID"]}`;
  const g = groups.get(key) ?? { key, title: baseName(row["Nom"]), type, variants: [], primary: row };
  g.variants.push({ row, ml, slug });
  // Produit "principal" du groupe : le 10 ml, sinon le premier
  if (ml === 10) g.primary = row;
  groups.set(key, g);
}

const handles = new Set<string>();
const products: unknown[] = [];
const draftDigital: string[] = [];

for (const g of [...groups.values()]) {
  const primary = g.primary;
  const primarySlug = g.variants.find((v) => v.row === primary)?.slug ?? g.variants[0].slug;
  let handle = cleanHandle(primarySlug, g.title, g.type);
  let n = 2;
  while (handles.has(handle)) handle = `${cleanHandle(primarySlug, g.title, g.type)}-${n++}`;
  handles.add(handle);

  const kind = classify(primary).kind;
  const parsed = parseDescription(primary["Description"]);
  const tags = proposeTags(primary, g.type);
  const chemotyp =
    decode(g.title).match(/\b[Cc][Tt]\.?\s+([A-Za-ząćęłńóśźż0-9,-]+)/)?.[1] ??
    parsed.latin?.match(/\b[Cc][Tt]\.?\s+([A-Za-z0-9,-]+)/)?.[1] ??
    null;
  const isBio = tags.other.includes("bio");

  g.variants.sort((a, b) => (a.ml ?? 0) - (b.ml ?? 0));
  const hasVolume = g.variants.every((v) => v.ml != null);
  const optionName = hasVolume ? "Pojemność" : "Wariant";
  const optionValues = hasVolume ? g.variants.map((v) => `${v.ml} ml`) : ["Standard"];

  const variants = g.variants.map((v, i) => {
    const regular = Number(v.row["Tarif régulier"] || 0);
    const promo = v.row["Tarif promo"] ? Number(v.row["Tarif promo"]) : null;
    const stock = v.row["Stock"] === "" ? null : Number(v.row["Stock"]);
    const value = hasVolume ? `${v.ml} ml` : "Standard";
    return {
      optionValues: [{ optionName, name: value }],
      sku: `${handle.toUpperCase().replace(/-/g, "")}-${v.ml ?? "STD"}`,
      price: (promo ?? regular).toFixed(2),
      compareAtPrice: promo ? regular.toFixed(2) : null,
      position: i + 1,
      inventoryPolicy: "DENY",
      inventoryItem: { tracked: true, measurement: { weight: { unit: "GRAMS", value: gramsFor(v.ml, g.type) } } },
      // hors ProductSetInput : utilisés par scripts/shopify-import.ts
      _stock: stock,
      _sourceSlug: v.slug,
      _wooId: v.row["ID"],
    };
  });

  const metafields: { namespace: string; key: string; type: string; value: string }[] = [];
  const add = (key: string, type: string, value: string | null | undefined) => {
    if (value == null || value === "") return;
    metafields.push({ namespace: "aromatarius", key, type, value });
  };
  const s = parsed.sections;
  add("nazwa_lacinska", "single_line_text_field", parsed.latin);
  add("rodzina_botaniczna", "single_line_text_field", parsed.family);
  add("metoda_ekstrakcji", "single_line_text_field", parsed.method);
  add("pochodzenie", "single_line_text_field", parsed.origin);
  add("chemotyp", "single_line_text_field", chemotyp);
  add("numer_partii", "single_line_text_field", parsed.batch);
  if (isBio) add("certyfikat_bio", "single_line_text_field", "Certyfikat rolnictwa ekologicznego UE (numer do uzupełnienia)");
  const dzialanie = attrList(primary, "Działanie");
  if (dzialanie.length) add("na_co", "list.single_line_text_field", JSON.stringify(dzialanie.slice(0, 3)));
  add("wlasciwosci", "rich_text_field", paragraphsToRich([s["Właściwości"], s["Prezentacja"] ? "" : "", s["Właściwości składników"] ?? ""].filter(Boolean).join("\n")) ?? paragraphsToRich(s["Prezentacja"] ?? ""));
  const methods = attrList(primary, "Popularne metody stosowania");
  const usageText = s["Zastosowanie"] ?? s["Stosowanie"] ?? s["Dawkowanie"] ?? "";
  add(
    "jak_stosowac",
    "rich_text_field",
    toRichText([
      ...(methods.length ? [{ type: "ul" as const, lines: methods }] : []),
      ...usageText.split(/\n+/).filter(Boolean).map((l) => ({ type: "p" as const, lines: [l] })),
    ]),
  );
  const precautions = attrList(primary, "Środki ostrożności");
  const storage = attrList(primary, "Przechowywanie");
  add(
    "bezpieczenstwo",
    "rich_text_field",
    toRichText([
      ...(precautions.length ? [{ type: "ul" as const, lines: precautions }] : []),
      ...(s["Środki ostrożności"] ?? s["Przeciwwskazania"] ?? "").split(/\n+/).filter(Boolean).map((l) => ({ type: "p" as const, lines: [l] })),
      ...(storage.length ? [{ type: "h3" as const, lines: ["Przechowywanie"] }, { type: "ul" as const, lines: storage }] : []),
    ]),
  );
  add("wplyw_emocjonalny", "rich_text_field", paragraphsToRich(s["Wpływ psycho-emocjonalny"] ?? s["Wpływ emocjonalny"] ?? ""));
  const seoTitle = primary["Méta : rank_math_title"]?.replace(/\s*%sep%.*$/, "") || primary["Méta : _yoast_wpseo_title"]?.replace(/\s*%%sep%%.*$/, "") || "";
  add("seo_title", "single_line_text_field", seoTitle ? decode(seoTitle) : null);
  add("seo_description", "single_line_text_field", decode(primary["Méta : rank_math_description"] || primary["Méta : _yoast_wpseo_metadesc"] || "") || null);

  const allTags = [
    ...tags.other,
    ...tags.potrzeba.map((t) => `potrzeba:${t}`),
    ...tags.uzycie.map((t) => `uzycie:${t}`),
    ...(kind === "digital" ? ["cyfrowy"] : []),
  ];

  const images = [...new Set(g.variants.flatMap((v) => v.row["Images"].split(",").map((u) => u.trim()).filter(Boolean)))];
  const title = decode(g.title).replace(/\s+/g, " ");
  if (g.type === "Olejek eteryczny") {
    if (!parsed.latin) warn(`${handle}: nazwa łacińska introuvable`);
    if (!parsed.pdf) warn(`${handle}: pas de PDF d'analyse`);
  }
  if (kind === "digital") draftDigital.push(handle);

  products.push({
    handle,
    sourceSlugs: g.variants.map((v) => v.slug),
    sourceIds: g.variants.map((v) => v.row["ID"]),
    analizaPdfUrl: parsed.pdf,
    images: images.map((src, i) => ({ src, alt: `${title} ${g.type.toLowerCase()} Aromatarius${i ? ` ${i + 1}` : ""}` })),
    input: {
      handle,
      title,
      descriptionHtml: parsed.bodyHtml,
      productType: g.type,
      vendor: "Aromatarius",
      status: kind === "digital" ? "DRAFT" : "ACTIVE",
      tags: allTags,
      productOptions: [{ name: optionName, position: 1, values: optionValues.map((name) => ({ name })) }],
      variants,
      metafields,
      seo: seoTitle ? { title: decode(seoTitle) } : undefined,
    },
  });

  for (const v of g.variants) redirects.set(`/produkt/${v.slug}`, `/produkt/${handle}`);
  tagMapping.push(
    [handle, `"${title.replace(/"/g, '""')}"`, g.type, tags.potrzeba.join("|"), tags.uzycie.join("|"), tags.other.join("|"), `"${dzialanie.slice(0, 6).join("; ").replace(/"/g, '""')}"`].join(","),
  );
}

/* ---------- Redirections catégories, articles ---------- */

const catRedirects: [string, string][] = [
  ["/kategoria-produktu/olejki-eteryczne", "/olejki-eteryczne"],
  ["/kategoria-produktu/hydrolaty", "/hydrolaty"],
  ["/kategoria-produktu/oleje-roslinne", "/oleje-roslinne"],
  ["/kategoria-produktu/mieszanki", "/mieszanki"],
  ["/kategoria-produktu/zestawy", "/zestawy"],
  ["/kategoria-produktu/dyfuzory", "/dyfuzory"],
  ["/kategoria-produktu/dyfuzory/ultradzwiekowe", "/dyfuzory"],
  ["/kategoria-produktu/dyfuzory/nebulizator", "/dyfuzory"],
  ["/kategoria-produktu/dyfuzory/olfaktory", "/dyfuzory"],
  ["/kategoria-produktu/dyfuzory/olfaktory-samochodowe", "/dyfuzory"],
  ["/kategoria-produktu/dyfuzory/przenosne", "/dyfuzory"],
  ["/kategoria-produktu/dyfuzory/ceramika-lagodne-cieplo", "/dyfuzory"],
  ["/kategoria-produktu/dyfuzory/dyfuzor-lagodnego-ciepla", "/dyfuzory"],
  ["/kategoria-produktu/kompendium", "/kompendium"],
  ["/kategoria-produktu/kompendium/komplety-fiszek", "/kompendium"],
  ["/kategoria-produktu/receptury", "/receptury"],
  ["/kategoria-produktu/problemy-zdrowotne", "/na/odpornosc"],
  ["/kategoria-produktu/problemy-zdrowotne/dla-dzieci", "/na/dzieci"],
  ["/kategoria-produktu/problemy-zdrowotne/dla-dzieci-i-ciezarnych", "/na/dzieci"],
  ["/kategoria-produktu/problemy-zdrowotne/dla-kobiet", "/na/pielegnacja"],
  ["/kategoria-produktu/problemy-zdrowotne/dla-mezczyzn", "/olejki-eteryczne"],
  ["/kategoria-produktu/problemy-zdrowotne/borelioza", "/na/odpornosc"],
];
for (const [a, b] of catRedirects) redirects.set(a, b);
for (const p of blogPosts) {
  const terms = p._embedded?.["wp:term"]?.flat() ?? [];
  const isRecipe = terms.some((t) => t.taxonomy === "category" && /Receptury/i.test(t.name));
  redirects.set(`/${p.slug}`, isRecipe ? `/receptury/${p.slug}` : `/blog/${p.slug}`);
}
const pageRedirects: [string, string][] = [
  ["/o-nas", "/o-nas"],
  ["/contact", "/kontakt"],
  ["/wysylka", "/wysylka"],
  ["/polityka-zwrotow", "/zwroty"],
  ["/regulamin-swiadczenia-uslug", "/regulamin"],
  ["/polityka-prywatnosci", "/polityka-prywatnosci"],
  ["/polityka-plikow-cookie", "/polityka-prywatnosci"],
  ["/faq", "/jakosc"],
  ["/metody-stosowania", "/kompendium"],
  ["/toksycznosc", "/jakosc"],
  ["/zanim-zaczniesz", "/jakosc"],
  ["/akceptowane-platnosci", "/wysylka"],
  ["/regulamin-swiadczenia-uslugi-newslettera", "/regulamin"],
  ["/regulamin-swiadczenia-uslugi-newslettera-2", "/regulamin"],
  ["/newsletter", "/#newsletter"],
  ["/aromatyczne-promocje", "/promocje"],
  ["/shop-default", "/olejki-eteryczne"],
  ["/shop", "/olejki-eteryczne"],
  ["/cart", "/koszyk"],
  ["/checkout", "/koszyk"],
  ["/my-account", "/konto"],
  ["/lista-zyczen", "/konto"],
  ["/zamowienie", "/koszyk"],
  ["/home-2", "/"],
];
for (const [a, b] of pageRedirects) if (a !== b) redirects.set(a, b);

/* ---------- Écriture ---------- */

fs.writeFileSync(path.join(DATA, "shopify-import.json"), JSON.stringify(products, null, 1));
fs.writeFileSync(path.join(DATA, "receptury-source.json"), JSON.stringify(receptury, null, 1));
fs.writeFileSync(path.join(DATA, "tag-mapping.csv"), tagMapping.join("\n"));
fs.writeFileSync(
  path.join(DATA, "redirects.csv"),
  ["source,destination,status", "# Généré par scripts/woo-to-shopify-products.ts (docs/07 §6). Ne pas éditer à la main : relancer le script.", ...[...redirects].filter(([a, b]) => a !== b).map(([a, b]) => `${a},${b},301`)].join("\n"),
);

const byType: Record<string, number> = {};
for (const p of products as { input: { productType: string } }[]) byType[p.input.productType] = (byType[p.input.productType] ?? 0) + 1;
const variantsTotal = (products as { input: { variants: unknown[] } }[]).reduce((s, p) => s + p.input.variants.length, 0);
const report = [
  "# Import WooCommerce -> Shopify : rapport",
  "",
  `Généré le ${new Date().toISOString().slice(0, 10)} depuis ${rows.length} produits Woo.`,
  "",
  `- Produits Shopify : ${products.length} (${variantsTotal} variantes)`,
  ...Object.entries(byType).map(([t, n]) => `  - ${t} : ${n}`),
  `- Receptury (produits PDF payants -> contenu MDX gratuit, semaine 3) : ${receptury.length}`,
  `- Produits numériques importés en DRAFT (décision Bogusia : vendre en PDF via app ou retirer) : ${draftDigital.length}`,
  `- Redirections (URL qui changent) : ${[...redirects].filter(([a, b]) => a !== b).length}`,
  "",
  "## À valider par Bogusia",
  "",
  "- `data/tag-mapping.csv` : tags potrzeba:* proposés par heuristique sur les attributs Woo (Działanie, Dobrostan, Uroda).",
  "- Prix Omnibus (najniższa cena z 30 dni) pour les produits en promo : non renseignés, historique inconnu.",
  "- Numéros de certificat BIO, pays d'origine manquants.",
  "",
  "## Avertissements",
  "",
  ...warnings.map((w) => `- ${w}`),
].join("\n");
fs.writeFileSync(path.join(DATA, "import-report.md"), report);
console.log(report);

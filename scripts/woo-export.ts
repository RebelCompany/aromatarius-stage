/**
 * pnpm tsx scripts/woo-export.ts
 * Export brut du site WooCommerce actuel via ses endpoints publics (docs/07 §1 et §2) :
 * - Store API : produits (avec variations), catégories, tags
 * - WP REST : articles, pages (avec Yoast head si exposé)
 * - Sitemaps Yoast : inventaire complet des URLs
 * Sortie : data/woo-export/*.json + urls.csv (dossier gitignored).
 * Aucune authentification : l'export des clients/commandes se fait depuis l'admin Woo.
 */
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.WOO_BASE_URL ?? "https://aromatarius.pl";
const OUT = path.join(process.cwd(), "data", "woo-export");
const UA = "Mozilla/5.0 (compatible; AromatariusMigration/1.0; +https://rebelcompany.be)";

fs.mkdirSync(OUT, { recursive: true });

async function getJson<T>(url: string): Promise<{ data: T; totalPages: number }> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const totalPages = Number(res.headers.get("x-wp-totalpages") ?? 1);
  return { data: (await res.json()) as T, totalPages };
}

async function getText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

async function paginate<T>(endpoint: string, perPage = 100): Promise<T[]> {
  const all: T[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const sep = endpoint.includes("?") ? "&" : "?";
    const { data, totalPages: tp } = await getJson<T[]>(`${BASE}${endpoint}${sep}per_page=${perPage}&page=${page}`);
    all.push(...data);
    totalPages = tp;
    page++;
  } while (page <= totalPages);
  return all;
}

function save(name: string, data: unknown) {
  fs.writeFileSync(path.join(OUT, name), JSON.stringify(data, null, 2), "utf8");
  console.log(`✔ ${name}: ${Array.isArray(data) ? data.length : 1}`);
}

async function main() {
  // Produits (Store API expose type simple/variable, prix, images, catégories, tags, attributs)
  const products = await paginate<{ id: number; type: string }>("/wp-json/wc/store/v1/products?status=publish");
  save("products.json", products);

  // Variations des produits variables
  const variable = products.filter((p) => p.type === "variable");
  const variations: unknown[] = [];
  for (const p of variable) {
    const { data } = await getJson<unknown[]>(`${BASE}/wp-json/wc/store/v1/products?type=variation&parent=${p.id}&per_page=100`);
    variations.push(...data);
  }
  save("variations.json", variations);

  save("categories.json", await paginate("/wp-json/wc/store/v1/products/categories"));
  save("tags.json", await paginate("/wp-json/wc/store/v1/products/tags"));
  save("attributes.json", (await getJson(`${BASE}/wp-json/wc/store/v1/products/attributes`)).data);

  // Contenu
  save("posts.json", await paginate("/wp-json/wp/v2/posts?_embed=1&status=publish"));
  save("pages.json", await paginate("/wp-json/wp/v2/pages?_embed=1&status=publish"));
  save("post-categories.json", await paginate("/wp-json/wp/v2/categories"));

  // Sitemaps Yoast -> urls.csv (url,type,lastmod)
  const index = await getText(`${BASE}/sitemap_index.xml`);
  const sitemaps = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const rows: string[] = ["url,type,lastmod"];
  for (const sm of sitemaps) {
    const type = path.basename(sm).replace("-sitemap.xml", "").replace(/\d+$/, "");
    const xml = await getText(sm);
    for (const m of xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>(?:\s*<lastmod>([^<]+)<\/lastmod>)?/g)) {
      rows.push(`${m[1]},${type},${m[2] ?? ""}`);
    }
  }
  fs.writeFileSync(path.join(OUT, "urls.csv"), rows.join("\n"), "utf8");
  console.log(`✔ urls.csv: ${rows.length - 1} URLs (${sitemaps.length} sitemaps)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

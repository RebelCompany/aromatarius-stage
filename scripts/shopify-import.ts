/**
 * pnpm tsx scripts/shopify-import.ts [--dry-run] [--only=handle,handle] [--limit=N] [--skip-media] [--skip-pdf] [--replace-media]
 * pnpm tsx scripts/shopify-import.ts --delete=handle,handle   (supprime des produits, ex. données de démo)
 *
 * Importe data/shopify-import.json (généré par woo-to-shopify-products.ts) dans Shopify
 * via l'Admin API. Idempotent : `productSet` identifie les produits par handle,
 * les images et PDF ne sont ajoutés que s'ils manquent. Relançable pour
 * l'import différentiel du cut-over (docs/07 §7).
 *
 * Env : SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_TOKEN (app custom, scopes write_products,
 * write_inventory, read_locations, write_publications, write_files), SHOPIFY_API_VERSION.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const opt = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const DRY = flag("dry-run");
const ONLY = opt("only")?.split(",").filter(Boolean);
const LIMIT = Number(opt("limit") ?? 0);

function loadEnv() {
  const file = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}
loadEnv();

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const VERSION = process.env.SHOPIFY_API_VERSION ?? "2026-07";
if (!DOMAIN || !TOKEN) {
  console.error("SHOPIFY_STORE_DOMAIN et SHOPIFY_ADMIN_TOKEN requis (.env.local)");
  process.exit(1);
}

type Json = Record<string, unknown>;

async function admin<T>(query: string, variables: Json): Promise<T> {
  for (let attempt = 1; attempt <= 5; attempt++) {
    const res = await fetch(`https://${DOMAIN}/admin/api/${VERSION}/graphql.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": TOKEN! },
      body: JSON.stringify({ query, variables }),
    });
    const json = (await res.json()) as { data?: T; errors?: { message: string; extensions?: { code?: string } }[] };
    const throttled = json.errors?.some((e) => e.extensions?.code === "THROTTLED");
    if (throttled || res.status === 429) {
      await new Promise((r) => setTimeout(r, 2000 * attempt));
      continue;
    }
    if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join("; "));
    if (!json.data) throw new Error(`Réponse vide (${res.status})`);
    return json.data;
  }
  throw new Error("Throttled après 5 tentatives");
}

const PRODUCT_SET = /* GraphQL */ `
  mutation UpsertProduct($handle: String!, $input: ProductSetInput!, $locationId: ID!) {
    productSet(identifier: { handle: $handle }, input: $input, synchronous: true) {
      product {
        id handle status
        variants(first: 20) {
          nodes {
            id sku
            inventoryItem { id inventoryLevel(locationId: $locationId) { quantities(names: ["available"]) { quantity } } }
          }
        }
        media(first: 20) { nodes { id } }
        analiza: metafield(namespace: "aromatarius", key: "analiza_pdf") { id }
      }
      userErrors { field message code }
    }
  }
`;
// API 2026-07 : @idempotent obligatoire, clé unique par appel
const INVENTORY_SET = /* GraphQL */ `
  mutation SetInventory($input: InventorySetQuantitiesInput!, $key: String!) {
    inventorySetQuantities(input: $input) @idempotent(key: $key) { userErrors { field message code } }
  }
`;
const MEDIA_CREATE = /* GraphQL */ `
  mutation AddMedia($productId: ID!, $media: [CreateMediaInput!]!) {
    productCreateMedia(productId: $productId, media: $media) { media { status } mediaUserErrors { field message code } }
  }
`;
const FILE_CREATE = /* GraphQL */ `
  mutation CreateFiles($files: [FileCreateInput!]!) {
    fileCreate(files: $files) { files { id fileStatus } userErrors { field message code } }
  }
`;
const METAFIELDS_SET = /* GraphQL */ `
  mutation SetMetafields($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) { userErrors { field message code } }
  }
`;
const MEDIA_DELETE = /* GraphQL */ `
  mutation DeleteMedia($productId: ID!, $mediaIds: [ID!]!) {
    productDeleteMedia(productId: $productId, mediaIds: $mediaIds) { deletedMediaIds mediaUserErrors { message } }
  }
`;
const PRODUCT_BY_HANDLE = /* GraphQL */ `
  query ProductByHandle($handle: String!) { productByHandle(handle: $handle) { id title } }
`;
const PRODUCT_DELETE = /* GraphQL */ `
  mutation DeleteProduct($input: ProductDeleteInput!) { productDelete(input: $input) { deletedProductId userErrors { message } } }
`;
const PUBLISH = /* GraphQL */ `
  mutation Publish($id: ID!, $input: [PublicationInput!]!) {
    publishablePublish(id: $id, input: $input) { userErrors { field message } }
  }
`;
const SETUP = /* GraphQL */ `
  query Setup {
    locations(first: 1) { nodes { id name } }
    publications(first: 20) { nodes { id name } }
  }
`;

type ImportProduct = {
  handle: string;
  analizaPdfUrl: string | null;
  images: { src: string; alt: string }[];
  input: Json & { status: string; variants: (Json & { _stock: number | null })[] };
};

async function deleteProducts(handles: string[]) {
  for (const handle of handles) {
    const q = await admin<{ productByHandle: { id: string; title: string } | null }>(PRODUCT_BY_HANDLE, { handle });
    if (!q.productByHandle) {
      console.log(`· ${handle}: introuvable`);
      continue;
    }
    if (DRY) {
      console.log(`· ${handle}: serait supprimé (${q.productByHandle.title})`);
      continue;
    }
    const d = await admin<{ productDelete: { deletedProductId: string | null; userErrors: { message: string }[] } }>(PRODUCT_DELETE, { input: { id: q.productByHandle.id } });
    console.log(d.productDelete.deletedProductId ? `✔ supprimé ${handle}` : `✖ ${handle}: ${d.productDelete.userErrors.map((e) => e.message).join("; ")}`);
  }
}

async function main() {
  const toDelete = opt("delete")?.split(",").filter(Boolean);
  if (toDelete?.length) return deleteProducts(toDelete);
  const all: ImportProduct[] = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "shopify-import.json"), "utf8"));
  let products = ONLY ? all.filter((p) => ONLY.includes(p.handle)) : all;
  if (LIMIT) products = products.slice(0, LIMIT);
  console.log(`${products.length} produit(s) à importer${DRY ? " (dry-run)" : ""}`);

  const setup = await admin<{ locations: { nodes: { id: string; name: string }[] }; publications: { nodes: { id: string; name: string }[] } }>(SETUP, {});
  const locationId = setup.locations.nodes[0].id;
  const publicationIds = setup.publications.nodes
    .filter((p) => /Boutique en ligne|Online Store|Aromatarius Next\.js|Headless/i.test(p.name))
    .map((p) => p.id);
  console.log(`Location: ${setup.locations.nodes[0].name}, publications: ${publicationIds.length}`);

  const log: string[] = [];
  let ok = 0;
  for (const p of products) {
    const { variants, ...rest } = p.input;
    const cleanVariants = variants.map((v) => {
      const copy: Json = { ...v };
      for (const k of Object.keys(copy)) if (k.startsWith("_")) delete copy[k];
      return copy;
    });
    const input = { ...rest, variants: cleanVariants };
    if (DRY) {
      console.log(`· ${p.handle} (${variants.length} var., ${p.images.length} img, pdf=${p.analizaPdfUrl ? "oui" : "non"})`);
      continue;
    }
    try {
      const r = await admin<{
        productSet: {
          product: {
            id: string;
            variants: {
              nodes: { sku: string; inventoryItem: { id: string; inventoryLevel: { quantities: { quantity: number }[] } | null } }[];
            };
            media: { nodes: { id: string }[] };
            analiza: { id: string } | null;
          } | null;
          userErrors: { field: string[]; message: string; code: string }[];
        };
      }>(PRODUCT_SET, { handle: p.handle, input, locationId });
      if (r.productSet.userErrors.length || !r.productSet.product) {
        log.push(`✖ ${p.handle}: ${r.productSet.userErrors.map((e) => `${e.field?.join(".")} ${e.message}`).join("; ")}`);
        console.log(log.at(-1));
        continue;
      }
      const product = r.productSet.product;

      // Stock par SKU
      const quantities = product.variants.nodes
        .map((node) => {
          const source = variants.find((v) => v.sku === node.sku);
          if (!source || source._stock == null) return null;
          const current = node.inventoryItem.inventoryLevel?.quantities[0]?.quantity ?? 0;
          return { inventoryItemId: node.inventoryItem.id, locationId, quantity: source._stock, changeFromQuantity: current };
        })
        .filter((q): q is NonNullable<typeof q> => !!q);
      if (quantities.length) {
        const inv = await admin<{ inventorySetQuantities: { userErrors: { message: string }[] } }>(INVENTORY_SET, {
          input: { name: "available", reason: "correction", quantities },
          key: crypto.randomUUID(),
        });
        if (inv.inventorySetQuantities.userErrors.length) log.push(`  ! stock ${p.handle}: ${inv.inventorySetQuantities.userErrors.map((e) => e.message).join("; ")}`);
      }

      // Images (uniquement si le produit n'a pas encore de média, ou --replace-media)
      if (flag("replace-media") && product.media.nodes.length) {
        await admin(MEDIA_DELETE, { productId: product.id, mediaIds: product.media.nodes.map((m) => m.id) });
        product.media.nodes = [];
      }
      if (!flag("skip-media") && p.images.length && product.media.nodes.length === 0) {
        const m = await admin<{ productCreateMedia: { mediaUserErrors: { message: string }[] } }>(MEDIA_CREATE, {
          productId: product.id,
          media: p.images.map((img) => ({ mediaContentType: "IMAGE", originalSource: img.src, alt: img.alt })),
        });
        if (m.productCreateMedia.mediaUserErrors.length) log.push(`  ! media ${p.handle}: ${m.productCreateMedia.mediaUserErrors.map((e) => e.message).join("; ")}`);
      }

      // PDF d'analyse -> Files API -> metafield analiza_pdf (uniquement si absent)
      if (!flag("skip-pdf") && p.analizaPdfUrl && !product.analiza) {
        const f = await admin<{ fileCreate: { files: { id: string }[]; userErrors: { message: string }[] } }>(FILE_CREATE, {
          files: [{ originalSource: p.analizaPdfUrl, contentType: "FILE", alt: `Analiza GC/MS ${p.handle}` }],
        });
        const fileId = f.fileCreate.files[0]?.id;
        if (fileId) {
          await admin(METAFIELDS_SET, {
            metafields: [{ ownerId: product.id, namespace: "aromatarius", key: "analiza_pdf", type: "file_reference", value: fileId }],
          });
        } else log.push(`  ! pdf ${p.handle}: ${f.fileCreate.userErrors.map((e) => e.message).join("; ")}`);
      }

      // Publication (produits actifs uniquement)
      if (p.input.status === "ACTIVE") {
        await admin(PUBLISH, { id: product.id, input: publicationIds.map((publicationId) => ({ publicationId })) });
      }
      ok++;
      console.log(`✔ ${p.handle}`);
    } catch (e) {
      log.push(`✖ ${p.handle}: ${e instanceof Error ? e.message : String(e)}`);
      console.log(log.at(-1));
    }
  }
  fs.writeFileSync(path.join(process.cwd(), "data", "import-log.txt"), log.join("\n"));
  console.log(`\n${ok}/${products.length} importés. ${log.length} avertissement(s) dans data/import-log.txt`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

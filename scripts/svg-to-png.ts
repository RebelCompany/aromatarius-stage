/**
 * pnpm tsx scripts/svg-to-png.ts
 * Convertit les visuels SVG de démo en PNG 1200x1200 (Shopify n'accepte pas le SVG
 * comme image produit). Sortie : data/product-images/<handle>.png (gitignored).
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const src = path.join(process.cwd(), "public", "images", "products");
const out = path.join(process.cwd(), "data", "product-images");
fs.mkdirSync(out, { recursive: true });

async function main() {
  const files = fs.readdirSync(src).filter((f) => f.endsWith(".svg"));
  for (const file of files) {
    const png = path.join(out, file.replace(/\.svg$/, ".png"));
    await sharp(fs.readFileSync(path.join(src, file)), { density: 200 })
      .resize(1200, 1200, { fit: "contain", background: "#fbf9f4" })
      .png({ compressionLevel: 9 })
      .toFile(png);
    console.log(`${file} -> ${path.relative(process.cwd(), png)} (${Math.round(fs.statSync(png).size / 1024)} kB)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

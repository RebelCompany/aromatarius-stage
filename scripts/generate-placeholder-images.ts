/**
 * Génère des visuels SVG de démo (flacons) pour le mode mock.
 * Remplacés par les photos Shopify CDN dès l'import du catalogue.
 * Usage : pnpm tsx scripts/generate-placeholder-images.ts
 */
import fs from "node:fs";
import path from "node:path";

const products: Record<string, { color: string; label: string }> = {
  "lawenda-waskolistna-bio": { color: "#7c6fb0", label: "Lawenda" },
  "bergamotka-bio": { color: "#b8c74a", label: "Bergamotka" },
  "mieta-pieprzowa-bio": { color: "#3aa07a", label: "Mięta" },
  "tea-tree-drzewo-herbaciane-bio": { color: "#5b8a3c", label: "Tea tree" },
  "eukaliptus-galkowy-bio": { color: "#4f9c9c", label: "Eukaliptus" },
  "ravintsara-bio": { color: "#2e7d6b", label: "Ravintsara" },
  "cytryna-bio": { color: "#e0c53a", label: "Cytryna" },
  "rozmaryn-ct-cyneol-bio": { color: "#6f8f4f", label: "Rozmaryn" },
  "geranium-rosat-bio": { color: "#c96b8a", label: "Geranium" },
  "cedr-atlaski-bio": { color: "#8b5e3c", label: "Cedr" },
  "pomarancza-bio": { color: "#e8923a", label: "Pomarańcza" },
  "hydrolat-roza-damascenska-bio": { color: "#e5a6b8", label: "Hydrolat" },
  "olej-jojoba-bio": { color: "#d9b463", label: "Jojoba" },
  "olej-ze-slodkich-migdalow-bio": { color: "#e4cf9a", label: "Migdał" },
};

function bottle(color: string, label: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600" role="img" aria-label="${label}">
  <rect width="600" height="600" fill="#fbf9f4"/>
  <ellipse cx="300" cy="520" rx="140" ry="18" fill="#ece4d3"/>
  <rect x="262" y="120" width="76" height="46" rx="6" fill="#1f3d2b"/>
  <rect x="270" y="166" width="60" height="18" fill="#2f5a3f"/>
  <path d="M230 200 Q230 184 246 184 H354 Q370 184 370 200 V470 Q370 500 340 500 H260 Q230 500 230 470 Z" fill="#3b2f2a" opacity="0.92"/>
  <path d="M244 210 Q244 198 256 198 H344 Q356 198 356 210 V462 Q356 486 332 486 H268 Q244 486 244 462 Z" fill="${color}" opacity="0.55"/>
  <rect x="252" y="290" width="96" height="120" rx="4" fill="#fbf9f4"/>
  <rect x="264" y="304" width="72" height="6" rx="3" fill="#1f3d2b"/>
  <rect x="264" y="318" width="52" height="4" rx="2" fill="#5c5b57"/>
  <circle cx="300" cy="360" r="20" fill="${color}"/>
  <rect x="264" y="390" width="72" height="4" rx="2" fill="#5c5b57"/>
  <text x="300" y="560" text-anchor="middle" font-family="Georgia, serif" font-size="26" fill="#1f3d2b">${label}</text>
</svg>`;
}

const outDir = path.join(process.cwd(), "public", "images", "products");
fs.mkdirSync(outDir, { recursive: true });
for (const [handle, { color, label }] of Object.entries(products)) {
  fs.writeFileSync(path.join(outDir, `${handle}.svg`), bottle(color, label), "utf8");
}
console.log(`${Object.keys(products).length} visuels générés dans public/images/products`);

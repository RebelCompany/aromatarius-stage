/**
 * pnpm migrate:redirects
 * Vérifie data/redirects.csv (doublons, chaînes, boucles) et affiche un résumé.
 * next.config.ts lit directement le CSV ; ce script sert de contrôle qualité
 * avant cut-over (docs/07 §6). Le test Playwright de toutes les anciennes URLs
 * vient s'ajouter en semaine 3.
 */
import fs from "node:fs";
import path from "node:path";

const file = path.join(process.cwd(), "data", "redirects.csv");
const lines = fs
  .readFileSync(file, "utf8")
  .split(/\r?\n/)
  .slice(1)
  .filter((l) => l.trim() && !l.startsWith("#"));

const map = new Map<string, string>();
let errors = 0;
for (const line of lines) {
  const [source, destination, status] = line.split(",").map((s) => s.trim());
  if (!source?.startsWith("/") || !destination?.startsWith("/")) {
    console.error(`✖ ligne invalide: ${line}`);
    errors++;
    continue;
  }
  if (status && !["301", "302", "410"].includes(status)) {
    console.error(`✖ statut invalide (${status}): ${line}`);
    errors++;
  }
  if (map.has(source)) {
    console.error(`✖ doublon: ${source}`);
    errors++;
  }
  map.set(source, destination);
}
for (const [source, destination] of map) {
  if (map.has(destination)) {
    console.error(`✖ chaîne de redirection: ${source} -> ${destination} -> ${map.get(destination)}`);
    errors++;
  }
  if (source === destination) {
    console.error(`✖ boucle: ${source}`);
    errors++;
  }
}
if (errors) process.exit(1);
console.log(`✔ ${map.size} redirections valides (limite Vercel: 2048).`);

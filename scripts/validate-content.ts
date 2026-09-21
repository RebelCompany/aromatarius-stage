/**
 * pnpm content:validate
 * Valide le frontmatter de tous les MDX (zod) et détecte les formulations
 * médicales interdites (docs/04, conformité santé). Échoue en CI si invalide.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { ZodType } from "zod";
import {
  blogFrontmatterSchema,
  forbiddenHealthClaims,
  kompendiumFrontmatterSchema,
  pageFrontmatterSchema,
  recepturaFrontmatterSchema,
} from "../src/lib/content/schema";

const root = path.join(process.cwd(), "content");
const dirs: [string, ZodType][] = [
  ["blog", blogFrontmatterSchema],
  ["receptury", recepturaFrontmatterSchema],
  ["kompendium", kompendiumFrontmatterSchema],
  ["pages", pageFrontmatterSchema],
];

let errors = 0;
let files = 0;

for (const [dir, schema] of dirs) {
  const full = path.join(root, dir);
  if (!fs.existsSync(full)) continue;
  for (const file of fs.readdirSync(full).filter((f) => f.endsWith(".mdx"))) {
    files++;
    const raw = fs.readFileSync(path.join(full, file), "utf8");
    const { data, content } = matter(raw);
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      errors++;
      console.error(`✖ content/${dir}/${file}`);
      for (const issue of parsed.error.issues) console.error(`   ${issue.path.join(".")}: ${issue.message}`);
      continue;
    }
    const slug = (data as { slug?: string }).slug;
    if (slug && `${slug}.mdx` !== file) {
      errors++;
      console.error(`✖ content/${dir}/${file}: slug "${slug}" ne correspond pas au nom du fichier`);
    }
    const text = `${JSON.stringify(data)} ${content}`;
    for (const re of forbiddenHealthClaims) {
      const m = text.match(re);
      if (m) {
        errors++;
        console.error(`✖ content/${dir}/${file}: formulation interdite "${m[0]}" (docs/04 conformité santé)`);
      }
    }
    if (/—/.test(text)) {
      errors++;
      console.error(`✖ content/${dir}/${file}: tiret cadratin interdit (règle 8)`);
    }
  }
}

if (errors) {
  console.error(`\n${errors} erreur(s) dans ${files} fichier(s).`);
  process.exit(1);
}
console.log(`✔ ${files} fichiers MDX valides.`);

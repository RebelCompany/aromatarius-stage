import { z } from "zod";

/**
 * Schémas zod du frontmatter MDX (règle 9 de CLAUDE.md).
 * `pnpm content:validate` et le build échouent si un fichier est invalide.
 */

/** YAML convertit les dates non citées en Date : on normalise en "YYYY-MM-DD". */
const isoDate = z.preprocess(
  (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v),
  z.string().regex(/^\d{4}-\d{2}-\d{2}/, "Date ISO attendue (YYYY-MM-DD)"),
);
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug : minuscules, chiffres et tirets");

export const faqItemSchema = z.object({
  q: z.string().min(5),
  a: z.string().min(5),
});

export const baseFrontmatterSchema = z.object({
  title: z.string().min(5).max(120),
  description: z.string().min(50).max(200),
  slug,
  publishedAt: isoDate,
  updatedAt: isoDate,
  author: z.string().default("bogusia"),
  category: z.string().min(2),
  tags: z.array(z.string()).default([]),
  /** handles Shopify résolus par l'adapter au rendu */
  relatedProducts: z.array(z.string()).default([]),
  faq: z.array(faqItemSchema).default([]),
  cover: z.string().nullable().default(null),
  draft: z.boolean().default(false),
});

export const blogFrontmatterSchema = baseFrontmatterSchema.extend({
  sources: z.array(z.string()).default([]),
});

export const recepturaFrontmatterSchema = baseFrontmatterSchema.extend({
  /** Problème / potrzeba ("sen", "stres"...) pour le lien avec les collections /na/* */
  problem: z.string().min(2),
  /** Réponse directe (2 à 3 phrases), citée par les moteurs IA */
  directAnswer: z.string().min(40).max(400),
  products: z
    .array(
      z.object({
        handle: z.string(),
        ml: z.number().int().positive().default(10),
        drops: z.number().int().positive(),
      }),
    )
    .min(1),
  extras: z.array(z.string()).default([]),
  steps: z.array(z.string().min(5)).min(1),
  usage: z.string().min(10),
  precautions: z.array(z.string()).min(1),
  totalTime: z.string().optional(),
  relatedRecipes: z.array(z.string()).default([]),
});

export const kompendiumFrontmatterSchema = baseFrontmatterSchema.extend({
  /** handle du produit Shopify correspondant */
  productHandle: z.string().nullable().default(null),
  directAnswer: z.string().min(40).max(400),
  card: z.object({
    nazwaLacinska: z.string(),
    rodzina: z.string(),
    chemotyp: z.string().nullable().default(null),
    czescRosliny: z.string(),
    metoda: z.string(),
    pochodzenie: z.string(),
    glowneSkladniki: z.array(z.string()).default([]),
  }),
  dosage: z
    .array(z.object({ metoda: z.string(), dawka: z.string() }))
    .default([]),
  pairsWith: z.array(z.string()).default([]),
  recipes: z.array(z.string()).default([]),
  sources: z.array(z.string()).default([]),
});

export const pageFrontmatterSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(30).max(200),
  slug,
  updatedAt: isoDate,
  /** "about" pour AboutPage schema, sinon WebPage */
  kind: z.enum(["page", "about", "legal", "quality", "contact"]).default("page"),
  toc: z.boolean().default(false),
});

export type BlogFrontmatter = z.infer<typeof blogFrontmatterSchema>;
export type RecepturaFrontmatter = z.infer<typeof recepturaFrontmatterSchema>;
export type KompendiumFrontmatter = z.infer<typeof kompendiumFrontmatterSchema>;
export type PageFrontmatter = z.infer<typeof pageFrontmatterSchema>;

/**
 * Règles de conformité santé (docs/04) : formulations interdites.
 * Vérifiées par `pnpm content:validate` sur le corps du MDX.
 */
export const forbiddenHealthClaims = [
  /\bleczy\b/i,
  /\bwyleczy\b/i,
  /\blek na\b/i,
  /\bzastępuje leczenie\b/i,
  /\bgwarantuje wyleczenie\b/i,
];

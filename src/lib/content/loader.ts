import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { z } from "zod";
import {
  blogFrontmatterSchema,
  kompendiumFrontmatterSchema,
  pageFrontmatterSchema,
  recepturaFrontmatterSchema,
  type BlogFrontmatter,
  type KompendiumFrontmatter,
  type PageFrontmatter,
  type RecepturaFrontmatter,
} from "./schema";

const CONTENT_ROOT = path.join(process.cwd(), "content");

export type ContentEntry<T> = {
  frontmatter: T;
  body: string;
  readingMinutes: number;
  file: string;
};

async function listMdx(dir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(path.join(CONTENT_ROOT, dir));
    return entries.filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));
  } catch {
    return [];
  }
}

async function loadDir<S extends z.ZodTypeAny>(
  dir: string,
  schema: S,
): Promise<ContentEntry<z.infer<S>>[]> {
  const files = await listMdx(dir);
  const entries = await Promise.all(
    files.map(async (file) => {
      const raw = await fs.readFile(path.join(CONTENT_ROOT, dir, file), "utf8");
      const { data, content } = matter(raw);
      const parsed = schema.safeParse(data);
      if (!parsed.success) {
        throw new Error(
          `Frontmatter invalide dans content/${dir}/${file}:\n${parsed.error.issues
            .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
            .join("\n")}`,
        );
      }
      return {
        frontmatter: parsed.data as z.infer<S>,
        body: content,
        readingMinutes: Math.max(1, Math.round(readingTime(content).minutes)),
        file,
      };
    }),
  );
  return entries;
}

function published<T extends { draft?: boolean; publishedAt?: string }>(entries: ContentEntry<T>[]) {
  return entries
    .filter((e) => !e.frontmatter.draft || process.env.NODE_ENV !== "production")
    .sort((a, b) => (b.frontmatter.publishedAt ?? "").localeCompare(a.frontmatter.publishedAt ?? ""));
}

/* ---------- Blog ---------- */

export async function getBlogPosts(): Promise<ContentEntry<BlogFrontmatter>[]> {
  return published(await loadDir("blog", blogFrontmatterSchema));
}

export async function getBlogPost(slug: string): Promise<ContentEntry<BlogFrontmatter> | null> {
  return (await getBlogPosts()).find((p) => p.frontmatter.slug === slug) ?? null;
}

/* ---------- Receptury ---------- */

export async function getRecipes(): Promise<ContentEntry<RecepturaFrontmatter>[]> {
  return published(await loadDir("receptury", recepturaFrontmatterSchema));
}

export async function getRecipe(slug: string): Promise<ContentEntry<RecepturaFrontmatter> | null> {
  return (await getRecipes()).find((p) => p.frontmatter.slug === slug) ?? null;
}

export async function getRecipesBySlugs(slugs: string[]): Promise<ContentEntry<RecepturaFrontmatter>[]> {
  const all = await getRecipes();
  return slugs.map((s) => all.find((r) => r.frontmatter.slug === s)).filter((r): r is NonNullable<typeof r> => !!r);
}

/* ---------- Kompendium ---------- */

export async function getKompendiumEntries(): Promise<ContentEntry<KompendiumFrontmatter>[]> {
  const entries = await loadDir("kompendium", kompendiumFrontmatterSchema);
  return entries
    .filter((e) => !e.frontmatter.draft || process.env.NODE_ENV !== "production")
    .sort((a, b) => a.frontmatter.title.localeCompare(b.frontmatter.title, "pl"));
}

export async function getKompendiumEntry(slug: string): Promise<ContentEntry<KompendiumFrontmatter> | null> {
  return (await getKompendiumEntries()).find((p) => p.frontmatter.slug === slug) ?? null;
}

/* ---------- Pages statiques ---------- */

export async function getPages(): Promise<ContentEntry<PageFrontmatter>[]> {
  return loadDir("pages", pageFrontmatterSchema);
}

export async function getPage(slug: string): Promise<ContentEntry<PageFrontmatter> | null> {
  return (await getPages()).find((p) => p.frontmatter.slug === slug) ?? null;
}

/** Tous les contenus, pour le sitemap. */
export async function getAllContentUrls(): Promise<{ path: string; updatedAt: string }[]> {
  const [blog, recipes, kompendium, pages] = await Promise.all([
    getBlogPosts(),
    getRecipes(),
    getKompendiumEntries(),
    getPages(),
  ]);
  return [
    ...blog.map((b) => ({ path: `/blog/${b.frontmatter.slug}`, updatedAt: b.frontmatter.updatedAt })),
    ...recipes.map((r) => ({ path: `/receptury/${r.frontmatter.slug}`, updatedAt: r.frontmatter.updatedAt })),
    ...kompendium.map((k) => ({ path: `/kompendium/${k.frontmatter.slug}`, updatedAt: k.frontmatter.updatedAt })),
    ...pages.map((p) => ({ path: `/${p.frontmatter.slug}`, updatedAt: p.frontmatter.updatedAt })),
  ];
}

import type { MetadataRoute } from "next";
import { getAllContentUrls } from "@/lib/content/loader";
import { needs } from "@/lib/navigation";
import { absoluteUrl } from "@/lib/seo/metadata";
import { getAllProductHandles, getCollections } from "@/lib/shopify";

export const revalidate = 3600;

/** Sitemap avec lastmod réel (Shopify updatedAt / frontmatter updatedAt), docs/04. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections, content] = await Promise.all([
    getAllProductHandles(),
    getCollections(),
    getAllContentUrls(),
  ]);

  const now = new Date();
  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/dobierz"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/blog"), lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: absoluteUrl("/receptury"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/kompendium"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    ...collections
      .filter((c) => !c.handle.startsWith("na-"))
      .map((c) => ({
        url: absoluteUrl(`/${c.handle}`),
        lastModified: new Date(c.updatedAt),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ...needs.map((n) => ({
      url: absoluteUrl(`/na/${n}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: absoluteUrl(`/produkt/${p.handle}`),
      lastModified: new Date(p.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...content.map((c) => ({
      url: absoluteUrl(c.path),
      lastModified: new Date(c.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}

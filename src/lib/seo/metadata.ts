import type { Metadata } from "next";
import { isNoindex } from "./noindex";

/** SITE_URL explicite, sinon l'URL de prod Vercel (*.vercel.app), sinon localhost. */
export const SITE_URL = (
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null) ??
  "http://localhost:3000"
).replace(/\/$/, "");
export const SITE_NAME = "Aromatarius";

type BuildMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: { url: string; width?: number; height?: number; alt?: string } | null;
  type?: "website" | "article";
  noindex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
};

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Tronque une description à 155 caractères sur un mot entier. */
export function clampDescription(text: string, max = 155): string {
  const clean = text.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

/**
 * generateMetadata obligatoire sur chaque page (règle 4 de CLAUDE.md).
 * Produit title, description, canonical, openGraph, alternates.
 */
export function buildMetadata(input: BuildMetadataInput): Metadata {
  const canonical = absoluteUrl(input.path);
  const description = clampDescription(input.description);
  const ogImage = input.image
    ? {
        url: absoluteUrl(input.image.url),
        width: input.image.width ?? 1200,
        height: input.image.height ?? 630,
        alt: input.image.alt ?? input.title,
      }
    : { url: absoluteUrl("/opengraph-image"), width: 1200, height: 630, alt: SITE_NAME };

  return {
    title: input.title,
    description,
    alternates: { canonical, languages: { pl: canonical, "x-default": canonical } },
    openGraph: {
      title: input.title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "pl_PL",
      type: input.type ?? "website",
      images: [ogImage],
      ...(input.type === "article"
        ? { publishedTime: input.publishedTime, modifiedTime: input.modifiedTime, authors: ["Bogusia"] }
        : {}),
    },
    twitter: { card: "summary_large_image", title: input.title, description, images: [ogImage.url] },
    robots:
      input.noindex || isNoindex() ? { index: false, follow: !isNoindex() } : { index: true, follow: true },
  };
}

import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/metadata";
import { isNoindex } from "@/lib/seo/noindex";

/**
 * Allow all + autorisation explicite des crawlers IA (docs/04).
 * SITE_NOINDEX=1 (preview client) : tout est bloqué. À retirer au lancement.
 */
export default function robots(): MetadataRoute.Robots {
  if (isNoindex()) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  const disallow = ["/koszyk", "/konto", "/szukaj", "/api/"];
  const aiBots = ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended", "Applebot-Extended"];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      ...aiBots.map((userAgent) => ({ userAgent, allow: "/", disallow })),
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}

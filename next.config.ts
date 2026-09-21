import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

/**
 * Redirections : règles génériques (docs/07 §6) + table data/redirects.csv
 * (source,destination,status). Vercel accepte jusqu'à 2 048 redirections statiques.
 */
function csvRedirects(): { source: string; destination: string; permanent: boolean }[] {
  const file = path.join(process.cwd(), "data", "redirects.csv");
  if (!fs.existsSync(file)) return [];
  return fs
    .readFileSync(file, "utf8")
    .split(/\r?\n/)
    .slice(1)
    .filter((line) => line.trim() && !line.startsWith("#"))
    .map((line) => {
      const [source, destination, status] = line.split(",").map((s) => s.trim());
      return { source, destination, permanent: status !== "302" };
    })
    .filter((r) => r.source && r.destination && r.source !== r.destination);
}

const nextConfig: NextConfig = {
  trailingSlash: false,
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "cdn.shopify.com" }],
    // SVG de démo en mode mock uniquement ; les images prod viennent du CDN Shopify
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Preview client : SITE_NOINDEX=1. À retirer avant le lancement (docs/07 §7).
          ...(process.env.SITE_NOINDEX === "1" ? [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] : []),
          ...(process.env.NODE_ENV === "production"
            ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
            : []),
        ],
      },
    ];
  },
  async redirects() {
    const generic = [
      { source: "/kategoria-produktu/olejki-eteryczne", destination: "/olejki-eteryczne", permanent: true },
      { source: "/kategoria-produktu/receptury", destination: "/receptury", permanent: true },
      { source: "/kategoria-produktu/kompendium", destination: "/kompendium", permanent: true },
      { source: "/kategoria-produktu/:cat", destination: "/:cat", permanent: true },
      { source: "/shop-default", destination: "/olejki-eteryczne", permanent: true },
      { source: "/shop", destination: "/olejki-eteryczne", permanent: true },
      { source: "/shop/cart", destination: "/koszyk", permanent: true },
      { source: "/shop/checkout", destination: "/koszyk", permanent: true },
      { source: "/shop/my-account", destination: "/konto", permanent: true },
      { source: "/shop-info/contact", destination: "/kontakt", permanent: true },
      { source: "/aromatyczne-promocje", destination: "/promocje", permanent: true },
      { source: "/contact", destination: "/kontakt", permanent: true },
      { source: "/lista-zyczen", destination: "/konto", permanent: true },
      { source: "/newsletter", destination: "/#newsletter", permanent: true },
      { source: "/tag/:path*", destination: "/blog", permanent: true },
      { source: "/author/:path*", destination: "/o-nas", permanent: true },
      { source: "/page/:n", destination: "/olejki-eteryczne", permanent: true },
    ];
    return [...csvRedirects(), ...generic];
  },
};

export default nextConfig;

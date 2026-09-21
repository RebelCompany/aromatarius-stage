import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import Script from "next/script";
import { GoogleTagManager } from "@next/third-parties/google";
import "./globals.css";
import { pl } from "@/i18n/pl";
import { consentDefaultScript } from "@/lib/analytics/consent";
import { SITE_NAME, SITE_URL } from "@/lib/seo/metadata";
import { organizationSchema, websiteSchema } from "@/lib/seo/schema";
import { getShopInfo } from "@/lib/shopify";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { ConsentBanner } from "@/components/layout/ConsentBanner";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { JsonLd } from "@/components/seo/JsonLd";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { CartProvider } from "@/components/shop/CartProvider";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter", display: "swap" });
const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${pl.brand.tagline} | ${SITE_NAME}`,
  description: `${pl.brand.tagline}. ${pl.brand.promise}`,
  applicationName: SITE_NAME,
  icons: { icon: "/images/logo.svg" },
};

/** Zoom autorisé (règle 6 : jamais user-scalable=0). */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fbf9f4",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const shop = await getShopInfo();
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <html lang="pl" className={`${inter.variable} ${fraunces.variable} h-full`}>
      <head>
        <link rel="preconnect" href="https://cdn.shopify.com" crossOrigin="anonymous" />
        {/* Consent Mode v2 : défaut "denied" avant tout tag */}
        <Script id="consent-default" strategy="beforeInteractive">
          {consentDefaultScript}
        </Script>
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
      </head>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-leaf-900 focus:px-3 focus:py-2 focus:text-cream-50"
        >
          {pl.nav.skipToContent}
        </a>
        <CartProvider>
          {/* .site-shell glisse vers la gauche quand le menu mobile est ouvert (effet push de la maquette) */}
          <div className="site-shell flex min-h-dvh flex-col">
            <AnnouncementBar threshold={shop.freeShippingThreshold} />
            <Header />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <CartDrawer freeShippingThreshold={shop.freeShippingThreshold} />
        </CartProvider>
        <ConsentBanner />
        {gtmId && <GoogleTagManager gtmId={gtmId} />}
      </body>
    </html>
  );
}

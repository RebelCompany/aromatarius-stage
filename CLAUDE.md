# CLAUDE.md : Aromatarius.pl (refonte headless Shopify)

## Mission

Refonte complète de https://aromatarius.pl (WordPress + Elementor + WooCommerce) en storefront headless Next.js sur backend Shopify. Objectif business : devenir le numéro 1 des ventes d'huiles essentielles en Pologne. Leviers : SEO technique irréprochable, contenu éditorial (blog + receptury + kompendium), UX mobile parfaite, préparation Google Ads.

Client : Bogusia (propriétaire, marque blanche Aromatarius). Développeur : Bogdan (RebelCompany.be). Langue du site : polonais uniquement en V1, EN et DE prévus en phase 2 (architecture i18n-ready dès le départ).

Deadline MVP : 30 septembre 2026. Priorité absolue : ce qui vend et ce qui indexe. Tout le reste va en phase 2 (voir `09-ROADMAP.md`).

## Documents de référence (lire avant de coder)

| Fichier | Contenu |
|---|---|
| `01-AUDIT-SITE-ACTUEL.md` | Ce qui existe, ce qui casse, ce qu'on garde |
| `02-CONCURRENCE-POSITIONNEMENT.md` | Marché polonais, angle de différenciation, messages clés |
| `03-STACK-ARCHITECTURE.md` | Stack, arborescence, adapter Shopify, data flow, hébergement |
| `04-SEO-STRATEGIE.md` | URLs, schema.org, sitemaps, Core Web Vitals, recherche IA, plan de contenu |
| `05-UX-UI-DESIGN-SYSTEM.md` | Tokens, composants, pages, mobile-first, parcours d'achat |
| `06-SHOPIFY-CONFIG.md` | Plan, metafields, metaobjects, collections, apps, paiements, livraison, facturation KSeF, Omnibus |
| `07-MIGRATION-WOO-VERS-SHOPIFY.md` | Export, import, redirections 301, bascule DNS, checklist cut-over |
| `08-GOOGLE-ADS-PREP.md` | GA4, GSC, Consent Mode v2, feed Merchant Center, structure de campagnes |
| `09-ROADMAP.md` | 4 semaines, MVP vs phase 2, critères de done |

## Stack (résumé, détail dans 03)

- Next.js App Router (dernière stable), TypeScript strict, React Server Components par défaut
- Tailwind CSS v4, shadcn/ui, Motion (animations légères uniquement)
- Shopify Storefront API + Customer Account API via le nouveau SDK Hydrogen (developer preview, bindings Next.js), **toujours encapsulé** dans `src/lib/shopify/` derrière une interface maison (voir règle "Adapter" ci-dessous)
- Blog et pages éditoriales : MDX dans le repo (`content/`), frontmatter validé par zod, rendu via `next-mdx-remote` (RSC)
- Hébergement : Vercel (ISR + edge), checkout sur `checkout.aromatarius.pl` (Shopify)
- Avis : Judge.me (API + widget headless)
- Analytics : GA4 via GTM, Consent Mode v2, Shopify Customer Privacy API pour le consentement
- Tests : Vitest (unit), Playwright (e2e sur PLP, PDP, cart, checkout handoff)

## Commandes

```bash
pnpm install
pnpm dev                 # http://localhost:3000
pnpm build && pnpm start
pnpm lint && pnpm typecheck
pnpm test                # vitest
pnpm test:e2e            # playwright
pnpm shopify:codegen     # génère les types Storefront API (gql.tada)
pnpm content:validate    # valide le frontmatter de tous les MDX
pnpm migrate:redirects   # génère redirects depuis data/redirects.csv
```

Package manager : pnpm. Node 22 LTS.

## Variables d'environnement

```
SHOPIFY_STORE_DOMAIN=xxxx.myshopify.com
SHOPIFY_STOREFRONT_PUBLIC_TOKEN=
SHOPIFY_STOREFRONT_PRIVATE_TOKEN=
SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID=
SHOPIFY_CUSTOMER_ACCOUNT_API_URL=
SHOPIFY_REVALIDATION_SECRET=      # webhook products/update -> revalidateTag
SITE_URL=https://aromatarius.pl
NEXT_PUBLIC_GTM_ID=
JUDGEME_API_TOKEN=
JUDGEME_SHOP_DOMAIN=
SESSION_SECRET=
```

Jamais de secret commité. `.env.example` maintenu à jour.

## Règles de code (non négociables)

1. **Adapter Shopify.** Aucun import de `@shopify/hydrogen` ni aucun appel GraphQL en dehors de `src/lib/shopify/`. Les pages et composants consomment uniquement les fonctions exportées par `src/lib/shopify/index.ts` (`getProduct`, `getCollection`, `getCollectionProducts`, `searchProducts`, `getCart`, `addToCart`, `updateCartLine`, `removeCartLine`, `getCheckoutUrl`, `getShopInfo`, `getReceptury`, `getMetaobject`). Types métier définis dans `src/lib/shopify/types.ts` (jamais les types bruts Shopify hors de l'adapter). Si le SDK preview casse, on réécrit l'intérieur de l'adapter avec des appels Storefront API directs sans toucher au reste.
2. **Server first.** RSC par défaut. `"use client"` seulement pour : cart drawer, sélecteur de variante, galerie, recherche prédictive, menu mobile, consent banner. Pas de fetch Shopify côté client sauf mutations panier.
3. **Cache.** `fetch` Shopify avec `next: { tags: ['products', 'product:<handle>', 'collection:<handle>'] }`. Revalidation par webhook Shopify (`/api/revalidate`) + fallback `revalidate = 3600`. Panier : jamais caché.
4. **SEO dans chaque page.** `generateMetadata` obligatoire (title, description, canonical, openGraph, alternates). JSON-LD via composant `<JsonLd />` typé avec `schema-dts`. Voir `04-SEO-STRATEGIE.md` pour le mapping page → schema.
5. **Images.** `next/image` avec `remotePatterns` cdn.shopify.com, `sizes` renseigné, `priority` uniquement sur le LCP. Format webp/avif via Shopify CDN params.
6. **Accessibilité.** Zoom autorisé (jamais `user-scalable=0`), focus visible, labels sur tous les inputs, contraste AA, `lang="pl"`.
7. **Performance.** Budget : LCP < 2.0 s mobile, INP < 200 ms, CLS < 0.05, JS initial < 150 kB gzip sur PDP. Vérifier avec `pnpm build` (analyse bundle) et Lighthouse CI avant chaque merge sur `main`.
8. **Typographie et copy.** Pas de tiret cadratin (—) dans les textes. Utiliser virgule, deux-points ou parenthèses. Devise : `zł` après le montant avec espace insécable (`64,00 zł`), séparateur décimal virgule. Formatage via `Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' })`.
9. **Contenu MDX.** Un fichier = une URL. Frontmatter obligatoire : `title, description, slug, publishedAt, updatedAt, author, category, tags, relatedProducts (handles), faq (optionnel), cover`. Schéma zod dans `src/content/schema.ts`. Build échoue si invalide.
10. **Pas de dépendance non justifiée.** Avant d'ajouter un package, vérifier qu'il n'existe pas déjà dans shadcn/ui, Next.js ou le SDK Hydrogen.
11. **i18n-ready.** Toutes les chaînes UI dans `src/i18n/pl.ts` (objet typé). Pas de texte en dur dans les composants. Routes sans préfixe de locale en V1, mais structure `[locale]` prévue via `next-intl` en phase 2. Les URLs de contenu restent en polonais.
12. **Commits.** Conventional commits (`feat:`, `fix:`, `seo:`, `content:`, `chore:`). Une PR par feature. `main` déployé en prod par Vercel, `develop` en preview.

## Arborescence cible

```
aromatarius/
├── CLAUDE.md
├── docs/                      # les fichiers 01 à 09
├── content/
│   ├── blog/                  # *.mdx
│   ├── receptury/             # *.mdx (recettes gratuites + bundle)
│   └── kompendium/            # *.mdx (fiches encyclopédiques par huile)
├── data/
│   ├── redirects.csv          # old_url,new_url,status
│   └── woo-export/            # exports bruts WooCommerce (gitignored sauf schéma)
├── public/
│   ├── llms.txt
│   └── robots.txt
├── scripts/
│   ├── woo-to-shopify-products.ts
│   ├── woo-posts-to-mdx.ts
│   └── build-redirects.ts
├── src/
│   ├── app/
│   │   ├── (shop)/
│   │   │   ├── page.tsx                        # home
│   │   │   ├── [collection]/page.tsx           # /olejki-eteryczne, /hydrolaty ...
│   │   │   ├── produkt/[handle]/page.tsx
│   │   │   ├── szukaj/page.tsx
│   │   │   ├── koszyk/page.tsx
│   │   │   └── konto/...
│   │   ├── (content)/
│   │   │   ├── blog/[slug]/page.tsx
│   │   │   ├── receptury/[slug]/page.tsx
│   │   │   ├── kompendium/[slug]/page.tsx
│   │   │   └── [page]/page.tsx                 # o-nas, kontakt, regulamin ...
│   │   ├── api/
│   │   │   ├── revalidate/route.ts
│   │   │   ├── cart/route.ts
│   │   │   └── feeds/google-merchant/route.ts
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/            # shadcn
│   │   ├── shop/          # ProductCard, PriceTag, VariantSelector, AddToCart, CartDrawer
│   │   ├── content/       # MDX components, Callout, RecipeCard, FaqBlock
│   │   ├── seo/           # JsonLd, Breadcrumbs
│   │   └── layout/        # Header, MegaMenu, Footer, MobileNav, TrustBar
│   ├── lib/
│   │   ├── shopify/       # ADAPTER (seul endroit qui parle à Shopify)
│   │   ├── content/       # loaders MDX, zod schemas
│   │   ├── seo/           # helpers metadata, schema builders
│   │   └── analytics/     # gtm, consent, events dataLayer
│   ├── i18n/pl.ts
│   └── styles/globals.css # tokens Tailwind v4 (@theme)
└── tests/
```

## Événements analytics (dataLayer)

`view_item_list`, `select_item`, `view_item`, `add_to_cart`, `remove_from_cart`, `view_cart`, `begin_checkout` (au handoff vers Shopify), `search`, `sign_up`, `newsletter_signup`. `purchase` est envoyé depuis le checkout Shopify (app Google & YouTube ou web pixel), pas depuis Next.js. Détail dans `08-GOOGLE-ADS-PREP.md`.

## Ce que Claude Code ne doit PAS faire

- Créer un checkout custom (le checkout reste Shopify)
- Stocker des données produit en base locale (Shopify est la source de vérité)
- Utiliser localStorage pour le panier (cart ID en cookie httpOnly géré par l'adapter)
- Ajouter un CMS (le contenu est en MDX, décision validée)
- Générer du texte médical affirmatif (voir règles de rédaction dans `04-SEO-STRATEGIE.md`, section "Conformité santé")
- Toucher au DNS ou à la prod sans checklist `07-MIGRATION` validée

## Skills Hydrogen

À l'installation du SDK, les skills sont copiés dans `.claude/skills/`. Les utiliser pour : setup client Storefront, cart handlers, product page, collection browsing, analytics, Shop Pay. Toujours vérifier que le code généré respecte la règle Adapter (déplacer dans `src/lib/shopify/` si le skill génère ailleurs).

# 03 : Stack et architecture

## Décisions validées

| Sujet | Choix | Raison |
|---|---|---|
| Backend commerce | Shopify (plan Basic, 109 zł/mois ou 79 zł en annuel) | Produits, variantes, stock, checkout, paiements, clients, Markets. Storefront API disponible sur tous les plans. |
| Front | Next.js App Router, TypeScript, RSC | Stack connue de Bogdan (eddysports), SEO natif (SSR/ISR), écosystème |
| Commerce SDK | Nouveau Hydrogen (developer preview, framework-agnostic, bindings Next.js) encapsulé dans un adapter | Primitives panier/produit/analytics prêtes, skills pour Claude Code. Preview = risque, donc adapter obligatoire |
| Hébergement front | Vercel | ISR, edge, image optimization, preview deployments. Hobby pour le dev, Pro (20 $/mois) en prod |
| Checkout | Shopify sur `checkout.aromatarius.pl` | Jamais de checkout custom |
| Contenu | MDX dans le repo, rédigé par Bogdan via Claude Code | Pas de CMS, décision validée. Bogusia relit sur preview Vercel |
| Style | Tailwind v4 + shadcn/ui | Tokens en CSS, composants accessibles |
| Avis | Judge.me | Import possible, API headless, rich snippets, plan gratuit suffisant au départ |
| Recherche | Storefront API `predictiveSearch` + `search` | Catalogue < 300 références, pas besoin d'Algolia |
| Emails transactionnels | Shopify natif (confirmation, expédition) | Templates à traduire en PL. Newsletter : Shopify Email ou Klaviyo (phase 2) |
| Analytics | GA4 via GTM, Consent Mode v2 | Prérequis Google Ads |

## Pourquoi pas Hydrogen classique sur Oxygen

React Router, hébergement Oxygen imposé, framework nouveau pour Bogdan. Contredit le choix Vercel et la réutilisation des acquis Next.js.

## Pourquoi le SDK preview malgré la deadline

Il fournit typé et testé : client Storefront (gql.tada, erreurs à la compilation), cart handlers serveur, `CartProvider/useCart`, `ShopifyScripts` (analytics, consent, Shop Pay), gestion Markets/locale, proxy `/.well-known/` et routes Shopify. Réécrire tout ça à la main coûte plus que le risque de preview. Le risque est contenu par l'adapter : si un breaking change tombe (il y en a eu entre juillet et août 2026 : renommages `createShopifyRequestContext`, suppression d'alias), on fixe l'adapter, pas les pages.

**Règle de sortie** : si au jour 5 du sprint 1 le SDK bloque encore le panier ou le checkout handoff, on bascule l'intérieur de l'adapter sur des appels Storefront API directs (`@shopify/storefront-api-client` + gql.tada). Interface identique, pages intactes.

## Architecture de données

```
Shopify (source de vérité)
  Products + Variants + Metafields
  Collections (manuelles + automatisées par tags)
  Metaobjects : receptura, faq, ingredient, certificate
  Customers, Orders, Discounts, Markets
        │  Storefront API (GraphQL, token public + privé côté serveur)
        │  Customer Account API (OAuth, compte client)
        │  Webhooks products/update, collections/update → /api/revalidate
        ▼
Next.js sur Vercel
  RSC fetch avec cache tags → ISR
  Adapter src/lib/shopify/ (unique point de contact)
  MDX content/ (blog, receptury, kompendium) chargé au build + ISR
  Judge.me API (avis) côté serveur, cache 1h
        │
        ▼
Navigateur
  HTML complet rendu serveur (SEO, IA crawlers)
  Îlots client : cart drawer, variantes, galerie, search, menu, consent
  Handoff checkout → checkout.aromatarius.pl (Shopify)
```

Le contenu MDX référence les produits par `handle` (frontmatter `relatedProducts`). Au rendu, l'adapter résout les handles en produits (prix, dispo, image) : une receptura affiche toujours des prix à jour.

Inversement, un produit Shopify référence ses receptury et articles via le metafield `content.related_slugs` (liste de slugs MDX) ou par tag partagé. Ça évite un CMS et garde les deux mondes liés.

## Rendu et cache

| Route | Stratégie | Revalidation |
|---|---|---|
| `/` | ISR | webhook + 1h |
| `/[collection]` | ISR, `generateStaticParams` sur toutes les collections | webhook + 1h |
| `/produkt/[handle]` | ISR, `generateStaticParams` sur tout le catalogue | webhook `products/update` par tag `product:<handle>` |
| `/blog/[slug]`, `/receptury/[slug]`, `/kompendium/[slug]` | Statique au build (MDX) + résolution produits ISR | déploiement + webhook |
| `/szukaj` | dynamique (searchParams) | no-store |
| `/koszyk`, cart drawer | dynamique | no-store |
| `/konto/*` | dynamique, Customer Account API | no-store |
| `/sitemap.xml`, `/api/feeds/google-merchant` | ISR 1h | cron Vercel quotidien |

## Panier

- Cart créé côté serveur via l'adapter, `cartId` stocké en cookie httpOnly `aromatarius_cart` (30 jours)
- Mutations via Server Actions (`addToCart`, `updateLine`, `removeLine`) exposées par l'adapter, appelées depuis les composants client
- Le drawer lit `useCart` (SDK) ou un store léger (zustand) alimenté par les Server Actions si on bascule en option 2
- `checkoutUrl` du cart Shopify → redirection en navigation complète (pas de router client), domaine `checkout.aromatarius.pl`
- Buyer identity : pays PL, langue PL, email si connecté

## Compte client

Customer Account API (OAuth, nouveau standard Shopify). Routes `/konto/login`, `/konto/zamowienia`, `/konto/adresy`. Le SDK fournit le flow login/logout pour Next.js. MVP : login + historique de commandes. Phase 2 : wishlist, réassort en un clic.

## Sécurité

- Token Storefront privé uniquement côté serveur (RSC, Route Handlers, Server Actions)
- Token public seulement si un appel client est indispensable (recherche prédictive), avec rate limit
- Webhooks vérifiés par HMAC (`SHOPIFY_REVALIDATION_SECRET`)
- Headers : CSP (autoriser cdn.shopify.com, googletagmanager, judge.me), HSTS, X-Frame-Options
- Pas de données personnelles dans les logs Vercel

## Environnements

- `develop` → preview Vercel (Bogusia relit ici), store Shopify de dev (le même store en mode "password protected" avant lancement, puis store de prod)
- `main` → production `aromatarius.pl`
- Domaine : `aromatarius.pl` et `www` → Vercel (redirect www → apex), `checkout.aromatarius.pl` → Shopify (CNAME shops.myshopify.com), emails : SPF/DKIM Shopify ajoutés au DNS existant sans casser le mail actuel

## Dépendances principales

```
next, react, react-dom, typescript
@shopify/hydrogen (preview) + bindings next
gql.tada
tailwindcss@4, @tailwindcss/postcss, class-variance-authority, clsx, tailwind-merge
shadcn/ui (radix), lucide-react
motion (ex framer-motion) : uniquement micro-interactions
next-mdx-remote, gray-matter, zod, reading-time, rehype-slug, rehype-autolink-headings, remark-gfm
schema-dts
zustand (si nécessaire pour le cart en fallback)
vitest, @playwright/test, eslint, prettier
@vercel/analytics, @vercel/speed-insights (facultatif, en complément de GA4)
```

## Coûts mensuels estimés

| Poste | Montant |
|---|---|
| Shopify Basic | 109 zł (79 zł en annuel) |
| Frais passerelle externe (Przelewy24) | 2 % Shopify + commission P24 (environ 1,2 à 1,5 %) |
| Vercel Pro | 20 $ (Hobby possible au lancement si trafic faible, mais sans SLA) |
| Judge.me | 0 à 15 $ |
| App facturation KSeF (iFirma / Fakturownia) | 30 à 80 zł |
| App Apaczka / InPost | 0 à 19 $ |
| Total ordre de grandeur | 300 à 450 zł/mois hors commissions |

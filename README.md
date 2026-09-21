# Aromatarius.pl : storefront headless (Next.js + Shopify)

Refonte de https://aromatarius.pl. Spécifications complètes dans `docs/` (01 à 09) et règles de code dans `CLAUDE.md`.

## Démarrer

```bash
pnpm install
cp .env.example .env.local   # vide = mode démo (catalogue local, panier en mémoire)
pnpm dev                     # http://localhost:3000
```

Sans identifiants Shopify le site tourne en **mode démo** : 14 produits, collections par type et par besoin, panier fonctionnel, contenus MDX. Dès que `SHOPIFY_STORE_DOMAIN` et un token Storefront sont renseignés, l'adapter bascule sur la Storefront API sans changer une ligne des pages.

## Commandes

| Commande | Rôle |
| --- | --- |
| `pnpm dev` / `pnpm build` / `pnpm start` | Next.js |
| `pnpm lint` / `pnpm typecheck` | ESLint, `tsc --noEmit` |
| `pnpm test` | Vitest (unitaires : format, filtres PLP, mappers) |
| `pnpm test:e2e` | Playwright (parcours d'achat, recherche, robots, sitemap) |
| `pnpm content:validate` | Frontmatter zod + conformité santé + tiret cadratin |
| `pnpm migrate:redirects` | Contrôle de `data/redirects.csv` |
| `pnpm images:placeholders` | Regénère les visuels SVG de démo |

## Architecture

- `src/lib/shopify/` : **adapter**, unique point de contact avec Shopify. `index.ts` expose `getProduct`, `getCollection`, `getCollectionProducts`, `searchProducts`, `getCart`, `addToCart`, ... `storefront.ts` = Storefront API directe (décision "règle de sortie" de `docs/03`), `mock.ts` = données de démo. `actions.ts` = Server Actions panier.
- `src/app/[slug]/page.tsx` : résout d'abord une collection Shopify, sinon une page MDX (`content/pages`). Next.js interdit deux segments dynamiques parallèles à la racine, d'où ce résolveur unique au lieu de `(shop)/[collection]` + `(content)/[page]`.
- `src/app/na/[potrzeba]` : collections besoin (`na-sen`, `na-stres`...), landings SEO et Ads.
- `content/` : blog, receptury, kompendium, pages, en MDX validé par zod (`src/lib/content/schema.ts`).
- `src/i18n/pl.ts` : toutes les chaînes UI.
- `src/lib/seo/` : `buildMetadata` (title, description, canonical, OG) et builders JSON-LD typés `schema-dts`.
- `src/lib/analytics/` : dataLayer GA4 et Consent Mode v2.
- `src/app/api/revalidate` : webhook Shopify (HMAC) → `revalidateTag`.

## État (semaine 1 du roadmap, `docs/09`)

Fait : repo, tokens, layout (Header, MegaMenu, MobileNav, Footer, TrustBar, AnnouncementBar), adapter complet avec mode démo, home, PLP avec filtres/tri/pagination, PDP complète (ordre mobile de `docs/05`), cart drawer + page koszyk, recherche, blog, receptury avec RecipeBundle, kompendium, pages légales, sitemap, robots, llms.txt, redirections, Consent Mode v2, JSON-LD (Organization, WebSite, Product, BreadcrumbList, FAQPage, HowTo, ItemList, Article, CollectionPage).

## Preview Vercel (3 septembre 2026)

URL client : https://aromatarius.vercel.app (projet Vercel `aromatarius`, équipe rebelcompany, déployé avec `npx vercel --prod` depuis ce dossier). Variables d'environnement Vercel : identifiants Storefront du canal Headless, `SITE_NOINDEX=1`.

**RAPPEL LANCEMENT : supprimer `SITE_NOINDEX` des variables Vercel (production) et redéployer avant la bascule DNS, puis vérifier `/robots.txt` et l'absence de l'en-tête `X-Robots-Tag`.**

## Semaine 2 : import du catalogue WooCommerce

Pipeline (docs/07) :

1. `pnpm woo:export` : endpoints publics du site actuel (Store API, WP REST, sitemaps Yoast) -> `data/woo-export/`. Le CSV admin `WooCommerce > Produits > Exporter` (toutes colonnes) est copié en `data/woo-export/products.csv` puis converti en `products-csv.json` (stock, promos, attributs, meta Rank Math).
2. `pnpm woo:transform` : `scripts/woo-to-shopify-products.ts` -> `data/shopify-import.json` (162 produits), `data/receptury-source.json` (21 receptury PDF payantes -> MDX gratuits, semaine 3), `data/redirects.csv` (327), `data/tag-mapping.csv` (tags potrzeba:* proposés, à valider par Bogusia), `data/import-report.md`.
3. `pnpm shopify:import [--dry-run] [--only=handle] [--limit=N]` : Admin API avec `SHOPIFY_ADMIN_TOKEN` (app custom). Idempotent (productSet par handle), stock, images (URL Woo), PDF d'analyse (Files API -> metafield `analiza_pdf`), publication. Relançable pour l'import différentiel du cut-over.

Résultat du 3 septembre 2026 : 162/162 importés sans avertissement (109 actifs, 53 DRAFT), PDF d'analyse dans Files, stock réel, produits de démo remplacés ou supprimés, MDX repointés sur les handles réels.

Décisions prises dans le transform : 53 produits numériques (fiszki, kompendium PDF) importés en DRAFT ; receptury retirées du catalogue ; handles = slugs Woo nettoyés (`-2`, `-10-ml`, `-olejek-klasy-terapeutycznej` supprimés, `-bio` ajouté).

## Store Shopify de dev (3 septembre 2026)

Store : `aromatarius-yuefnwv3.myshopify.com` (development store). Configuré via l'Admin API :

- Metaobjects `faq` et `certyfikat`, 24 metafields produit, 6 metafields collection, 1 metafield shop (`free_shipping_threshold`), tous en accès Storefront `PUBLIC_READ`.
- 21 collections (7 par type, 10 par tag `potrzeba:*`, bestsellery, nowości, promocje, zestawy tematyczne) publiées sur la boutique en ligne.
- 14 produits de démo importés depuis `data/shopify-products.json` (généré par `scripts/export-mock-products.ts`), avec variantes, tags, metafields, stocks et cross-sell `pasuje_do`.
- Marché `Polska` (PL, prix TTC), locale `pl` activée (pas encore primaire).

Canal Headless installé (publication « Aromatarius Next.js »), produits et collections publiés dessus, tokens dans `.env.local` et sur Vercel. Reste à faire dans l'admin (impossible par API) : devise PLN, fuseau Europe/Warsaw, locale `pl` primaire, photos produits et PDF d'analyse. Le metafield Omnibus `najnizsza_cena_30` (type money) sera renseigné une fois la devise en PLN.

À faire ensuite : import Woo (`scripts/woo-to-shopify-products.ts`), PDF d'analyse (Files API), Judge.me, Customer Account API, OG images produit, Lighthouse CI, déploiement Vercel `develop`.

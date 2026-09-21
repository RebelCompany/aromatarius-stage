# 07 : Migration WooCommerce → Shopify + Next.js

## Vue d'ensemble

```
Semaine 1 : inventaire URLs + exports bruts + baseline SEO
Semaine 2 : produits et variantes importés, contenu converti en MDX
Semaine 3 : clients importés, redirections générées et testées en preview
Semaine 4 : gel du contenu Woo, import final, cut-over DNS, vérifications
```

Règle : le site Woo reste en ligne et vend jusqu'au jour J. Aucun changement de DNS avant que la checklist de bascule soit verte.

## 1. Inventaire (semaine 1, avant tout)

1. Exporter la liste complète des URLs : sitemap Yoast (`/sitemap_index.xml` et sous-sitemaps), plus crawl Screaming Frog (version gratuite, 500 URLs) ou script Playwright. Sauvegarder dans `data/woo-export/urls.csv` avec type (produit, catégorie, article, page, tag, auteur, attachment).
2. Noter les URLs indexées : `site:aromatarius.pl` (nombre) et, dès que GSC est vérifié pour l'ancien site, export "Pages" de la couverture.
3. Lighthouse mobile home/PLP/PDP, sauvegarde des rapports.
4. Baseline positions sur les mots-clés de 04 (tableau `data/seo-baseline.csv`).

## 2. Exports WooCommerce

| Donnée | Méthode | Fichier |
|---|---|---|
| Produits | WooCommerce > Products > Export (CSV, toutes colonnes, avec meta) + WP REST API `/wp-json/wc/v3/products` (clé API) pour les champs manquants | `products.csv`, `products.json` |
| Images produit | URLs dans le CSV, téléchargement par script vers `data/woo-export/images/` | |
| PDF d'analyse | liens dans les descriptions (`/wp-content/uploads/.../*.pdf`), extraction regex par script | `analyses/` |
| Catégories, tags | inclus dans l'export | |
| Meta Yoast | colonnes `meta:_yoast_wpseo_title` et `_yoast_wpseo_metadesc` si présentes dans l'export | |
| Clients | WooCommerce > Customers export ou plugin "Customer/Order CSV Export" | `customers.csv` |
| Commandes | idem (optionnel, pour l'historique et le calcul LTV) | `orders.csv` |
| Articles de blog | WP REST API `/wp-json/wp/v2/posts?per_page=100&_embed` | `posts.json` |
| Pages légales | `/wp-json/wp/v2/pages` | `pages.json` |
| Newsletter | selon plugin (MailPoet export, Mailchimp) | `subscribers.csv` |
| Avis produits | `/wp-json/wc/v3/products/reviews` | `reviews.json` (a priori vide) |

Base de données complète (`mysqldump`) et `wp-content/uploads` archivés sur le VPS Hostinger comme filet de sécurité.

## 3. Transformation produits (`scripts/woo-to-shopify-products.ts`)

Entrée : `products.json`. Sortie : `shopify-products.csv` au format d'import Shopify (ou appel Admin API GraphQL `productSet` si on préfère).

Étapes du script :

1. Nettoyer le titre : retirer la contenance du titre (`Bergamotka BIO 10 ml` → `Bergamotka BIO`), extraire `10 ml` comme variante.
2. Regrouper les produits qui ne diffèrent que par la contenance (même nom latin ou même base de slug) en un produit avec plusieurs variantes.
3. Générer le handle propre (translittération PL, suppression suffixes `-2`, `-2-2`) et enregistrer `old_slug → new_handle` dans `data/redirects.csv`.
4. Parser la description HTML : extraire vers metafields `nazwa_lacinska` (regex "Nazwa łacińska:"), `rodzina_botaniczna`, `metoda_ekstrakcji` ("Esencja otrzymana przez..."), sections `Prezentacja`, `Właściwości`, `Wpływ psycho-emocjonalny`, `Środki ostrożności` (liste), lien PDF → `analiza_pdf` (upload via Files API), chémotype si présent dans le titre ("CT tymol").
5. Mapper catégories Woo → product_type + tags. Mapping manuel des tags `potrzeba:*` dans `data/tag-mapping.csv` (Bogusia valide : c'est son expertise).
6. Images : renommer en `bergamotka-bio-olejek-eteryczny-1.jpg`, alt text généré "{Nazwa} BIO olejek eteryczny {ml} ml Aromatarius".
7. Prix : conserver. Stock : conserver. Poids : ajouter (5 ml ≈ 30 g, 10 ml ≈ 45 g avec emballage, à confirmer) pour les tarifs Apaczka.
8. SEO : `seo_title` / `seo_description` depuis Yoast si personnalisés, sinon vides (générés par le front).

Validation : import à blanc sur le store en mode test, revue de 10 fiches par Bogusia sur la preview Vercel, correction du script, import complet.

## 4. Contenu vers MDX (`scripts/woo-posts-to-mdx.ts`)

- HTML → Markdown (`turndown` avec règles pour tableaux et images), images téléchargées dans `public/images/blog/` (ou upload vers Shopify Files et référence CDN)
- Frontmatter : `title`, `slug` (identique à l'ancien), `description` (Yoast ou premier paragraphe), `publishedAt`, `updatedAt`, `author: bogusia`, `category`, `tags`, `cover`, `relatedProducts: []` (à compléter à la main), `faq: []`
- Receptury (produits Woo à 15 zł de la catégorie Receptury) → `content/receptury/*.mdx` avec frontmatter `problem`, `products: [{handle, ml, drops}]`, `steps`, `precautions`. Retirer du catalogue Shopify. Relecture conformité santé obligatoire (voir 04).
- Pages légales → `content/pages/*.mdx` (regulamin, polityka-prywatnosci, zwroty, wysylka). Mettre à jour les mentions Shopify, Przelewy24, Apaczka, cookies, KSeF.
- Kompendium Woo (catégorie produit "Kompendium") → vérifier ce que c'est (produits digitaux ? pages ?) et convertir en `content/kompendium/`.

## 5. Clients

Import CSV Shopify (email, prénom, nom, adresses, téléphone, `accepts_marketing` uniquement si consentement prouvé). Les mots de passe ne migrent pas : le Customer Account API envoie un code par email, pas de mot de passe, donc aucune friction. Informer les clients par un email post-lancement ("nowy sklep, ten sam adres, zaloguj się kodem").

Commandes : import via Matrixify si Bogusia veut l'historique dans Shopify (payant, environ 20 $ un mois). Sinon garder l'export Woo pour la compta.

## 6. Redirections

`data/redirects.csv` (`source,destination,status`) alimente `next.config` (`redirects()`) via `scripts/build-redirects.ts`. Vercel gère jusqu'à 2 048 redirections statiques ; au-delà, middleware avec Map. Toujours 301, sauf 410 pour les supprimés.

Règles génériques (regex dans `next.config`) :

| Ancienne | Nouvelle |
|---|---|
| `/produkt/:slug/` | `/produkt/:newHandle` (table) |
| `/kategoria-produktu/olejki-eteryczne/` | `/olejki-eteryczne` |
| `/kategoria-produktu/:cat/` | `/:cat` (table pour les renommages) |
| `/kategoria-produktu/receptury/` | `/receptury` |
| `/produkt/:slug-receptura/` | `/receptury/:slug` |
| `/shop-default/`, `/shop/` | `/olejki-eteryczne` |
| `/shop/cart/` | `/koszyk` |
| `/shop/my-account/` | `/konto` |
| `/shop/checkout/` | `/koszyk` |
| `/aromatyczne-promocje/` | `/promocje` |
| `/o-nas/` | `/o-nas` |
| `/contact/` | `/kontakt` |
| `/blog/` | `/blog` |
| `/:postSlug/` (articles à la racine, table) | `/blog/:postSlug` |
| `/lista-zyczen/` | `/konto` |
| `/newsletter/` | `/#newsletter` |
| `/tag/*`, `/author/*`, `/page/N/`, `?add-to-cart=` | vers la collection ou page la plus proche, sinon 410 |
| `/wp-content/uploads/*.pdf` (analyses) | nouvelle URL CDN Shopify Files (table) |
| `/feed/`, `/wp-json/*`, `/xmlrpc.php` | 410 |

Test : script Playwright qui lit `urls.csv` et vérifie que chaque ancienne URL renvoie 301 vers une 200 (pas de chaîne, pas de 404). Zéro échec avant cut-over.

## 7. Cut-over (jour J, un mardi ou mercredi matin, jamais vendredi)

Checklist, dans l'ordre :

- [ ] Gel WooCommerce : Bogusia ne modifie plus produits ni stock depuis 24 h ; export final produits/stock/clients ; import différentiel
- [ ] Shopify : plan payant actif, paiements P24 en mode live testés avec une vraie commande à 1 zł puis remboursée, Apaczka connectée, emails PL, policies, Omnibus
- [ ] Next.js `main` déployé sur Vercel avec domaine `aromatarius.pl` ajouté (non encore pointé), `SITE_URL` prod, robots allow, sitemaps générés, redirections chargées
- [ ] Playwright e2e vert sur preview avec store prod (mot de passe storefront désactivé juste avant)
- [ ] DNS : A/ALIAS apex → Vercel, CNAME www → Vercel, CNAME checkout → shops.myshopify.com, TXT/CNAME SPF+DKIM Shopify, TTL baissé à 300 la veille
- [ ] Certificats SSL émis (Vercel + Shopify)
- [ ] Test complet : achat réel BLIK + Paczkomat, email de confirmation reçu, facture générée (iFirma/Fakturownia), étiquette Apaczka créée
- [ ] GSC : nouvelle propriété domaine `aromatarius.pl` (DNS), soumission des sitemaps, outil "Zmiana adresu" inutile (même domaine)
- [ ] GA4 reçoit les événements, Consent Mode v2 vérifié (Tag Assistant), conversion purchase remontée
- [ ] Vérification de 30 anciennes URLs au hasard (301 → 200)
- [ ] Ancien WordPress : mis en maintenance sur un sous-domaine `old.aromatarius.pl` (noindex, protégé par mot de passe) pendant 60 jours, puis archivé
- [ ] Email aux clients existants (Shopify Email) : nouveau site, code bienvenue

## 8. Suivi post-lancement (J+1 à J+30)

- GSC quotidien : erreurs 404, couverture, pages exclues "redirection", Core Web Vitals
- Vercel logs : 404 réelles → ajouter redirections
- Comparaison positions J+14 et J+30 vs baseline
- Judge.me : premières demandes d'avis envoyées
- Ajuster seuil livraison gratuite et upsell selon panier moyen

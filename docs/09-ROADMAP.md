# 09 : Roadmap (3 septembre → 30 septembre 2026)

## Périmètre

**MVP (livré le 30/09)** : Shopify configuré et alimenté, storefront Next.js complet (home, PLP, PDP, recherche, panier, checkout Shopify, compte, blog, receptury, kompendium partiel, pages légales), SEO technique complet, redirections, GA4/GSC/Consent Mode, paiements BLIK/P24, Apaczka, facturation KSeF, Judge.me, bascule DNS.

**Phase 2 (octobre à décembre)** : quiz, zestaw startowy, EN/DE via Markets + next-intl, Klaviyo, PayPo, Allegro/Baselinker, programme fidélité, abonnements, échantillons, netlinking, campagnes Ads en régime de croisière, kompendium complet.

Ce qui sort du MVP si le temps manque (dans cet ordre) : compte client (login seulement, pas d'adresses), kompendium réduit à 8 fiches, receptury réduites à 6, page Jakość simplifiée, animations.

## Dépendances côté Bogusia (à obtenir cette semaine, bloquantes)

- Création du compte Shopify (entité, IBAN) et ajout de Bogdan en collaborateur
- Accès WP admin + hébergement
- Décision paiement : Shopify Payments si éligible, sinon identifiants Przelewy24
- Identifiants Apaczka
- Nom de l'outil de facturation et contact du comptable (KSeF)
- Certificats BIO, tous les PDF d'analyse, logo source, photo et bio
- Validation du mapping tags `potrzeba:*` (elle connaît ses huiles)
- Accès DNS du domaine
- Seuil de livraison gratuite, délais réels d'expédition, politique de retour

## Semaine 1 (3 au 9 septembre) : fondations et données

Shopify
- [ ] Store créé, paramètres PL/PLN/VAT, policies, Markets
- [ ] Définitions metafields et metaobjects (06) créées via Admin API ou UI
- [ ] Collections manuelles et automatiques

Données
- [ ] Inventaire URLs, exports Woo, baseline Lighthouse et positions (07 §1 et §2)
- [ ] Script `woo-to-shopify-products.ts` v1, import à blanc de 10 produits
- [ ] Script `woo-posts-to-mdx.ts`, conversion des articles et receptury

Code
- [ ] Repo, Next.js, Tailwind v4, shadcn, tokens (05), CI (lint, typecheck, Lighthouse CI)
- [ ] SDK Hydrogen preview installé, skills copiés, adapter `src/lib/shopify/` avec `getProduct`, `getCollectionProducts`, cart create/add
- [ ] Layout : Header, MobileNav, Footer, TrustBar
- [ ] Déploiement Vercel `develop` en preview

Mesure
- [ ] GTM, GA4, GSC (ancien + nouveau), Merchant Center, Ads (compte seulement)

**Décision de sortie J5** : si le panier et le handoff checkout ne fonctionnent pas avec le SDK preview, basculer l'adapter en Storefront API direct.

## Semaine 2 (10 au 16 septembre) : catalogue et achat

- [ ] Import complet produits + variantes + metafields + images + PDF
- [ ] PLP avec filtres, tri, pagination, texte SEO, FAQ
- [ ] PDP complète (05, ordre mobile), VariantSelector, sticky add, accordéons serveur, JSON-LD Product
- [ ] Cart drawer + page koszyk, barre livraison gratuite, handoff `checkout.aromatarius.pl`
- [ ] Recherche prédictive + page szukaj
- [ ] Home v1 (hero, trust, tuiles besoin, bestsellers)
- [ ] Judge.me installé, widget headless sur PDP
- [ ] Paiements P24/BLIK en test, Apaczka installée, test Paczkomat au checkout
- [ ] Playwright : parcours 1 et 3 verts
- [ ] Revue Bogusia sur preview (10 fiches)

## Semaine 3 (17 au 23 septembre) : contenu, SEO, apps

- [ ] Blog (liste + article), receptury (10) avec RecipeBundle "Dodaj wszystko", kompendium (15 fiches) : rédaction Claude Code + relecture conformité + validation Bogusia
- [ ] Pages : O nas, Jakość, Kontakt, Wysyłka, Zwroty, Regulamin, Polityka prywatności
- [ ] Collections `/na/*` (10) avec intro, FAQ, produits
- [ ] SEO : generateMetadata partout, sitemaps, robots, llms.txt, OG images dynamiques, canonicals, 404/410
- [ ] Redirections : `redirects.csv` complet, `build-redirects.ts`, test Playwright sur toutes les anciennes URLs
- [ ] Consent Mode v2 + bannière, dataLayer complet, test DebugView
- [ ] Facturation KSeF branchée et testée, Omnibus, emails Shopify traduits, checkout brandé
- [ ] Compte client (login + commandes)
- [ ] Performance : Lighthouse CI ≥ 90 mobile sur home, PLP, PDP, receptura ; correction

## Semaine 4 (24 au 30 septembre) : QA et bascule

- [ ] QA complète mobile (iOS Safari, Android Chrome) et desktop, a11y (axe), formulaire newsletter, 404, erreurs
- [ ] Relecture finale des textes par Bogusia (orthographe PL, ton, conformité)
- [ ] Feed Merchant Center validé (option 1 ou 2), conversion purchase testée sur preview
- [ ] Mardi 29/09 : gel Woo, import différentiel, checklist cut-over (07 §7), DNS
- [ ] 30/09 : monitoring GSC/Vercel/GA4, corrections 404, email clients
- [ ] Rétro : liste phase 2 priorisée, planning Ads (lancement J+7 après validation purchase)

## Rituel

- Preview Vercel partagée à Bogusia chaque fin de journée, commentaires par WhatsApp ou Notion (un seul canal)
- Point de 15 minutes Bogdan/Bogusia mardi et vendredi
- Chaque PR : lint + typecheck + tests + Lighthouse CI verts, review par Claude Code de la règle Adapter et des balises SEO

## Critères de done du MVP

- 100 % des anciennes URLs redirigent en 301 vers une 200, zéro 404 dans le crawl
- Lighthouse mobile ≥ 90 perf, 100 SEO, ≥ 95 a11y sur home, PLP, PDP, receptura, article
- Rich Results Test : Product, Article, HowTo, FAQ, Breadcrumb sans erreur
- Achat réel BLIK + Paczkomat complet avec facture KSeF et étiquette Apaczka
- GA4 : événements e-commerce complets, purchase remonté une seule fois, Consent Mode conforme
- Sitemaps soumis, GSC sans erreur de couverture critique
- Bogusia sait : ajouter un produit, changer un prix et un stock, créer une promo (avec Omnibus), voir une commande, imprimer une étiquette, répondre à un avis

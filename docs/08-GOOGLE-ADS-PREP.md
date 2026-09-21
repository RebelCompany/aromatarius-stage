# 08 : Mesure et préparation Google Ads

## Comptes à créer (semaine 1, Bogusia propriétaire, Bogdan admin)

1. Google Account professionnel (sklep@aromatarius.pl ou compte Google Workspace existant)
2. Google Tag Manager : conteneur web `aromatarius.pl`
3. GA4 : propriété "Aromatarius", flux web, devise PLN, fuseau Warsaw, rétention 14 mois, signaux Google activés après consentement
4. Google Search Console : propriété domaine (vérification DNS TXT). Vérifier aussi l'ancien site tout de suite pour récupérer la baseline
5. Google Merchant Center : compte, vérification et revendication du domaine, adresse, politique de retour, livraison PL
6. Google Ads : compte, lié à GA4, GSC et Merchant Center. Facturation à mettre sur la carte de Bogusia. Pas de campagne avant que le nouveau site soit en ligne et que la conversion purchase soit vérifiée
7. Google Business Profile si adresse physique / point de retrait

## Consent Mode v2 (obligatoire pour Ads en UE)

- Bannière maison rendue serveur en bas d'écran (pas de layer bloquant le LCP), deux boutons égaux "Akceptuję" / "Tylko niezbędne" + lien "Ustawienia", texte PL conforme RODO
- Avant tout script : `gtag('consent','default', { ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied', analytics_storage:'denied', functionality_storage:'granted', security_storage:'granted', region:['PL'] })`
- Au clic : `gtag('consent','update', {...})` + écriture dans la Shopify Customer Privacy API (`window.Shopify.customerPrivacy.setTrackingConsent`) pour que le checkout hérite du choix
- Stockage du choix en cookie 6 mois, réaffichage à expiration
- Vérification avec Tag Assistant : signaux "consent" présents, ping de modélisation actif en mode denied

## Implémentation GTM dans Next.js

- `@next/third-parties/google` `<GoogleTagManager gtmId>` dans `layout.tsx`, chargé `afterInteractive`
- `src/lib/analytics/dataLayer.ts` : fonctions typées `pushEvent(name, params)` avec les paramètres e-commerce GA4 (`items` avec `item_id` = SKU variante, `item_name`, `item_brand: 'Aromatarius'`, `item_category` = product_type, `item_variant` = contenance, `price`, `quantity`, `currency: 'PLN'`)
- Événements côté Next : `view_item_list`, `select_item`, `view_item`, `add_to_cart`, `remove_from_cart`, `view_cart`, `begin_checkout`, `search`, `sign_up`, `newsletter_signup`, `download_analysis` (custom, signal d'intérêt fort)
- Événements côté Shopify (checkout) : `add_shipping_info`, `add_payment_info`, `purchase` via l'app Google & YouTube (recommandé) ou un Web Pixel custom qui pousse vers GTM. Ne jamais doubler `purchase`.
- GTM : tag GA4 config, tags événements, tag Google Ads conversion "Zakup" (valeur dynamique, transaction_id dédupliqué), tag remarketing dynamique (`ecomm_prodid`, `ecomm_pagetype`, `ecomm_totalvalue`)
- Test : GA4 DebugView sur preview Vercel avec un achat de test avant cut-over

## Feed produits Merchant Center

Deux options, tester la première :

1. App Shopify "Google & YouTube" : synchronise le catalogue. Point d'attention headless : le `link` des produits pointe par défaut vers le online store Shopify. Configurer le domaine principal et vérifier que les liens sont `https://aromatarius.pl/produkt/{handle}?variant={id}`. Si impossible sur plan Basic, option 2.
2. Feed custom `GET /api/feeds/google-merchant` (XML RSS 2.0, ISR 1h) généré par Next.js depuis l'adapter : `id` (SKU), `title` ("{Nazwa} BIO olejek eteryczny {ml} ml"), `description`, `link` (URL front avec variante), `image_link`, `additional_image_link`, `availability`, `price` (PLN, TTC), `sale_price` + `sale_price_effective_date`, `brand`, `gtin` si présent, `mpn`, `condition`, `product_type`, `google_product_category` (Health & Beauty > Personal Care > Aromatherapy > Essential Oils, id 5077 à vérifier), `shipping` (PL, prix), `item_group_id` (produit parent), `size` = contenance, `custom_label_0` = potrzeba, `custom_label_1` = bestseller/nowosc, `custom_label_2` = marge (haute/moyenne). Merchant Center récupère le feed par URL planifiée.

Avis produit : feed Judge.me vers Merchant Center (product ratings) une fois 50 avis atteints.

## Structure de campagnes (à lancer J+7 après cut-over, quand purchase est validé)

Budget de départ suggéré : 40 à 60 zł/jour, montée progressive selon ROAS. Objectif ROAS initial 300 %, cible 500 % à 90 jours (marges à confirmer avec Bogusia).

| Campagne | Type | Ciblage | Rôle |
|---|---|---|---|
| Brand | Search, exact/phrase | aromatarius, aromatarius sklep, aromatarius opinie | Protéger la marque, CPC bas, capter les revisites |
| Olejki generic | Search, phrase/broad avec smart bidding tCPA puis tROAS | olejki eteryczne bio, olejki eteryczne sklep, olejek {nazwa} kup, olejki eteryczne naturalne | Cœur transactionnel. Groupes par huile pour les top 15 + groupe générique |
| Na potrzeby | Search | olejki na sen, olejki na stres, olejki na odporność, olejek na katar... | Landing = collections `/na/*` et receptury |
| Shopping / PMax | Performance Max avec feed, groupes d'assets par gamme (Olejki, Hydrolaty, Zestawy) | Shopping + Display + YouTube + Gmail | Volume. Exclure le terme de marque des PMax |
| Remarketing | Display dynamique + YouTube | visiteurs PDP sans achat, abandons de panier 7/30 j | Récupération |
| Concurrence (test) | Search | oilo olejki, olejki homeair, doterra alternatywa, pranarom polska | Test à petit budget, surveiller la qualité |

Négatifs de départ : darmowe, hurt, hurtownia, praca, allegro, olx, doterra (sauf campagne test), perfumy, zapachowe do świec, do produkcji.

Extensions : sitelinks (Olejki, Zestawy, Receptury, Jakość), callouts (Analiza GC/MS, Certyfikat BIO, InPost 24h, 14 dni zwrotu), snippets structurés (Rodzaje : lawendowy, miętowy...), prix, promotion (5 % newsletter), image.

Landing pages : jamais la home pour le générique. PLP `/olejki-eteryczne` avec filtres pré-appliqués ou PDP directe. Les collections `/na/*` sont conçues comme landings Ads (intro, preuves, produits, FAQ).

## Conversions à déclarer dans Google Ads

- Primaire : `purchase` (valeur = revenu, dédupliqué sur transaction_id)
- Secondaires (observation) : `add_to_cart`, `begin_checkout`, `newsletter_signup`, `download_analysis`

## Tableau de bord (Looker Studio, gratuit)

Sources GA4 + Ads + GSC. Widgets : revenu, commandes, panier moyen, taux de conversion par source, top produits, top pages d'entrée organiques, requêtes GSC en progression, ROAS par campagne, part mobile, Core Web Vitals. Partagé avec Bogusia, revue mensuelle.

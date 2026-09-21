# 01 : Audit du site actuel (aromatarius.pl, septembre 2026)

## Fiche technique

- WordPress + Elementor 4.2.4 + WooCommerce, Yoast (meta OG/Twitter présents)
- Paiement : Przelewy24 (logo en footer)
- Infoline affichée en header : +48 576 105 864
- Réseaux : Facebook, YouTube (chaîne vidéo), Instagram
- Newsletter : 5 % sur la première commande (à conserver, c'est l'aimant à emails)
- Catégories : Olejki eteryczne, Hydrolaty, Oleje roślinne, Dyfuzory, Mieszanki, Receptury, Zestawy, Relaks, Kompendium, Promocje
- Site créé en 2022 (published_time novembre 2022), dernières mises à jour 2026

## Ce qui est bon et qu'on garde

| Actif | Pourquoi c'est précieux | Où on le remet |
|---|---|---|
| Carte d'analyse PDF par lot (ex. BERGAMOTKA-07.27.pdf) | Preuve de pureté vérifiable, quasi aucun concurrent PL ne le fait | Bloc "Analiza partii" visible au-dessus du pli sur chaque PDP + page "Jakość" |
| Chémotypes explicites (Tymianek CT tymol / CT linalol, Rozmaryn ct. cyneol) | Marque le sérieux "aromathérapie scientifique" | Metafield `chemotype`, filtre PLP, badge PDP |
| Nom latin, famille botanique, partie distillée | Données structurées prêtes pour schema et filtres | Metafields dédiés |
| Fiches produit longues et documentées (Prezentacja, Właściwości, Wpływ psycho-emocjonalny, Środki ostrożności) | Contenu unique, dense, déjà rédigé | Restructuré en onglets/accordéons, réutilisé pour Kompendium |
| Receptury par problème (Niedociśnienie, Grzybica paznokci, Egzema, Kolka wątrobowa, Kandydoza...) | Correspond exactement aux requêtes "olejek na X" | Deviennent gratuites, avec bundle "Kup wszystko z tej receptury" |
| Blog déjà scientifique (ylang-ylang, rozmaryn cyneol, cedr atlaski) | Base E-E-A-T | Migré en MDX, enrichi FAQ + schema Article |
| Logo feuille (2025) | Reconnu, à garder | Léger polissage possible |
| Photos produit cohérentes (flacons sur fond clair) | Réutilisables | Import Shopify avec alt text |
| Mention légale "Poniższe podsumowanie jest podane jedynie w celach informacyjnych..." | Nécessaire en droit polonais | Composant `<HealthDisclaimer />` sur PDP, receptury, kompendium |

## Problèmes constatés

### SEO on-page

- Title homepage : "Strona główna - Aromatarius.pl". Zéro mot-clé. Cible : "Olejki eteryczne BIO klasy premium z analizą partii | Aromatarius".
- Meta description homepage : un paragraphe de blog tronqué ("Są takie momenty, w których człowiek czuje...").
- Meta description produit : identique sur toutes les fiches ("Aromatarius to wyłącznie certyfikowane, 100% czyste..."). Duplicate content signalé par Google.
- Titles produit corrects ("Olejek eteryczny Bergamotka do aromaterapii") mais sans le volume ni le BIO, et sans "kup / cena" pour les requêtes transactionnelles.
- Images : lazy-load Elementor en data:image/svg placeholder, alt = titre produit répété. Pas de fichier image nommé proprement (NOWA-BERGAMOTKA-PRZYC.jpg).
- Pas de FAQ, pas de schema FAQPage. Pas de schema Product visible dans le HTML fetché (à vérifier avec Rich Results Test, Yoast WooCommerce SEO le fait seulement en version payante).
- Aucune notation sur les PDP ("Na razie nie ma opinii o produkcie") alors que les produits liés affichent "Oceniono 5.00 na 5". Incohérent et sans preuve sociale.
- URLs : `/produkt/`, `/kategoria-produktu/`, `/shop-default/`, `/shop/cart/`, `/shop/my-account/`, `/shop-info/contact/`. Menu avec doubles slashes (`/hydrolaty//`). Articles de blog à la racine (`/ylang-ylang-afrodyzjak-i-regulator-emocji/`).
- Slugs produits parfois techniques : `geranium-rosat-2-2`, `mieta-pieprzowa-2`, `bazylia-10-ml-2`.

### Technique et performance

- `viewport maximum-scale=1, user-scalable=0` : bloque le zoom, pénalité accessibilité Lighthouse.
- Elementor + popups (panier, recherche, menu en popups Elementor) : JS lourd, CLS probable.
- Newsletter en footer sans double opt-in visible.
- Cookie banner maison ("SAVE & ACCEPT" en anglais dans un site polonais), pas de Consent Mode v2 (bloquant pour Google Ads).
- Pas de GA4 ni Search Console (confirmé par Bogdan). On part de zéro en données.

### UX et conversion

- Hero homepage : trois messages en compétition (olejki, zestaw pielęgnacyjny dla pań, trio na detoks).
- Section "Przygotowaliśmy dla Ciebie" pousse 10 produits en promo : diffuseurs, gua sha, podgrzewacz. Le cœur de gamme (huiles) arrive en 3e écran.
- Fiche produit : prix, "Na stanie", bouton "Dodaj do koszyka" en double, puis un mur de texte. Rien sur : comment utiliser, dosage, avec quoi combiner, pour quel besoin, livraison et délai, retour.
- Pas de sélecteur de contenance (5 ml et 10 ml sont des produits séparés : Rumianek rzymski BIO 5 ml, Bergamotka BIO 10 ml). En Shopify : un produit, des variantes.
- Pas de filtres par besoin (sen, stres, odporność, skóra) ni par propriété (BIO, chémotype, mode d'usage).
- Trust bar générique ("Pomoc 24/7" n'est pas crédible pour une petite marque, "Szybka dostawa" sans délai).
- Wishlist présente mais renvoie vers une page contact sur mobile (`/shop-info/contact/`).
- Pas de recherche prédictive.

### Positionnement

- Tagline footer : "Dystrybutor olejków eterycznych". Faible. Bogusia a sa propre marque blanche : il faut parler comme une marque, pas comme un revendeur.
- "Klasy terapeutycznej" répété partout : terme sans définition légale, utilisé aussi par les marques à 15 zł. Voir `02-CONCURRENCE`.
- Prix premium (Bergamotka 64 zł, Róża damasceńska absolut 390 zł, Kocanki włoskie 220 zł) sans justification visible au premier coup d'œil.

## Inventaire à récupérer (script d'export, voir 07)

- Produits WooCommerce : nom, slug, description, prix, stock, images, catégories, tags, attributs (ml), PDF d'analyse, meta Yoast (title/description quand personnalisés)
- Clients : email, nom, adresses, consentement newsletter
- Commandes : historique (optionnel, pour LTV et pour retrouver les clients fidèles)
- Articles de blog : titre, slug, contenu HTML, date, image, catégories
- Pages légales : Regulamin, Polityka prywatności, Polityka zwrotów, Wysyłka, Akceptowane płatności, Regulamin newslettera
- Abonnés newsletter (source à identifier : MailPoet, Mailchimp, plugin WP)
- Liste complète des URLs indexées : `site:aromatarius.pl` + export sitemap Yoast (`/sitemap_index.xml`) avant toute bascule

## Métriques de départ (à mesurer semaine 1, avant refonte)

- Lighthouse mobile home + PDP + PLP (perf, SEO, a11y)
- Nombre d'URLs indexées Google
- Positions actuelles sur 30 mots-clés (voir liste dans 04) via un outil gratuit (Ubersuggest, Senuto essai, ou simple recherche manuelle en navigation privée)
- Ventes mensuelles et panier moyen depuis WooCommerce (Bogusia doit exporter)

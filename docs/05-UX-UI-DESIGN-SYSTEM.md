# 05 : UX, UI et design system

## Principes

1. Mobile first, réellement : chaque écran est maquetté en 390 px avant le desktop. Plus de 70 % du trafic e-commerce PL est mobile.
2. La preuve avant le pitch : analyse GC/MS, BIO, chémotype visibles avant le premier scroll sur PDP.
3. Un seul message par écran. Le hero vend les huiles, pas les diffuseurs.
4. Zéro friction vers le checkout : sticky add-to-cart mobile, cart drawer, checkout Shopify avec BLIK et Paczkomat.
5. Cohérence : mêmes composants partout (ProductCard identique sur home, PLP, receptura, cross-sell).

## Identité visuelle

Logo actuel conservé (feuille, 2025), éventuellement retracé en SVG propre. Palette dérivée du logo (à extraire précisément du fichier source) :

```css
@theme {
  --color-leaf-900: #1f3d2b;   /* texte fort, boutons primaires */
  --color-leaf-700: #2f5a3f;
  --color-leaf-500: #4c8a5f;   /* accent, liens */
  --color-leaf-100: #e6f0e9;   /* fonds doux */
  --color-cream-50: #fbf9f4;   /* fond de page */
  --color-sand-200: #ece4d3;   /* séparateurs, cartes */
  --color-amber-500: #c98a2b;  /* prix promo, badges BIO */
  --color-ink-900: #1b1b1a;    /* texte */
  --color-ink-600: #5c5b57;    /* texte secondaire */
  --color-danger: #b23a3a;     /* précautions */
  --font-sans: "Inter Variable", system-ui;      /* UI et corps */
  --font-serif: "Fraunces Variable", Georgia;    /* titres, noms latins en italique */
  --radius-md: 0.75rem;
  --radius-full: 999px;
}
```

Ambiance : herbier moderne, beaucoup de blanc cassé, photos flacons sur fond clair (existantes), illustrations botaniques fines en SVG pour les catégories de besoin. Pas d'effet "spa générique" (bougies, pierres, femme en lotus).

Typographie : titres en serif (Fraunces) pour le côté expert et éditorial, UI en Inter. Noms latins toujours en italique serif. Tailles : base 16 px mobile, 17 px desktop, échelle 1.25.

## Composants (shadcn + maison)

Layout : `Header` (logo, recherche, panier, compte), `MegaMenu` desktop (colonnes : Rodzaje, Na co, Wiedza), `MobileNav` (drawer plein écran, accordéons), `TrustBar` (4 preuves, icônes), `Footer` (newsletter 5 %, liens légaux, paiements, InPost), `AnnouncementBar` (livraison gratuite dès X zł, une seule ligne)

Shop : `ProductCard` (image, badge BIO, nom, nazwa łacińska, prix "od X zł", note étoiles, bouton "Do koszyka" rapide sur desktop), `PriceTag` (prix, compare-at, mention Omnibus "Najniższa cena z 30 dni: X zł" si promo), `VariantSelector` (pills 5 ml / 10 ml / 30 ml avec prix par variante et prix au ml), `AddToCart` (+ sticky mobile), `CartDrawer` (lignes, quantité, barre livraison gratuite, upsell 1 produit, bouton "Przejdź do kasy"), `Filters` (sheet mobile, sidebar desktop), `SortSelect`, `SearchDialog` (prédictif : produits, collections, articles), `StockBadge`

Contenu : `RecipeCard`, `RecipeBundle` (liste des huiles avec quantités, bouton "Dodaj wszystko", prix total), `Callout` (info / ostrzeżenie), `DosageTable`, `FaqAccordion` (rendu serveur, `<details>` natif stylé), `AuthorBox`, `Sources`, `HealthDisclaimer`, `RelatedProducts`, `RelatedContent`, `TableOfContents` (desktop sticky)

SEO : `JsonLd`, `Breadcrumbs` (visible + schema)

Feedback : toasts (ajout panier), skeletons de même dimension, états vides utiles.

## Pages et sections

### Home

1. Hero : titre "Olejki eteryczne BIO z analizą każdej partii", sous-titre preuve, CTA "Zobacz olejki", image flacon + carte d'analyse en second plan. Mobile : image sous le texte, CTA pleine largeur.
2. TrustBar : Analiza GC/MS, Certyfikat BIO, Chemotyp na etykiecie, InPost 24h
3. "Na co szukasz?" : 6 tuiles besoin (Sen, Stres, Odporność, Oddychanie, Skóra, Dom) avec icône botanique → `/na/*`
4. Bestsellery : 8 ProductCards, onglets Olejki / Hydrolaty / Zestawy
5. "Dlaczego Aromatarius" : 3 colonnes (analiza, bio, wiedza) avec lien vers `/jakosc/`
6. Receptury du mois : 3 RecipeCards
7. Kompendium : 4 fiches populaires
8. Bogusia : photo, 2 phrases, lien O nas
9. Avis clients (Judge.me carousel) + notes
10. Newsletter (5 %)

### Collection (PLP)

- H1 + intro 2 phrases (indexable) + compteur
- Filtres : BIO, potrzeba, rodzina zapachowa, sposób użycia, bezpieczeństwo (ciąża / dzieci), pojemność, cena. Mobile : bouton "Filtruj" ouvrant un Sheet, chips actifs au-dessus de la grille
- Grille 2 colonnes mobile, 3 tablette, 4 desktop
- Pagination classique 24/page
- Bas de page : texte SEO 300 à 500 mots (metafield collection `seo_text`) + FAQ collection

### Produit (PDP)

Ordre mobile (scroll) :

1. Breadcrumbs
2. Galerie (swipe, zoom, 1re image en priority)
3. Badges : BIO, chémotype, "Analiza partii"
4. H1 nom + nazwa łacińska (italique)
5. Note + nombre d'avis (ancre vers Opinie)
6. Prix (variante sélectionnée) + prix au ml + Omnibus si promo
7. VariantSelector (5 / 10 / 30 ml)
8. AddToCart + "Kup teraz" (Shop Pay / express si dispo) ; sticky bar en bas de l'écran dès que le bouton principal sort du viewport
9. Ligne livraison : "InPost Paczkomat od 9,99 zł, wysyłka w 24h, darmowa od X zł" + "14 dni na zwrot"
10. Bloc preuve : "Pobierz analizę GC/MS partii nr XXXX (PDF)" + 3 composants principaux avec pourcentages (metafield)
11. Résumé en 3 puces : "Na co", "Zapach", "Jak stosować" (depuis metafields)
12. Accordéons rendus serveur : Właściwości, Jak stosować (DosageTable), Bezpieczeństwo i przeciwwskazania, Skład i pochodzenie, FAQ
13. "Receptury z tym olejkiem" (RecipeCards)
14. "Pasuje do" (cross-sell : huile végétale, diffuseur, huiles complémentaires)
15. Opinie (Judge.me, formulaire)
16. HealthDisclaimer
17. Kompendium lié ("Dowiedz się więcej o bergamotce")

Desktop : galerie à gauche (sticky), colonne achat à droite, contenu pleine largeur en dessous.

### Receptura

Réponse directe (2 à 3 phrases) → carte "Potrzebujesz" (RecipeBundle avec produits, quantités, prix total, bouton "Dodaj wszystko do koszyka") → Przygotowanie (étapes numérotées, HowTo) → Stosowanie → Bezpieczeństwo → Dlaczego te olejki (explication) → FAQ → Powiązane receptury → Disclaimer.

### Kompendium

Voir structure dans 04. Sommaire sticky desktop, CTA produit flottant discret "Kup {olejek} BIO od X zł".

### Blog

Liste : cartes avec catégorie, temps de lecture, filtre catégorie. Article : largeur de lecture 68 ch, images légères, AuthorBox, Sources, RelatedProducts en fin et un encart produit après le 2e H2.

### Panier, compte, pages légales, 404

Panier : page `/koszyk` (fallback sans JS) + drawer. Compte : login Customer Account API, commandes, adresses. Légales : contenu migré, sommaire. 404 : recherche + 4 collections + receptury populaires.

## Parcours d'achat (à tester en Playwright)

1. Google → Kompendium lawenda → CTA → PDP → variante 10 ml → panier → checkout → BLIK + Paczkomat → confirmation
2. Google → Receptura na sen → "Dodaj wszystko" → panier (3 lignes) → checkout
3. Home → tuile Odporność → PLP filtre BIO → PDP → sticky add → checkout
4. Recherche "ravintsara" → résultat prédictif → PDP

## Micro-copy (pl), extrait pour `i18n/pl.ts`

```
addToCart: "Dodaj do koszyka"
buyNow: "Kup teraz"
goToCheckout: "Przejdź do kasy"
freeShippingFrom: "Darmowa dostawa od {amount}"
freeShippingLeft: "Do darmowej dostawy brakuje {amount}"
inStock: "Dostępny, wysyłka w 24h"
lowStock: "Ostatnie sztuki"
outOfStock: "Chwilowo niedostępny, powiadom mnie"
downloadAnalysis: "Pobierz analizę GC/MS tej partii (PDF)"
lowestPrice30: "Najniższa cena z 30 dni przed obniżką: {amount}"
pricePerMl: "{amount} / ml"
newsletterTitle: "Zapisz się i odbierz 5 % na pierwsze zakupy"
disclaimer: "Informacje mają charakter edukacyjny i nie zastępują porady lekarza. Olejki eteryczne nie są lekami."
```

## Accessibilité

Contraste AA, focus ring visible (leaf-500), navigation clavier complète dans drawer et sheet, `aria-live` sur le panier, images décoratives en `alt=""`, zoom autorisé, taille de cible ≥ 44 px, `prefers-reduced-motion` respecté.

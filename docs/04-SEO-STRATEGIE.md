# 04 : Stratégie SEO (technique, contenu, recherche IA)

## Objectif

Capter le trafic informationnel long-tail (propriétés, usages, problèmes) et le convertir vers des PDP qui rankent sur les requêtes transactionnelles ("olejek eteryczny bergamotka bio kup"). Le site actuel n'a ni GA4 ni GSC : on installe les deux en semaine 1 pour avoir une baseline avant bascule.

## Architecture d'URLs

Principe : URLs courtes, polonaises, sans `/kategoria-produktu/` ni `/shop-default/`. On conserve `/produkt/` pour minimiser les redirections et on réutilise les slugs Woo propres comme handles Shopify.

| Type | Pattern | Exemple |
|---|---|---|
| Home | `/` | |
| Collection type | `/[collection]/` | `/olejki-eteryczne/`, `/hydrolaty/`, `/mieszanki/`, `/zestawy/`, `/dyfuzory/` |
| Collection besoin | `/na/[potrzeba]/` | `/na/sen/`, `/na/odpornosc/`, `/na/stres/` |
| Produit | `/produkt/[handle]/` | `/produkt/bergamotka-bio/` (variantes 5/10/30 ml dans la page) |
| Blog | `/blog/[slug]/` | `/blog/olejek-eteryczny-z-rozmarynu-ct-cyneol-dzialanie/` |
| Receptura | `/receptury/[slug]/` | `/receptury/egzema/` |
| Kompendium | `/kompendium/[slug]/` | `/kompendium/bergamotka/` |
| Pages | `/o-nas/`, `/jakosc/`, `/kontakt/`, `/wysylka/`, `/zwroty/`, `/regulamin/`, `/polityka-prywatnosci/` | |
| Recherche | `/szukaj?q=` (noindex) | |

Trailing slash : choisir une convention (recommandé : sans trailing slash dans Next.js, `trailingSlash: false`) et rediriger l'autre en 308. Toutes les anciennes URLs Woo ont un trailing slash : la table de redirections gère les deux.

## Mapping page → balises et schema.org

| Page | Title pattern (max 60 car.) | Schema JSON-LD |
|---|---|---|
| Home | `Olejki eteryczne BIO z analizą partii \| Aromatarius` | Organization, WebSite (+SearchAction) |
| Collection | `{Nazwa} BIO: {n} produktów \| Aromatarius` | CollectionPage + ItemList, BreadcrumbList |
| Collection besoin | `Olejki eteryczne na {potrzeba}: co wybrać \| Aromatarius` | CollectionPage + ItemList + FAQPage |
| Produit | `{Nazwa} BIO {ml} ml: olejek eteryczny, cena \| Aromatarius` | Product (Offer par variante, AggregateRating si avis, brand Aromatarius, additionalProperty pour nazwa łacińska, chemotyp, metoda), BreadcrumbList, FAQPage (si FAQ), ItemList (receptury liées) |
| Blog | `{Tytuł} \| Blog Aromatarius` | Article (author Person Bogusia, publisher Organization), BreadcrumbList, FAQPage |
| Receptura | `{Problem}: receptura aromaterapeutyczna \| Aromatarius` | HowTo (supply = produits, step), ItemList produits, BreadcrumbList, FAQPage |
| Kompendium | `{Olejek}: właściwości, zastosowanie, przeciwwskazania` | Article (MedicalWebPage à éviter : trop engageant), BreadcrumbList, FAQPage |
| O nas | `O nas: kim jesteśmy \| Aromatarius` | AboutPage, Person |
| Jakość | `Jakość i analizy GC/MS \| Aromatarius` | WebPage |

Meta description unique par page, générée à partir des metafields (produit) ou du frontmatter (contenu), 140 à 155 caractères, avec bénéfice + preuve + CTA.

Open Graph : image produit 1200x630 générée dynamiquement via `next/og` (fond marque + flacon + nom + "BIO, analiza partii").

## Fichiers techniques

- `robots.ts` : allow all, disallow `/koszyk`, `/konto`, `/szukaj`, `/api`. Sitemap déclaré. **Autoriser explicitement** GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended (on veut être cité par les moteurs IA).
- `sitemap.ts` : index + sous-sitemaps `sitemap/products.xml`, `sitemap/collections.xml`, `sitemap/content.xml`, `sitemap/pages.xml`. `lastmod` réel (updatedAt Shopify / frontmatter). Images produit dans le sitemap produits (`image:image`).
- `public/llms.txt` : présentation de la marque, différenciateurs, liens vers Jakość, Kompendium, top collections, top receptury, avec une phrase de contexte par lien. Mis à jour à chaque ajout de contenu majeur. `llms-full.txt` en phase 2.
- Canonical absolu sur chaque page. Pages de recherche et filtres : canonical vers la collection sans paramètres, `noindex` si paramètres de tri/filtre.
- Pagination collection : `?page=2` avec canonical self, `rel=next/prev` inutile mais liens `<a>` réels vers les pages suivantes (pas de scroll infini seul).
- 404 personnalisée avec recherche + collections. 410 pour les produits définitivement supprimés.

## Core Web Vitals (budget, mesuré sur mobile 4G)

- LCP < 2,0 s : image hero et image produit en `priority`, `fetchpriority="high"`, preconnect cdn.shopify.com, polices en `next/font` self-hosted avec `display: swap` et fallback métrique
- INP < 200 ms : pas de hydratation lourde, cart drawer lazy, Motion seulement pour micro-interactions
- CLS < 0,05 : dimensions fixes sur images, skeletons de la même taille, pas de bannière injectée au-dessus du contenu (consent en bas)
- JS initial PDP < 150 kB gzip
- GTM chargé après consentement ou en `afterInteractive` avec Consent Mode défaut "denied"
- Lighthouse CI dans GitHub Actions sur home, PLP, PDP, receptura : seuils perf ≥ 90, SEO = 100, a11y ≥ 95

## Rendu pour crawlers et moteurs IA

- Tout le contenu commercial et éditorial est dans le HTML initial (RSC). Aucune donnée critique derrière un onglet chargé en JS : les onglets PDP sont des accordéons rendus serveur, ouverts par CSS/JS progressif.
- HTML sémantique : un `h1` par page, `h2` pour les sections (Właściwości, Jak stosować, Bezpieczeństwo, Skład i analiza, FAQ, Opinie), listes réelles, tableaux pour les dosages.
- Blocs "réponse directe" en tête de chaque page Kompendium et Receptura (2 à 3 phrases factuelles qui répondent à la requête) : c'est ce que les AI Overviews et les LLM citent.
- FAQ réelles (questions telles que tapées par les clients) avec FAQPage schema.
- Auteur identifié (Bogusia + qualifications), date de mise à jour, sources citées (livres d'aromathérapie, publications) en bas des articles.
- Noms latins systématiques : ce sont des entités fortes pour les moteurs.

## Conformité santé (règles de rédaction, s'appliquent au MDX et aux metafields)

Le droit polonais et l'UE interdisent les allégations médicales sur des produits qui ne sont pas des médicaments. Aromatarius le fait déjà ("Poniższe podsumowanie jest podane jedynie w celach informacyjnych"). On garde et on systématise :

- Formulations autorisées : "tradycyjnie stosowany przy", "w literaturze aromaterapeutycznej opisywany jako", "może wspierać", "badania sugerują" (avec source)
- Formulations interdites : "leczy", "wyleczy", "lek na", "zastępuje leczenie", promesses chiffrées
- `<HealthDisclaimer />` obligatoire sur PDP, receptury, kompendium
- Précautions toujours visibles (ciąża, dzieci, fototoksyczność, stosowanie doustne) : c'est aussi un signal de qualité pour Google (YMYL)
- Receptury : titre "Receptura wspierająca przy X", jamais "Lek na X". Les recettes existantes "Niedociśnienie", "Grzybica paznokci", "Egzema", "Kolka wątrobowa", "Kandydoza" doivent être relues sous cet angle avant publication.

## Plan de contenu (priorité MVP puis rythme)

### MVP (avant bascule)

1. Migration des articles de blog existants (script), avec ajout FAQ + relatedProducts + relecture conformité
2. 10 receptury gratuites les plus proches des requêtes à volume : sen, stres, katar/zatoki, odporność jesień, ból mięśni, trądzik, egzema, cellulit, komary, koncentracja. Chaque receptura = HowTo + bundle "Dodaj wszystkie składniki do koszyka" (variantes 10 ml par défaut)
3. Kompendium : 15 fiches pour les 15 best-sellers (lawenda, mięta pieprzowa, drzewo herbaciane, eukaliptus, ravintsara, bergamotka, cytryna, rozmaryn cyneol, geranium, ylang-ylang, kadzidłowiec, oregano, tymianek linalol, cedr atlaski, pomarańcza). Structure fixe : réponse directe, karta (nazwa łacińska, rodzina, chemotyp, część rośliny, metoda, pochodzenie, główne składniki), właściwości, jak stosować (tableau dyfuzja / skóra / kąpiel / inhalacja avec dosages), bezpieczeństwo, z czym łączyć, receptury, FAQ, produkt
4. Page `/jakosc/` : processus, certificats BIO, ce qu'est une analyse GC/MS, comment lire une carte d'analyse, pourquoi "klasa terapeutyczna" ne veut rien dire et ce qu'on garantit à la place
5. Page `/o-nas/` avec Bogusia

### Après lancement (cadence)

- 2 articles de blog par mois (Claude Code rédige, Bogusia valide sur preview)
- 2 fiches kompendium par mois jusqu'à couverture complète du catalogue
- 1 receptura par mois, saisonnalité (jesień : odporność ; zima : oddychanie ; wiosna : alergie, oczyszczanie ; lato : komary, słońce)
- Mise à jour trimestrielle des top 10 pages (updatedAt, FAQ enrichie)

## Mots-clés cibles (à valider avec Planner Google Ads dès la création du compte)

Transactionnels : olejki eteryczne, olejki eteryczne bio, olejki eteryczne sklep, olejek eteryczny lawendowy, olejek z drzewa herbacianego, olejek miętowy, olejek eukaliptusowy, olejek ravintsara, hydrolat różany, olejek eteryczny bergamotka, zestaw olejków eterycznych, dyfuzor do olejków

Informationnels : olejek lawendowy właściwości, olejki eteryczne na sen, olejki eteryczne na stres, olejki na odporność, olejek eteryczny na katar, olejki eteryczne dla dzieci, olejki eteryczne w ciąży, jak stosować olejki eteryczne, olejek eteryczny a zapachowy różnica, chemotyp olejku, najlepsze olejki eteryczne, olejki eteryczne ranking, aromaterapia dla początkujących, olejek na komary, olejek na zatoki

Marque : aromatarius, aromatarius opinie

## Netlinking (phase 2, mais à préparer)

- Fiche Google Business Profile si adresse physique
- Annuaires et médias santé naturelle PL, blogs aromathérapie (Herbiness est un partenaire potentiel plutôt qu'un concurrent)
- Publications invitées de Bogusia, YouTube (chaîne existante) avec liens vers kompendium
- Avis Judge.me syndiqués (rich snippets) et fiche Ceneo/Opineo si volume

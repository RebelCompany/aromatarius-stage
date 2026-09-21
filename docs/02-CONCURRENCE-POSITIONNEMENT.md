# 02 : Concurrence et positionnement (marché polonais)

## Cartographie du marché

### Segment 1 : mass-market pharmacie et marketplaces (10 à 25 zł / 10 ml)

- Etja (Aroma-Oil 13,99 zł), Optima Natura / Optima Plus (dès 13 zł), Vera Nord (olejki funkcjonalne "zaproszenie do snu"), Avicenna-Oil, Naturalne Aromaty
- Distribués via Gemini.pl, Apteka Zawiszy, Allegro, Ceneo, drogeries
- Forces : prix, disponibilité partout, notoriété pharmacie
- Faiblesses : pas de chémotype, pas d'analyse de lot, "olejek zapachowy" et "eteryczny" souvent confondus, contenu générique copié-collé
- Leur client n'est pas le nôtre. Ne pas se battre sur le prix.

### Segment 2 : marques "naturalne / terapeutyczne" DTC (35 à 90 zł / 10 ml)

- Oilo (via OlejkowySklep.pl) : "certyfikowany producent", cartes de caractéristiques, certificat IFRA, recommandation Polskiego Towarzystwa Aromaterapeutycznego, mélanges à noms marketing (Amore, Be Strong, Olejek Złodziei), sets "NA WSZYSTKO + 2 gratis". Concurrent direct numéro 1.
- HomeAir (homeairpolska.pl, **tourne sur Shopify**, collections /collections/olejki-eteryczne) : positionnement "olejki do domu / do dyfuzora", zestaw podstawowy, zestaw dla początkujących, cite ISO 16128, présent aussi sur Allegro avec beaucoup d'avis. Bon benchmark UX Shopify PL.
- Olini.pl : gros contenu éditorial (blog "baza wiedzy", ranking najlepsze olejki), positionnement "wybierz jakość", vend aussi huiles végétales et cosmétiques.
- Alchemia Urody : "olejki z chemotypem", "klasa spożywcza", "tylko u nas pełna gama". Discours très proche d'Aromatarius, plus agressif.
- Herbiness : blog de référence sur les certificats, démonte publiquement le terme "klasa terapeutyczna" (aucune institution ne le définit, renvoie à Robert Tisserand). Influence les acheteurs avertis.
- Bosqie, Sattva Ayurveda, Nature's Alchemy : niche, lifestyle.

### Segment 3 : MLM et importateurs (90 à 200 zł / 10 ml)

- doTERRA (via ladniepachnie.pl et distributeurs), Young Living : "CPTG", communauté, recrutement. Prix très élevés, contenu émotionnel, énorme volume de recherche de marque.
- Pranarôm, Florame, Puressentiel (marques FR/BE importées) : présentes en pharmacie et en ligne, crédibilité "aromathérapie française", peu de contenu polonais approfondi.

### Canaux qui trustent Google

Sur "najlepsze olejki eteryczne", "ranking olejki eteryczne" : Allegro (page ranking), Ceneo (magazyn + ranking), Triny.pl, najlepszy-ranking.pl. Ce sont des comparateurs et des affiliés, pas des marques. Deux conséquences :

1. La marque doit gagner sur les requêtes informationnelles longues ("olejek eteryczny z bergamotki właściwości", "olejek na sen dla dzieci", "jak stosować olejek z drzewa herbacianego") où les comparateurs sont faibles.
2. Allegro est un canal de vente à considérer en phase 2 (via Baselinker connecté à Shopify), pas un ennemi. HomeAir y fait une partie de son volume et de ses avis.

## Où Aromatarius peut gagner

Le prix (64 zł la bergamote BIO) n'est défendable que si la preuve est visible en 3 secondes. Aujourd'hui elle est cachée. Ce qu'aucun concurrent PL du segment 2 ne combine :

1. **Analyse GC/MS de chaque lot téléchargeable sur la fiche** (Aromatarius l'a déjà en PDF). Oilo parle de "karta charakterystyki", ce n'est pas la même chose.
2. **Chémotype indiqué et expliqué** (Alchemia Urody le fait, Oilo non, HomeAir non).
3. **Certification BIO** sur la majorité de la gamme.
4. **Nom latin + partie de la plante + méthode d'extraction + origine** sur chaque produit.
5. **Receptury par problème** : contenu applicatif que les autres n'ont pas sous forme structurée. Rendues gratuites, elles deviennent le moteur SEO et le moteur de bundle.
6. **Une fondatrice identifiable** (Bogusia) : page "O nas" avec visage, parcours, formation en aromathérapie si applicable. E-E-A-T et différenciation face aux MLM anonymes et aux marketplaces.

## Positionnement recommandé

**Promesse** : "Olejki eteryczne BIO z analizą każdej partii. Wiesz dokładnie, co kupujesz."

**Ce qu'on arrête de dire**
- "Klasy terapeutycznej" comme argument principal (contesté, non défini, utilisé par tout le monde). On peut le garder en mention secondaire dans les descriptions, mais jamais en headline.
- "Dystrybutor olejków eterycznych". On est une marque.
- "Pomoc 24/7".

**Ce qu'on dit à la place (trust row, visible partout)**
- "Analiza GC/MS każdej partii do pobrania"
- "Certyfikat BIO" (préciser l'organisme : PL-EKO-xx ou équivalent UE, à demander à Bogusia)
- "Chemotyp na etykiecie"
- "Wysyłka InPost 24h" (délai réel à confirmer)
- "14 dni na zwrot"

**Ton** : expert, calme, précis. Pas de promesse médicale (voir conformité dans 04). On explique les composés (linalol, 1,8-cyneol, estry), on cite les usages traditionnels et les publications, on donne des dosages et des précautions. Le lecteur doit sentir qu'il apprend quelque chose.

**Cible prioritaire** : femme 28 à 55 ans, urbaine, déjà utilisatrice d'huiles (a acheté du cheap en pharmacie ou du doTERRA), cherche mieux et moins cher que le MLM, veut des preuves. Secondaire : praticiens (masseurs, naturopathes, aromathérapeutes) pour un futur B2B.

## Architecture de gamme (pour la navigation)

Par type (collections Shopify) : Olejki eteryczne, Hydrolaty, Oleje roślinne (bazowe), Mieszanki, Zestawy, Dyfuzory, Akcesoria (relaks, gua sha).

Par besoin (collections automatisées par tag `potrzeba:*`) : Sen i relaks, Stres i emocje, Odporność, Oddychanie (katar, zatoki), Skóra, Trawienie, Ból i mięśnie, Dla dzieci (avec avertissements), Dom i dyfuzja, Pielęgnacja.

Par propriété (filtres PLP) : BIO, chémotype, rodzina zapachowa (cytrusowe, kwiatowe, drzewne, ziołowe, korzenne), sposób użycia (dyfuzja, skóra, kąpiel, doustnie z ostrzeżeniem), bezpieczne w ciąży, bezpieczne dla dzieci, fototoksyczny.

## Idées de conversion à tester après le MVP (phase 2)

- Quiz "Jaki olejek dla Ciebie?" (3 questions → 3 produits + une receptura)
- Zestaw startowy à prix d'appel (le "produit de découverte" que le marché achète chez HomeAir et Oilo)
- Échantillons 2 ml ajoutés au panier au-delà de X zł
- Programme de fidélité simple (Shopify app) et abonnement (huiles consommables)
- Allegro via Baselinker

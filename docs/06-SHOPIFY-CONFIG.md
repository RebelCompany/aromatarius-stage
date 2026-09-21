# 06 : Configuration Shopify

## Compte et plan

- Créer le store au nom de l'entité polonaise de Bogusia (NIP, adresse, IBAN PL). Essai gratuit puis plan **Basic** (109 zł/mois, 79 zł en annuel). Passage à Grow (319 zł) seulement si les frais de transaction 2 % dépassent l'écart (à partir d'environ 10 000 zł de CA mensuel via passerelle externe, ou si besoin de plus de 2 comptes staff).
- Bogdan en "collaborateur" via Shopify Partners (accès dev sans consommer un siège staff).
- Store en mode "password protected" jusqu'au cut-over. Le domaine principal reste `xxx.myshopify.com` jusqu'à la bascule, puis `checkout.aromatarius.pl` est ajouté comme domaine de checkout.
- Paramètres : devise PLN, fuseau Europe/Warsaw, langue admin PL ou EN au choix, langue storefront PL, unité ml/g, poids en g.
- Markets : un seul marché "Polska" en V1. Préparer "Unia Europejska" (EN/DE) en phase 2 sans l'activer.
- Taxes : VAT PL 23 % inclus dans les prix affichés ("z VAT"), configuration "prices include tax". Vérifier avec le comptable le taux applicable aux hydrolats et huiles végétales (certains produits cosmétiques ou alimentaires peuvent différer).
- Legal : Regulamin, Polityka prywatności, Polityka zwrotów, Wysyłka renseignés dans Settings > Policies (utilisés par le checkout) ET rendus par Next.js.

## Modèle de données

### Produits et variantes

Un produit par huile, variantes par contenance. Option unique `Pojemność` : `5 ml`, `10 ml`, `30 ml` (selon disponibilité). SKU par variante, poids, code-barres si existant, stock suivi.

Fusion Woo → Shopify : "Rumianek rzymski BIO 5 ml" et un éventuel "Rumianek rzymski BIO 10 ml" deviennent un produit `rumianek-rzymski-bio` avec deux variantes. Les anciennes URLs des deux produits redirigent vers la même PDP (variante présélectionnée via `?variant=`).

Handle = slug propre en polonais sans suffixe technique (`geranium-rosat-2-2` → `geranium-rosat-bio`). Table de correspondance dans `data/redirects.csv`.

Product type : `Olejek eteryczny`, `Hydrolat`, `Olej roślinny`, `Mieszanka`, `Zestaw`, `Dyfuzor`, `Akcesorium`. Vendor : `Aromatarius`.

### Tags (pilotent les collections automatiques et les filtres)

```
bio
potrzeba:sen  potrzeba:stres  potrzeba:odpornosc  potrzeba:oddychanie  potrzeba:skora
potrzeba:trawienie  potrzeba:bol  potrzeba:dzieci  potrzeba:dom  potrzeba:pielegnacja
zapach:cytrusowy  zapach:kwiatowy  zapach:drzewny  zapach:ziolowy  zapach:korzenny  zapach:zywiczny
uzycie:dyfuzja  uzycie:skora  uzycie:kapiel  uzycie:inhalacja  uzycie:doustnie
bezpieczny:ciaza  bezpieczny:dzieci3  bezpieczny:dzieci6  fototoksyczny
bestseller  nowosc
```

### Metafields produit (namespace `aromatarius`)

| Key | Type | Usage |
|---|---|---|
| `nazwa_lacinska` | single_line_text | H1 secondaire, schema, filtres |
| `rodzina_botaniczna` | single_line_text | fiche |
| `czesc_rosliny` | single_line_text | fiche |
| `metoda_ekstrakcji` | single_line_text | fiche ("destylacja parą wodną", "tłoczenie na zimno") |
| `chemotyp` | single_line_text | badge, filtre, schema additionalProperty |
| `pochodzenie` | single_line_text | pays d'origine |
| `certyfikat_bio` | single_line_text | organisme et numéro |
| `analiza_pdf` | file_reference | PDF GC/MS du lot courant |
| `numer_partii` | single_line_text | affiché avec le PDF |
| `glowne_skladniki` | json | `[{"nazwa":"linalol","procent":38.2}, ...]` |
| `na_co` | list.single_line_text | 3 puces résumé |
| `zapach_opis` | single_line_text | résumé |
| `wlasciwosci` | rich_text | accordéon |
| `jak_stosowac` | rich_text | accordéon |
| `dawkowanie` | json | tableau dosages `[{"metoda":"dyfuzja","dawka":"3-5 kropli / 100 ml"}, ...]` |
| `bezpieczenstwo` | rich_text | accordéon précautions |
| `wplyw_emocjonalny` | rich_text | section |
| `faq` | list.metaobject_reference (faq) | FAQ produit |
| `receptury_slugs` | list.single_line_text | slugs MDX liés |
| `kompendium_slug` | single_line_text | slug MDX |
| `pasuje_do` | list.product_reference | cross-sell |
| `seo_title`, `seo_description` | single_line_text | override |
| `najnizsza_cena_30` | money | Omnibus (mis à jour par app ou script à chaque promo) |

### Metafields collection

`intro` (rich_text, 2 phrases sous le H1), `seo_text` (rich_text, bas de page), `faq` (list.metaobject faq), `ikona` (file), `seo_title`, `seo_description`.

### Metaobjects

- `faq` : `pytanie`, `odpowiedz` (rich_text)
- `certyfikat` : `nazwa`, `organ`, `numer`, `plik`, `wazny_do`
- (les receptury et le kompendium restent en MDX ; si Bogusia veut un jour les éditer sans Bogdan, on les migre en metaobjects sans changer les URLs)

### Collections

Manuelles : Bestsellery, Nowości, Zestawy, Promocje.
Automatiques : par product_type (Olejki eteryczne, Hydrolaty, Oleje roślinne, Mieszanki, Dyfuzory, Akcesoria) et par tag `potrzeba:*` (10 collections "Na ...").

## Apps

| Besoin | App | Notes |
|---|---|---|
| Paiements | **Przelewy24** (app officielle, gratuite) : BLIK, karty, pay-by-link, Apple Pay, Google Pay. Option app "Przelewy24 BLIK" pour mettre BLIK en avant | Vérifier d'abord si Shopify Payments est disponible pour l'entité PL (moins de frais, Shop Pay). Sinon P24. PayPo (BNPL) en phase 2 |
| Livraison | **Apaczka** (app Shopify officielle) pour étiquettes InPost, DPD, DHL ; sélection du Paczkomat au checkout via app "pickup points" compatible (Apaczka ou InPost Pro) | Tester la sélection Paczkomat dans le checkout sur plan Basic avant de valider. Fallback : champ "Numer paczkomatu" via app de champs checkout |
| Facturation | **iFirma** ou **Fakturownia** (app Shopify) avec KSeF | Les documents natifs Shopify ne sont pas des factures VAT conformes en PL, il faut un moteur externe avec numérotation, corrections et KSeF. Bogusia doit demander à son comptable lequel il utilise, puis on branche |
| Avis | **Judge.me** | Import des avis Woo s'il y en a (a priori aucun), demande d'avis automatique J+7 après livraison, widget headless via API |
| Omnibus | app "Omnibus price" ou script Admin API qui écrit `najnizsza_cena_30` | Obligation légale PL pour toute promo |
| Consentement | Shopify Customer Privacy API (natif) + bannière maison côté Next.js | Pas d'app cookie payante |
| Email | Shopify Email (gratuit jusqu'à 10 000/mois) pour newsletter V1 | Klaviyo en phase 2 si automatisations avancées |
| Google | **Google & YouTube** channel | Merchant Center + conversion purchase. Voir 08 pour le feed custom si les URLs headless posent problème |
| Redirections | natives Shopify (Navigation > URL redirects) | Utile pour les URLs myshopify et checkout uniquement ; les redirections du domaine principal sont gérées par Next.js |
| Allegro | Baselinker | phase 2 |

## Checkout

- Domaine `checkout.aromatarius.pl`, logo, couleurs, police (paramètres checkout) alignés sur le design system
- Langue PL, champs : email, imię, nazwisko, adres, telefon (requis pour InPost), NIP optionnel pour facture firma (champ custom ou app)
- Modes : Paczkomat InPost (prix), kurier InPost / DPD, odbiór osobisty si applicable ; darmowa dostawa od X zł (seuil à fixer avec Bogusia, typiquement 150 à 200 zł)
- Politique : 14 dni zwrotu (obligation UE), lien Regulamin
- Post-achat : page de remerciement avec tracking GA4 purchase (via app Google ou web pixel), upsell app en phase 2
- Emails : traduire les 12 templates de notification en PL, expéditeur `sklep@aromatarius.pl`, SPF/DKIM Shopify ajoutés au DNS

## Réductions

Code newsletter 5 % (usage unique par client), codes campagne Ads, bundle receptury via "Buy X get Y" ou simple remise auto sur 3 huiles, promocje avec compare-at + Omnibus.

## Webhooks

`products/update`, `products/delete`, `collections/update`, `inventory_levels/update` → `POST https://aromatarius.pl/api/revalidate` (HMAC). `orders/create` → rien côté Next (Shopify gère).

## Accès à demander à Bogusia

- Accès admin WordPress + FTP/phpMyAdmin (export)
- Compte Przelewy24 existant (ID marchand, CRC) ou décision Shopify Payments
- Compte Apaczka (API key)
- Coordonnées du comptable (KSeF, TVA)
- DNS du domaine (registrar) : qui gère ? accès nécessaire au cut-over
- Logo source (AI/SVG), photos HD, certificats BIO, tous les PDF d'analyse
- Photo et bio de Bogusia pour O nas

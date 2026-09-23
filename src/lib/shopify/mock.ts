/**
 * Données de démo pour développer sans store Shopify.
 * Activé automatiquement quand SHOPIFY_STORE_DOMAIN est vide (voir config.ts).
 * Le catalogue reflète le modèle de données de docs/06 (variantes, tags, metafields).
 */
import { emptyMeta, productToCard } from "./mappers";
import type { ShopifyProvider } from "./provider";
import type {
  Cart,
  CartLine,
  Collection,
  CollectionFilters,
  Money,
  Product,
  ProductCardData,
  ProductMeta,
  ProductVariant,
  SortKey,
} from "./types";

const pln = (amount: number): Money => ({ amount, currencyCode: "PLN" });
const NOW = "2026-09-01T08:00:00Z";

type OilSeed = {
  handle: string;
  title: string;
  latin: string;
  type?: Product["productType"];
  family: string;
  part: string;
  method?: string;
  origin: string;
  chemotyp?: string | null;
  bio?: boolean;
  color: string;
  prices: Partial<Record<5 | 10 | 30, number>>;
  compareAt?: Partial<Record<5 | 10 | 30, number>>;
  tags: string[];
  components: { nazwa: string; procent: number }[];
  naCo: string[];
  zapach: string;
  wlasciwosci: string;
  jakStosowac: string;
  dawkowanie: { metoda: string; dawka: string }[];
  bezpieczenstwo: string;
  emocje?: string;
  faq?: { pytanie: string; odpowiedzHtml: string }[];
  receptury?: string[];
  kompendium?: string | null;
  pasujeDo?: string[];
  batch: string;
};

const seeds: OilSeed[] = [
  {
    handle: "lawenda-waskolistna-bio",
    title: "Lawenda wąskolistna BIO",
    latin: "Lavandula angustifolia",
    family: "Lamiaceae (jasnotowate)",
    part: "kwitnące wierzchołki",
    origin: "Francja (Prowansja)",
    chemotyp: "linalol / octan linalylu",
    bio: true,
    color: "#7c6fb0",
    prices: { 5: 34, 10: 54, 30: 129 },
    tags: ["bio", "bestseller", "potrzeba:sen", "potrzeba:stres", "potrzeba:skora", "potrzeba:dzieci", "zapach:kwiatowy", "uzycie:dyfuzja", "uzycie:skora", "uzycie:kapiel", "bezpieczny:dzieci3", "bezpieczny:ciaza"],
    components: [
      { nazwa: "linalol", procent: 36.4 },
      { nazwa: "octan linalylu", procent: 33.1 },
      { nazwa: "beta-kariofilen", procent: 4.2 },
    ],
    naCo: ["wieczorne wyciszenie i sen", "napięcie i stres", "delikatna skóra, drobne podrażnienia"],
    zapach: "kwiatowo-ziołowy, miękki, lekko słodki",
    wlasciwosci: "<p>Lawenda wąskolistna to najbardziej uniwersalny olejek w aromaterapii. W literaturze opisywana jako wyciszająca, tradycyjnie stosowana wieczorem w dyfuzji i w pielęgnacji skóry. Wysoka zawartość linalolu i octanu linalylu odpowiada za jej łagodny, kwiatowy profil.</p>",
    jakStosowac: "<p>Dyfuzja wieczorem 20 do 30 minut, kąpiel z emulgatorem, masaż w oleju bazowym. Sprawdza się w mieszankach z bergamotką, cedrem i geranium.</p>",
    dawkowanie: [
      { metoda: "Dyfuzja", dawka: "3 do 5 kropli / 100 ml wody" },
      { metoda: "Skóra (masaż)", dawka: "1 do 2 % w oleju bazowym (2 do 4 kropli / 10 ml)" },
      { metoda: "Kąpiel", dawka: "4 do 6 kropli wymieszane z łyżką soli lub oleju" },
      { metoda: "Inhalacja", dawka: "1 do 2 krople na chusteczkę" },
    ],
    bezpieczenstwo: "<ul><li>Nie stosować doustnie bez konsultacji.</li><li>U dzieci od 3. roku życia w niskim stężeniu (0,5 %).</li><li>W ciąży po 1. trymestrze, wyłącznie zewnętrznie.</li></ul>",
    emocje: "<p>Tradycyjnie kojarzona z uspokojeniem, wyciszeniem natłoku myśli i ułatwieniem zasypiania.</p>",
    faq: [
      { pytanie: "Czy lawenda wąskolistna to to samo co lawandyna?", odpowiedzHtml: "<p>Nie. Lawandyna (<em>Lavandula x intermedia</em>) ma więcej kamfory i ostrzejszy zapach. Do wyciszenia wybieraj lawendę wąskolistną.</p>" },
      { pytanie: "Czy mogę stosować u dziecka?", odpowiedzHtml: "<p>Od 3. roku życia, w dyfuzji lub w oleju bazowym w stężeniu 0,5 %. Zawsze z dala od twarzy dziecka.</p>" },
    ],
    receptury: ["na-sen", "na-stres"],
    kompendium: "lawenda",
    pasujeDo: ["bergamotka-bio", "cedr-atlaski-bio", "olej-ze-slodkich-migdalow-bio"],
    batch: "LAV-04.26",
  },
  {
    handle: "bergamotka-bio",
    title: "Bergamotka BIO",
    latin: "Citrus bergamia",
    family: "Rutaceae (rutowate)",
    part: "skórka owocu",
    method: "tłoczenie na zimno",
    origin: "Włochy (Kalabria)",
    chemotyp: null,
    bio: true,
    color: "#b8c74a",
    prices: { 5: 39, 10: 64, 30: 149 },
    tags: ["bio", "bestseller", "potrzeba:stres", "potrzeba:sen", "potrzeba:dom", "zapach:cytrusowy", "uzycie:dyfuzja", "uzycie:skora", "fototoksyczny"],
    components: [
      { nazwa: "limonen", procent: 38.2 },
      { nazwa: "octan linalylu", procent: 27.5 },
      { nazwa: "linalol", procent: 9.8 },
    ],
    naCo: ["obniżony nastrój, napięcie", "wieczorna dyfuzja", "zapach domu"],
    zapach: "cytrusowy z kwiatową nutą, świeży, elegancki",
    wlasciwosci: "<p>Bergamotka łączy świeżość cytrusów z kwiatową miękkością octanu linalylu. W literaturze aromaterapeutycznej opisywana jako olejek „rozjaśniający” nastrój, chętnie stosowany w dyfuzji w ciągu dnia i wieczorem.</p>",
    jakStosowac: "<p>Dyfuzja solo lub z lawendą i geranium. Na skórę tylko w niskim stężeniu i nigdy przed ekspozycją na słońce.</p>",
    dawkowanie: [
      { metoda: "Dyfuzja", dawka: "4 do 6 kropli / 100 ml wody" },
      { metoda: "Skóra", dawka: "maks. 0,4 % (fototoksyczność), nie przed słońcem" },
      { metoda: "Inhalacja", dawka: "1 do 2 krople na chusteczkę" },
    ],
    bezpieczenstwo: "<ul><li><strong>Fototoksyczny</strong>: po aplikacji na skórę unikaj słońca i solarium przez 12 godzin.</li><li>Nie stosować doustnie.</li><li>Trzymać z dala od dzieci.</li></ul>",
    emocje: "<p>Tradycyjnie stosowana przy przygnębieniu i „ciężkim” nastroju, dodaje lekkości bez pobudzania.</p>",
    faq: [
      { pytanie: "Czy istnieje wersja bez bergaptenu?", odpowiedzHtml: "<p>Tak, tzw. bergamotka FCF. Nasz olejek jest pełnym, tłoczonym na zimno olejkiem BIO, dlatego zachowaj ostrożność na skórze.</p>" },
    ],
    receptury: ["na-stres"],
    kompendium: "bergamotka",
    pasujeDo: ["lawenda-waskolistna-bio", "geranium-rosat-bio"],
    batch: "BERG-07.27",
  },
  {
    handle: "mieta-pieprzowa-bio",
    title: "Mięta pieprzowa BIO",
    latin: "Mentha x piperita",
    family: "Lamiaceae (jasnotowate)",
    part: "ziele",
    origin: "Indie",
    chemotyp: "mentol / menton",
    bio: true,
    color: "#3aa07a",
    prices: { 10: 44, 30: 109 },
    tags: ["bio", "bestseller", "potrzeba:bol", "potrzeba:trawienie", "potrzeba:oddychanie", "zapach:ziolowy", "uzycie:dyfuzja", "uzycie:skora", "uzycie:inhalacja"],
    components: [
      { nazwa: "mentol", procent: 42.1 },
      { nazwa: "menton", procent: 21.7 },
      { nazwa: "1,8-cyneol", procent: 5.9 },
    ],
    naCo: ["napięciowe bóle głowy (skronie, w oleju)", "ciężkość po posiłku", "koncentracja"],
    zapach: "mentolowy, chłodny, bardzo intensywny",
    wlasciwosci: "<p>Mięta pieprzowa daje natychmiastowy efekt chłodzenia dzięki mentolowi. Tradycyjnie stosowana miejscowo (skronie, kark) w oleju bazowym oraz w inhalacji przy uczuciu zatkanego nosa.</p>",
    jakStosowac: "<p>1 kropla w 10 ml oleju na skronie i kark. W dyfuzji krótko (10 do 15 minut). Nie łączyć z homeopatią bez konsultacji.</p>",
    dawkowanie: [
      { metoda: "Dyfuzja", dawka: "2 do 3 krople / 100 ml wody, 10 do 15 minut" },
      { metoda: "Skóra", dawka: "1 % w oleju bazowym (2 krople / 10 ml), punktowo" },
      { metoda: "Inhalacja", dawka: "1 kropla na chusteczkę" },
    ],
    bezpieczenstwo: "<ul><li>Nie stosować u dzieci poniżej 6 lat (ryzyko skurczu krtani).</li><li>Nie stosować w ciąży i podczas karmienia.</li><li>Nie aplikować w okolicy oczu i nosa u dzieci.</li></ul>",
    faq: [],
    receptury: ["na-bol-glowy"],
    kompendium: "mieta-pieprzowa",
    pasujeDo: ["eukaliptus-galkowy-bio", "rozmaryn-ct-cyneol-bio"],
    batch: "MEN-02.26",
  },
  {
    handle: "tea-tree-drzewo-herbaciane-bio",
    title: "Drzewo herbaciane BIO",
    latin: "Melaleuca alternifolia",
    family: "Myrtaceae (mirtowate)",
    part: "liście",
    origin: "Australia",
    chemotyp: "terpinen-4-ol",
    bio: true,
    color: "#5b8a3c",
    prices: { 10: 39, 30: 95 },
    tags: ["bio", "bestseller", "potrzeba:skora", "potrzeba:odpornosc", "potrzeba:dom", "zapach:ziolowy", "uzycie:skora", "uzycie:dyfuzja", "bezpieczny:dzieci6"],
    components: [
      { nazwa: "terpinen-4-ol", procent: 40.3 },
      { nazwa: "gamma-terpinen", procent: 19.8 },
      { nazwa: "alfa-terpinen", procent: 9.6 },
    ],
    naCo: ["niedoskonałości skóry, punktowo", "domowe środki czystości", "sezon jesienny w dyfuzji"],
    zapach: "ostry, żywiczno-ziołowy, „medyczny”",
    wlasciwosci: "<p>Olejek z drzewa herbacianego jest jednym z najlepiej przebadanych olejków. W literaturze opisywany jako oczyszczający, stosowany punktowo na skórę i w domowych mieszankach do sprzątania.</p>",
    jakStosowac: "<p>Punktowo 1 kropla w kropli oleju jojoba. W spray’u do sprzątania 20 kropli na 500 ml wody z octem.</p>",
    dawkowanie: [
      { metoda: "Skóra (punktowo)", dawka: "1 kropla w 1 kropli oleju bazowego" },
      { metoda: "Dyfuzja", dawka: "3 do 4 krople / 100 ml wody" },
      { metoda: "Dom", dawka: "20 kropli / 500 ml wody z octem" },
    ],
    bezpieczenstwo: "<ul><li>Może utleniać się z czasem: zużyć w 12 miesięcy od otwarcia.</li><li>U dzieci od 6 lat, tylko zewnętrznie.</li><li>Nie stosować doustnie.</li></ul>",
    receptury: ["na-tradzik"],
    kompendium: "drzewo-herbaciane",
    pasujeDo: ["lawenda-waskolistna-bio", "olej-jojoba-bio"],
    batch: "TTO-05.26",
  },
  {
    handle: "eukaliptus-galkowy-bio",
    title: "Eukaliptus gałkowy BIO",
    latin: "Eucalyptus globulus",
    family: "Myrtaceae (mirtowate)",
    part: "liście",
    origin: "Portugalia",
    chemotyp: "1,8-cyneol",
    bio: true,
    color: "#4f9c9c",
    prices: { 10: 32, 30: 79 },
    tags: ["bio", "potrzeba:oddychanie", "potrzeba:odpornosc", "zapach:ziolowy", "uzycie:dyfuzja", "uzycie:inhalacja", "uzycie:skora"],
    components: [
      { nazwa: "1,8-cyneol", procent: 78.9 },
      { nazwa: "alfa-pinen", procent: 8.1 },
      { nazwa: "limonen", procent: 4.4 },
    ],
    naCo: ["uczucie zatkanego nosa", "jesienna dyfuzja", "masaż klatki piersiowej (dorośli)"],
    zapach: "świeży, kamforowy, przenikliwy",
    wlasciwosci: "<p>Eukaliptus gałkowy to klasyk sezonu jesienno-zimowego. Bardzo wysoka zawartość 1,8-cyneolu odpowiada za jego świeży, „otwierający” zapach, tradycyjnie wykorzystywany w inhalacjach.</p>",
    jakStosowac: "<p>Inhalacja parowa (dorośli), dyfuzja, masaż klatki piersiowej w oleju 2 %.</p>",
    dawkowanie: [
      { metoda: "Dyfuzja", dawka: "3 do 5 kropli / 100 ml wody" },
      { metoda: "Inhalacja parowa", dawka: "1 do 2 krople do miski gorącej wody (dorośli)" },
      { metoda: "Skóra", dawka: "2 % w oleju bazowym" },
    ],
    bezpieczenstwo: "<ul><li>Nie stosować u dzieci poniżej 6 lat (w pobliżu twarzy poniżej 10 lat).</li><li>Nie stosować w astmie bez konsultacji.</li><li>Nie stosować doustnie.</li></ul>",
    receptury: ["na-katar"],
    kompendium: "eukaliptus",
    pasujeDo: ["ravintsara-bio", "mieta-pieprzowa-bio"],
    batch: "EUC-01.26",
  },
  {
    handle: "ravintsara-bio",
    title: "Ravintsara BIO",
    latin: "Cinnamomum camphora ct. cineol",
    family: "Lauraceae (wawrzynowate)",
    part: "liście",
    origin: "Madagaskar",
    chemotyp: "1,8-cyneol",
    bio: true,
    color: "#2e7d6b",
    prices: { 5: 36, 10: 59 },
    tags: ["bio", "bestseller", "potrzeba:odpornosc", "potrzeba:oddychanie", "potrzeba:dzieci", "zapach:ziolowy", "uzycie:dyfuzja", "uzycie:skora", "uzycie:inhalacja", "bezpieczny:dzieci3"],
    components: [
      { nazwa: "1,8-cyneol", procent: 58.2 },
      { nazwa: "sabinen", procent: 14.7 },
      { nazwa: "alfa-terpineol", procent: 7.3 },
    ],
    naCo: ["wsparcie w sezonie infekcyjnym", "dyfuzja w domu z dziećmi", "poranna energia"],
    zapach: "świeży, łagodniejszy niż eukaliptus, lekko kamforowy",
    wlasciwosci: "<p>Ravintsara to jeden z najczęściej polecanych olejków na sezon jesienno-zimowy w aromaterapii francuskiej. Łagodniejsza od eukaliptusa, dobrze tolerowana przez skórę.</p>",
    jakStosowac: "<p>Dyfuzja rano, kilka kropli w oleju na klatkę piersiową i stopy. Łączy się z cytryną i drzewem herbacianym.</p>",
    dawkowanie: [
      { metoda: "Dyfuzja", dawka: "4 do 6 kropli / 100 ml wody" },
      { metoda: "Skóra", dawka: "2 do 3 % w oleju bazowym, klatka piersiowa i stopy" },
      { metoda: "Inhalacja", dawka: "2 krople na chusteczkę" },
    ],
    bezpieczenstwo: "<ul><li>U dzieci od 3 lat w dyfuzji, na skórę od 6 lat w 1 %.</li><li>W ciąży po 1. trymestrze, zewnętrznie.</li><li>Nie mylić z kamforą ani z ravensarą (<em>Ravensara aromatica</em>).</li></ul>",
    receptury: ["na-odpornosc", "na-katar"],
    kompendium: "ravintsara",
    pasujeDo: ["cytryna-bio", "tea-tree-drzewo-herbaciane-bio", "eukaliptus-galkowy-bio"],
    batch: "RAV-03.26",
  },
  {
    handle: "cytryna-bio",
    title: "Cytryna BIO",
    latin: "Citrus limon",
    family: "Rutaceae (rutowate)",
    part: "skórka owocu",
    method: "tłoczenie na zimno",
    origin: "Włochy (Sycylia)",
    chemotyp: null,
    bio: true,
    color: "#e0c53a",
    prices: { 10: 29, 30: 69 },
    compareAt: { 10: 34 },
    tags: ["bio", "potrzeba:odpornosc", "potrzeba:dom", "potrzeba:stres", "zapach:cytrusowy", "uzycie:dyfuzja", "fototoksyczny"],
    components: [
      { nazwa: "limonen", procent: 66.8 },
      { nazwa: "beta-pinen", procent: 11.2 },
      { nazwa: "gamma-terpinen", procent: 9.1 },
    ],
    naCo: ["oczyszczanie powietrza w dyfuzji", "poranna świeżość", "mieszanki do sprzątania"],
    zapach: "cytrusowy, czysty, słoneczny",
    wlasciwosci: "<p>Cytryna to najprostszy sposób na odświeżenie domu. Tradycyjnie stosowana w dyfuzji w sezonie infekcyjnym i jako składnik domowych środków czystości.</p>",
    jakStosowac: "<p>Dyfuzja solo lub z ravintsarą i drzewem herbacianym. Na skórę tylko wieczorem, ze względu na fototoksyczność.</p>",
    dawkowanie: [
      { metoda: "Dyfuzja", dawka: "5 do 8 kropli / 100 ml wody" },
      { metoda: "Skóra", dawka: "maks. 2 %, nie przed słońcem" },
    ],
    bezpieczenstwo: "<ul><li><strong>Fototoksyczny</strong> na skórze.</li><li>Zużyć w 12 miesięcy od otwarcia.</li></ul>",
    receptury: ["na-odpornosc"],
    kompendium: "cytryna",
    pasujeDo: ["ravintsara-bio", "tea-tree-drzewo-herbaciane-bio"],
    batch: "CYT-06.26",
  },
  {
    handle: "rozmaryn-ct-cyneol-bio",
    title: "Rozmaryn ct. cyneol BIO",
    latin: "Rosmarinus officinalis ct. 1,8-cineole",
    family: "Lamiaceae (jasnotowate)",
    part: "kwitnące wierzchołki",
    origin: "Tunezja",
    chemotyp: "1,8-cyneol",
    bio: true,
    color: "#6f8f4f",
    prices: { 10: 36, 30: 89 },
    tags: ["bio", "potrzeba:oddychanie", "potrzeba:pielegnacja", "potrzeba:bol", "zapach:ziolowy", "uzycie:dyfuzja", "uzycie:skora", "uzycie:inhalacja"],
    components: [
      { nazwa: "1,8-cyneol", procent: 46.5 },
      { nazwa: "alfa-pinen", procent: 12.3 },
      { nazwa: "kamfora", procent: 10.8 },
    ],
    naCo: ["koncentracja i praca umysłowa", "pielęgnacja skóry głowy", "zmęczone mięśnie"],
    zapach: "ziołowy, świeży, lekko kamforowy",
    wlasciwosci: "<p>Rozmaryn cyneolowy to chemotyp najbardziej „oddechowy” i najbezpieczniejszy z trzech rozmarynów. Tradycyjnie stosowany w dyfuzji podczas pracy i w pielęgnacji skóry głowy.</p>",
    jakStosowac: "<p>Dyfuzja w ciągu dnia. 2 do 3 krople w szamponie lub oleju do skóry głowy.</p>",
    dawkowanie: [
      { metoda: "Dyfuzja", dawka: "3 do 5 kropli / 100 ml wody" },
      { metoda: "Skóra", dawka: "2 % w oleju bazowym" },
      { metoda: "Włosy", dawka: "2 do 3 krople / 10 ml oleju" },
    ],
    bezpieczenstwo: "<ul><li>Nie stosować w ciąży i u dzieci poniżej 6 lat.</li><li>Ostrożnie przy padaczce (kamfora).</li></ul>",
    receptury: ["na-koncentracje"],
    kompendium: "rozmaryn-cyneol",
    pasujeDo: ["mieta-pieprzowa-bio", "cytryna-bio"],
    batch: "ROS-04.26",
  },
  {
    handle: "geranium-rosat-bio",
    title: "Geranium (pelargonia) BIO",
    latin: "Pelargonium graveolens",
    family: "Geraniaceae (bodziszkowate)",
    part: "liście",
    origin: "Egipt",
    chemotyp: null,
    bio: true,
    color: "#c96b8a",
    prices: { 5: 42, 10: 69 },
    tags: ["bio", "potrzeba:skora", "potrzeba:stres", "potrzeba:pielegnacja", "zapach:kwiatowy", "uzycie:dyfuzja", "uzycie:skora"],
    components: [
      { nazwa: "cytronelol", procent: 31.2 },
      { nazwa: "geraniol", procent: 14.9 },
      { nazwa: "mrówczan cytronelylu", procent: 9.7 },
    ],
    naCo: ["pielęgnacja cery mieszanej", "napięcie emocjonalne", "mieszanki kwiatowe"],
    zapach: "różano-zielony, intensywny",
    wlasciwosci: "<p>Geranium jest w aromaterapii olejkiem „równowagi”: w pielęgnacji skóry i w mieszankach na napięcie. Zapach bliski róży, w ułamku ceny.</p>",
    jakStosowac: "<p>1 kropla w kremie na noc. W dyfuzji z bergamotką i lawendą.</p>",
    dawkowanie: [
      { metoda: "Dyfuzja", dawka: "2 do 4 krople / 100 ml wody" },
      { metoda: "Skóra", dawka: "1 % w oleju lub kremie" },
    ],
    bezpieczenstwo: "<ul><li>Może uczulać osoby wrażliwe na geraniol: test na skórze.</li><li>W ciąży po 1. trymestrze.</li></ul>",
    receptury: ["na-stres"],
    kompendium: "geranium",
    pasujeDo: ["bergamotka-bio", "lawenda-waskolistna-bio"],
    batch: "GER-02.26",
  },
  {
    handle: "cedr-atlaski-bio",
    title: "Cedr atlaski BIO",
    latin: "Cedrus atlantica",
    family: "Pinaceae (sosnowate)",
    part: "drewno",
    origin: "Maroko",
    chemotyp: null,
    bio: true,
    color: "#8b5e3c",
    prices: { 10: 38, 30: 92 },
    tags: ["bio", "potrzeba:sen", "potrzeba:pielegnacja", "potrzeba:dom", "zapach:drzewny", "uzycie:dyfuzja", "uzycie:skora"],
    components: [
      { nazwa: "beta-himachalen", procent: 41.6 },
      { nazwa: "alfa-himachalen", procent: 15.2 },
      { nazwa: "gamma-himachalen", procent: 9.9 },
    ],
    naCo: ["wieczorne ugruntowanie", "pielęgnacja skóry głowy", "zapach drzewny w domu"],
    zapach: "drzewny, ciepły, lekko słodki",
    wlasciwosci: "<p>Cedr atlaski daje głęboką, drzewną bazę mieszankom. Tradycyjnie stosowany wieczorem i w pielęgnacji skóry głowy.</p>",
    jakStosowac: "<p>Dyfuzja z lawendą i pomarańczą. 2 krople w oleju do skóry głowy.</p>",
    dawkowanie: [
      { metoda: "Dyfuzja", dawka: "3 do 4 krople / 100 ml wody" },
      { metoda: "Skóra", dawka: "1 do 2 % w oleju bazowym" },
    ],
    bezpieczenstwo: "<ul><li>Nie stosować w ciąży.</li><li>Nie stosować doustnie.</li></ul>",
    receptury: ["na-sen"],
    kompendium: "cedr-atlaski",
    pasujeDo: ["lawenda-waskolistna-bio", "pomarancza-bio"],
    batch: "CED-11.25",
  },
  {
    handle: "pomarancza-bio",
    title: "Pomarańcza słodka BIO",
    latin: "Citrus sinensis",
    family: "Rutaceae (rutowate)",
    part: "skórka owocu",
    method: "tłoczenie na zimno",
    origin: "Brazylia",
    chemotyp: null,
    bio: true,
    color: "#e8923a",
    prices: { 10: 26, 30: 59 },
    tags: ["bio", "nowosc", "potrzeba:dom", "potrzeba:dzieci", "potrzeba:stres", "zapach:cytrusowy", "uzycie:dyfuzja", "bezpieczny:dzieci3", "bezpieczny:ciaza"],
    components: [
      { nazwa: "limonen", procent: 94.1 },
      { nazwa: "mircen", procent: 1.9 },
      { nazwa: "linalol", procent: 0.6 },
    ],
    naCo: ["radosny zapach domu", "dyfuzja z dziećmi", "mieszanki świąteczne"],
    zapach: "słodki, soczysty, owocowy",
    wlasciwosci: "<p>Pomarańcza słodka jest najłagodniejszym olejkiem cytrusowym, nie fototoksycznym. Idealna do dyfuzji w domu z dziećmi.</p>",
    jakStosowac: "<p>Dyfuzja solo lub z cedrem, cynamonem, lawendą.</p>",
    dawkowanie: [
      { metoda: "Dyfuzja", dawka: "5 do 8 kropli / 100 ml wody" },
      { metoda: "Skóra", dawka: "2 % w oleju bazowym" },
    ],
    bezpieczenstwo: "<ul><li>Zużyć w 12 miesięcy od otwarcia (utlenianie).</li></ul>",
    receptury: ["na-sen"],
    kompendium: "pomarancza",
    pasujeDo: ["cedr-atlaski-bio", "lawenda-waskolistna-bio"],
    batch: "POM-05.26",
  },
  {
    handle: "hydrolat-roza-damascenska-bio",
    title: "Hydrolat różany BIO",
    latin: "Rosa damascena",
    type: "Hydrolat",
    family: "Rosaceae (różowate)",
    part: "płatki",
    origin: "Bułgaria",
    chemotyp: null,
    bio: true,
    color: "#e5a6b8",
    prices: { 30: 0 },
    tags: ["bio", "potrzeba:skora", "potrzeba:pielegnacja", "zapach:kwiatowy", "uzycie:skora", "bezpieczny:ciaza", "bezpieczny:dzieci3"],
    components: [
      { nazwa: "fenyloetanol", procent: 62.0 },
      { nazwa: "cytronelol", procent: 15.4 },
      { nazwa: "geraniol", procent: 8.8 },
    ],
    naCo: ["tonik do każdej cery", "odświeżenie w ciągu dnia", "delikatna skóra"],
    zapach: "różany, subtelny",
    wlasciwosci: "<p>Hydrolat różany to woda z destylacji płatków róży damasceńskiej. Łagodny tonik odpowiedni do każdego typu cery, także w ciąży i u dzieci.</p>",
    jakStosowac: "<p>Spryskać twarz rano i wieczorem po oczyszczeniu. Przechowywać w lodówce.</p>",
    dawkowanie: [{ metoda: "Skóra", dawka: "bez rozcieńczania, jako tonik" }],
    bezpieczenstwo: "<ul><li>Bez konserwantów: zużyć w 6 miesięcy, trzymać w lodówce.</li></ul>",
    kompendium: null,
    pasujeDo: ["geranium-rosat-bio", "olej-jojoba-bio"],
    batch: "HYD-ROSA-03.26",
  },
  {
    handle: "olej-jojoba-bio",
    title: "Olej jojoba BIO",
    latin: "Simmondsia chinensis",
    type: "Olej roślinny",
    family: "Simmondsiaceae",
    part: "nasiona",
    method: "tłoczenie na zimno",
    origin: "Izrael",
    chemotyp: null,
    bio: true,
    color: "#d9b463",
    prices: { 30: 0 },
    tags: ["bio", "potrzeba:skora", "potrzeba:pielegnacja", "uzycie:skora", "bezpieczny:ciaza", "bezpieczny:dzieci3"],
    components: [{ nazwa: "estry woskowe", procent: 97.0 }],
    naCo: ["baza do olejków eterycznych", "cera mieszana i tłusta", "demakijaż"],
    zapach: "neutralny",
    wlasciwosci: "<p>Jojoba to ciekły wosk o składzie bliskim sebum. Najbardziej uniwersalna baza do rozcieńczania olejków eterycznych, nie jełczeje.</p>",
    jakStosowac: "<p>Rozcieńczaj olejki eteryczne: 2 do 4 krople na 10 ml (1 do 2 %).</p>",
    dawkowanie: [{ metoda: "Skóra", dawka: "bez ograniczeń, baza" }],
    bezpieczenstwo: "<ul><li>Brak znanych przeciwwskazań.</li></ul>",
    kompendium: null,
    pasujeDo: ["lawenda-waskolistna-bio", "tea-tree-drzewo-herbaciane-bio"],
    batch: "JOJ-01.26",
  },
  {
    handle: "olej-ze-slodkich-migdalow-bio",
    title: "Olej ze słodkich migdałów BIO",
    latin: "Prunus amygdalus dulcis",
    type: "Olej roślinny",
    family: "Rosaceae (różowate)",
    part: "nasiona",
    method: "tłoczenie na zimno",
    origin: "Hiszpania",
    chemotyp: null,
    bio: true,
    color: "#e4cf9a",
    prices: { 30: 0 },
    tags: ["bio", "potrzeba:skora", "potrzeba:dzieci", "potrzeba:pielegnacja", "uzycie:skora", "bezpieczny:ciaza", "bezpieczny:dzieci3"],
    components: [{ nazwa: "kwas oleinowy", procent: 68.0 }, { nazwa: "kwas linolowy", procent: 22.0 }],
    naCo: ["masaż", "skóra dziecka", "baza do mieszanek relaksacyjnych"],
    zapach: "lekko orzechowy",
    wlasciwosci: "<p>Klasyczna baza do masażu, łagodna i dobrze wchłanialna.</p>",
    jakStosowac: "<p>Baza do masażu: 2 do 4 krople olejku eterycznego na 10 ml.</p>",
    dawkowanie: [{ metoda: "Skóra", dawka: "bez ograniczeń, baza" }],
    bezpieczenstwo: "<ul><li>Uwaga przy alergii na orzechy.</li></ul>",
    kompendium: null,
    pasujeDo: ["lawenda-waskolistna-bio"],
    batch: "MIG-02.26",
  },
];

// Prix des huiles végétales et hydrolats (100 ml)
const bigFormats: Record<string, { ml: number; price: number }> = {
  "hydrolat-roza-damascenska-bio": { ml: 100, price: 39 },
  "olej-jojoba-bio": { ml: 100, price: 49 },
  "olej-ze-slodkich-migdalow-bio": { ml: 100, price: 29 },
};

function buildProduct(seed: OilSeed, index: number): Product {
  const type = seed.type ?? "Olejek eteryczny";
  const image = {
    url: `/images/products/${seed.handle}.svg`,
    alt: `${seed.title} olejek eteryczny Aromatarius`,
    width: 1200,
    height: 1200,
  };
  const entries: { ml: number; price: number; compareAt?: number }[] = bigFormats[seed.handle]
    ? [bigFormats[seed.handle]]
    : (Object.entries(seed.prices) as unknown as [string, number][]).map(([ml, price]) => ({
        ml: Number(ml),
        price,
        compareAt: seed.compareAt?.[Number(ml) as 5 | 10 | 30],
      }));

  const variants: ProductVariant[] = entries.map((e, i) => ({
    id: `gid://shopify/ProductVariant/${1000 + index * 10 + i}`,
    title: `${e.ml} ml`,
    sku: `${seed.handle.toUpperCase().replace(/-/g, "")}-${e.ml}`,
    availableForSale: !(seed.handle === "geranium-rosat-bio" && e.ml === 5),
    quantityAvailable: seed.handle === "cytryna-bio" && e.ml === 30 ? 2 : 40,
    price: pln(e.price),
    compareAtPrice: e.compareAt ? pln(e.compareAt) : null,
    volumeMl: e.ml,
    selectedOptions: [{ name: "Pojemność", value: `${e.ml} ml` }],
    image: null,
  }));
  const prices = variants.map((v) => v.price.amount);
  const meta: ProductMeta = {
    ...emptyMeta,
    nazwaLacinska: seed.latin,
    rodzinaBotaniczna: seed.family,
    czescRosliny: seed.part,
    metodaEkstrakcji: seed.method ?? (type === "Hydrolat" ? "destylacja parą wodną (faza wodna)" : "destylacja parą wodną"),
    chemotyp: seed.chemotyp ?? null,
    pochodzenie: seed.origin,
    certyfikatBio: seed.bio ? "PL-EKO-07 (rolnictwo UE / spoza UE)" : null,
    analizaPdf: { url: `/analizy/${seed.batch}.pdf`, filename: `${seed.batch}.pdf` },
    numerPartii: seed.batch,
    glowneSkladniki: seed.components,
    naCo: seed.naCo,
    zapachOpis: seed.zapach,
    wlasciwosciHtml: seed.wlasciwosci,
    jakStosowacHtml: seed.jakStosowac,
    dawkowanie: seed.dawkowanie,
    bezpieczenstwoHtml: seed.bezpieczenstwo,
    wplywEmocjonalnyHtml: seed.emocje ?? null,
    faq: seed.faq ?? [],
    recepturySlugs: seed.receptury ?? [],
    kompendiumSlug: seed.kompendium ?? null,
    pasujeDo: seed.pasujeDo ?? [],
    seoTitle: null,
    seoDescription: null,
    najnizszaCena30: seed.compareAt ? pln(Math.min(...Object.values(seed.compareAt))) : null,
  };
  const description = `${seed.title} (${seed.latin}), ${type.toLowerCase()} ${seed.bio ? "z certyfikatem BIO" : ""} z analizą GC/MS partii ${seed.batch}. ${seed.naCo.join(", ")}.`;
  return {
    id: `gid://shopify/Product/${100 + index}`,
    handle: seed.handle,
    title: seed.title,
    description,
    descriptionHtml: `<p>${description}</p>`,
    productType: type,
    vendor: "Aromatarius",
    tags: seed.tags,
    images: [image],
    featuredImage: image,
    options: [{ name: "Pojemność", values: variants.map((v) => v.title) }],
    variants,
    priceRange: { min: pln(Math.min(...prices)), max: pln(Math.max(...prices)) },
    availableForSale: variants.some((v) => v.availableForSale),
    updatedAt: NOW,
    meta,
  };
}

export const mockProducts: Product[] = seeds.map(buildProduct);
export const mockSeedColors: Record<string, string> = Object.fromEntries(seeds.map((s) => [s.handle, s.color]));

const needIntro: Record<string, string> = {
  sen: "Olejki tradycyjnie stosowane wieczorem: lawenda, cedr, pomarańcza. Do dyfuzji 30 minut przed snem lub w oleju do masażu stóp.",
  stres: "Cytrusy i kwiaty na napięcie w ciągu dnia: bergamotka, geranium, lawenda. W dyfuzji lub na chusteczce w pracy.",
  odpornosc: "Sezon jesienno-zimowy: ravintsara, cytryna, drzewo herbaciane w dyfuzji rano i wieczorem.",
  oddychanie: "Uczucie zatkanego nosa: eukaliptus, ravintsara, rozmaryn cyneolowy w inhalacji i dyfuzji.",
  skora: "Pielęgnacja: drzewo herbaciane punktowo, geranium i lawenda w kremie, hydrolat różany jako tonik.",
  trawienie: "Mięta pieprzowa w oleju na brzuch po posiłku.",
  bol: "Mięta i rozmaryn w oleju bazowym na skronie, kark i zmęczone mięśnie.",
  dzieci: "Tylko olejki łagodne i w niskim stężeniu: lawenda, pomarańcza, ravintsara od 3 lat. Przeczytaj zasady bezpieczeństwa.",
  dom: "Zapach domu i domowe środki czystości: cytryna, pomarańcza, drzewo herbaciane, cedr.",
  pielegnacja: "Włosy i skóra głowy: rozmaryn, cedr, geranium w oleju jojoba.",
};

function collection(handle: string, title: string, description: string, extra?: Partial<Collection["meta"]>): Collection {
  return {
    id: `gid://shopify/Collection/${handle}`,
    handle,
    title,
    description,
    image: null,
    updatedAt: NOW,
    meta: { introHtml: `<p>${description}</p>`, seoTextHtml: null, faq: [], ikona: null, seoTitle: null, seoDescription: null, ...extra },
  };
}

export const mockCollections: Collection[] = [
  collection("olejki-eteryczne", "Olejki eteryczne", "Certyfikowane olejki eteryczne BIO z analizą GC/MS każdej partii, chemotypem i nazwą łacińską na etykiecie.", {
    seoTextHtml:
      "<h2>Jak wybieramy olejki</h2><p>Każda partia trafia do sprzedaży dopiero po otrzymaniu analizy GC/MS. Sprawdzamy zgodność profilu z normą dla danego gatunku i chemotypu, brak zafałszowań i świeżość.</p><h2>Olejek eteryczny a zapachowy</h2><p>Olejek eteryczny powstaje wyłącznie z rośliny (destylacja parą wodną lub tłoczenie skórki). Olejek zapachowy to kompozycja syntetyczna, nie ma zastosowania w aromaterapii.</p>",
    faq: [
      { pytanie: "Czy wszystkie olejki są BIO?", odpowiedzHtml: "<p>Większość gamy ma certyfikat BIO. Wyjątki oznaczamy wyraźnie na stronie produktu.</p>" },
      { pytanie: "Jak długo olejek zachowuje świeżość?", odpowiedzHtml: "<p>Cytrusy i iglaste 12 do 18 miesięcy od otwarcia, pozostałe 2 do 3 lata. Przechowuj w ciemnym, chłodnym miejscu.</p>" },
    ],
  }),
  collection("hydrolaty", "Hydrolaty", "Wody kwiatowe z destylacji, bez konserwantów. Toniki do każdej cery, także w ciąży i dla dzieci."),
  collection("oleje-roslinne", "Oleje roślinne", "Bazy do rozcieńczania olejków eterycznych: jojoba, migdał, tłoczone na zimno, BIO."),
  collection("mieszanki", "Mieszanki", "Gotowe kompozycje do dyfuzora, ułożone według potrzeb."),
  collection("zestawy", "Zestawy", "Zestawy startowe i tematyczne w niższej cenie niż osobno."),
  collection("dyfuzory", "Dyfuzory", "Dyfuzory ultradźwiękowe i nebulizatory do olejków."),
  collection("bestsellery", "Bestsellery", "Najczęściej wybierane olejki naszych klientów."),
  collection("nowosci", "Nowości", "Ostatnio dodane produkty."),
  collection("promocje", "Promocje", "Aktualne obniżki, z informacją o najniższej cenie z 30 dni."),
  ...Object.entries(needIntro).map(([need, intro]) =>
    collection(`na-${need}`, `Olejki eteryczne na ${labelFor(need)}`, intro, {
      faq: [
        { pytanie: `Który olejek na ${labelFor(need)} wybrać na początek?`, odpowiedzHtml: "<p>Zacznij od pierwszego produktu z listy: to najbezpieczniejszy i najbardziej uniwersalny wybór. Sprawdź przeciwwskazania na stronie produktu.</p>" },
      ],
    }),
  ),
];

function labelFor(need: string): string {
  const map: Record<string, string> = {
    sen: "sen", stres: "stres", odpornosc: "odporność", oddychanie: "oddychanie", skora: "skórę",
    trawienie: "trawienie", bol: "ból", dzieci: "dla dzieci", dom: "do domu", pielegnacja: "pielęgnację",
  };
  return map[need] ?? need;
}

function productsInCollection(handle: string): Product[] {
  const byType: Record<string, string> = {
    "olejki-eteryczne": "Olejek eteryczny",
    hydrolaty: "Hydrolat",
    "oleje-roslinne": "Olej roślinny",
    mieszanki: "Mieszanka",
    zestawy: "Zestaw",
    dyfuzory: "Dyfuzor",
  };
  if (byType[handle]) return mockProducts.filter((p) => p.productType === byType[handle]);
  if (handle === "bestsellery") return mockProducts.filter((p) => p.tags.includes("bestseller"));
  if (handle === "nowosci") return mockProducts.filter((p) => p.tags.includes("nowosc"));
  if (handle === "promocje") return mockProducts.filter((p) => p.variants.some((v) => v.compareAtPrice));
  if (handle.startsWith("na-")) return mockProducts.filter((p) => p.tags.includes(`potrzeba:${handle.slice(3)}`));
  return [];
}

function applyFilters(products: Product[], f: CollectionFilters): Product[] {
  return products.filter((p) => {
    if (f.bio && !p.tags.includes("bio")) return false;
    if (f.potrzeba?.length && !f.potrzeba.some((n) => p.tags.includes(`potrzeba:${n}`))) return false;
    if (f.zapach?.length && !f.zapach.some((z) => p.tags.includes(`zapach:${z}`))) return false;
    if (f.uzycie?.length && !f.uzycie.some((u) => p.tags.includes(`uzycie:${u}`))) return false;
    if (f.bezpieczny?.length && !f.bezpieczny.every((b) => p.tags.includes(`bezpieczny:${b}`))) return false;
    if (f.ml?.length && !p.variants.some((v) => v.volumeMl && f.ml!.includes(v.volumeMl))) return false;
    if (f.priceMin != null && p.priceRange.max.amount < f.priceMin) return false;
    if (f.priceMax != null && p.priceRange.min.amount > f.priceMax) return false;
    return true;
  });
}

function sortProducts(products: Product[], sort: SortKey): Product[] {
  const copy = [...products];
  switch (sort) {
    case "priceAsc":
      return copy.sort((a, b) => a.priceRange.min.amount - b.priceRange.min.amount);
    case "priceDesc":
      return copy.sort((a, b) => b.priceRange.min.amount - a.priceRange.min.amount);
    case "nameAsc":
      return copy.sort((a, b) => a.title.localeCompare(b.title, "pl"));
    case "newest":
      return copy.reverse();
    default:
      return copy;
  }
}

/* ---------- Panier sans état : lignes encodées dans l'id (cookie httpOnly) ---------- */
// Sur Vercel (serverless) une Map en mémoire ne survit pas entre deux requêtes :
// l'id du panier mock encode donc les lignes, et l'adapter réécrit le cookie
// à chaque mutation (index.ts). Remplacé par le vrai cart Shopify en prod.

type StoredLine = { id: string; merchandiseId: string; quantity: number };
const MOCK_PREFIX = "mock:";

/**
 * Codes promo de demonstration. En mode demo il n'y a pas de Shopify pour
 * valider quoi que ce soit : cette table remplace le back-office. Tout autre
 * code est refuse. Des que le store est connecte, ce sont les regles Shopify
 * qui s'appliquent et cette table n'est plus lue.
 */
const MOCK_DISCOUNTS: Record<string, number> = {
  AROMA10: 0.1,
  BOGUSIA20: 0.2,
};

type StoredCart = { lines: StoredLine[]; codes: string[] };

function encodeCart(cart: StoredCart): string {
  const compact = {
    l: cart.lines.map((l) => [l.id, l.merchandiseId.split("/").pop(), l.quantity]),
    d: cart.codes,
  };
  return MOCK_PREFIX + Buffer.from(JSON.stringify(compact), "utf8").toString("base64url");
}

function encodeLines(lines: StoredLine[]): string {
  return encodeCart({ lines, codes: [] });
}

function decodeCart(cartId: string): StoredCart | null {
  if (!cartId.startsWith(MOCK_PREFIX)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(cartId.slice(MOCK_PREFIX.length), "base64url").toString("utf8")) as
      | [string, string, number][]
      | { l: [string, string, number][]; d?: string[] };
    // Les cookies emis avant l'ajout des codes promo encodent un simple tableau.
    const compact = Array.isArray(parsed) ? { l: parsed, d: [] } : parsed;
    return {
      lines: compact.l.map(([id, variant, quantity]) => ({ id, merchandiseId: `gid://shopify/ProductVariant/${variant}`, quantity })),
      codes: compact.d ?? [],
    };
  } catch {
    return null;
  }
}

function findVariant(merchandiseId: string): { product: Product; variant: ProductVariant } | null {
  for (const product of mockProducts) {
    const variant = product.variants.find((v) => v.id === merchandiseId);
    if (variant) return { product, variant };
  }
  return null;
}

function materializeCart(storedLines: StoredLine[], codes: string[] = []): Cart {
  const lines: CartLine[] = storedLines
    .map((l) => {
      const found = findVariant(l.merchandiseId);
      if (!found) return null;
      const { product, variant } = found;
      return {
        id: l.id,
        quantity: l.quantity,
        merchandise: {
          id: variant.id,
          title: variant.title,
          sku: variant.sku,
          volumeMl: variant.volumeMl,
          price: variant.price,
          product: { handle: product.handle, title: product.title, featuredImage: product.featuredImage },
        },
        cost: { total: pln(variant.price.amount * l.quantity) },
      } satisfies CartLine;
    })
    .filter((l): l is CartLine => !!l);
  const subtotal = lines.reduce((s, l) => s + l.cost.total.amount, 0);
  const rate = codes.filter((c) => c in MOCK_DISCOUNTS).reduce((r, c) => r + MOCK_DISCOUNTS[c], 0);
  // Arrondi au grosz, et jamais plus que le sous-total.
  const discountTotal = Math.min(subtotal, Math.round(subtotal * rate * 100) / 100);
  return {
    id: encodeCart({ lines: storedLines, codes }),
    checkoutUrl: `/koszyk?checkout=mock`,
    totalQuantity: lines.reduce((s, l) => s + l.quantity, 0),
    lines,
    discountCodes: codes.map((code) => ({ code, applicable: code in MOCK_DISCOUNTS })),
    discountTotal: pln(discountTotal),
    cost: { subtotal: pln(subtotal), total: pln(subtotal - discountTotal) },
  };
}

export const mockProvider: ShopifyProvider = {
  async getProduct(handle) {
    return mockProducts.find((p) => p.handle === handle) ?? null;
  },
  async getProductsByHandles(handles) {
    return handles
      .map((h) => mockProducts.find((p) => p.handle === h))
      .filter((p): p is Product => !!p)
      .map(productToCard);
  },
  async getAllProductHandles() {
    return mockProducts.map((p) => ({ handle: p.handle, updatedAt: p.updatedAt }));
  },
  async getCollection(handle) {
    return mockCollections.find((c) => c.handle === handle) ?? null;
  },
  async getCollections() {
    return mockCollections;
  },
  async getCollectionProducts(handle, { page, perPage, sort, filters }) {
    if (!mockCollections.some((c) => c.handle === handle)) return null;
    const filtered = sortProducts(applyFilters(productsInCollection(handle), filters), sort);
    const start = (page - 1) * perPage;
    return {
      products: filtered.slice(start, start + perPage).map(productToCard),
      total: filtered.length,
      page,
      perPage,
      totalPages: Math.max(1, Math.ceil(filtered.length / perPage)),
    };
  },
  async searchProducts(query, limit) {
    const q = query.toLowerCase().trim();
    const norm = (s: string) => s.toLowerCase();
    const products = mockProducts
      .filter(
        (p) =>
          norm(p.title).includes(q) ||
          norm(p.meta.nazwaLacinska ?? "").includes(q) ||
          p.tags.some((t) => t.includes(q.replace(/^na /, ""))) ||
          p.meta.naCo.some((n) => norm(n).includes(q)),
      )
      .slice(0, limit)
      .map(productToCard);
    const collections = mockCollections
      .filter((c) => norm(c.title).includes(q))
      .slice(0, 4)
      .map((c) => ({ handle: c.handle, title: c.title }));
    return { products, collections };
  },
  async getShopInfo() {
    return {
      name: "Aromatarius",
      description: "Olejki eteryczne BIO z analizą każdej partii",
      primaryDomain: "aromatarius.pl",
      freeShippingThreshold: pln(150),
    };
  },
  async getMetaobject() {
    return null;
  },
  async createCart(lines) {
    return this.addCartLines(encodeLines([]), lines);
  },
  async getCart(cartId) {
    const stored = decodeCart(cartId);
    return stored ? materializeCart(stored.lines, stored.codes) : null;
  },
  async addCartLines(cartId, lines) {
    const stored = decodeCart(cartId);
    if (!stored) throw new Error("Cart not found");
    for (const l of lines) {
      const existing = stored.lines.find((x) => x.merchandiseId === l.merchandiseId);
      if (existing) existing.quantity += l.quantity;
      else stored.lines.push({ id: `l${Date.now().toString(36)}${stored.lines.length}`, merchandiseId: l.merchandiseId, quantity: l.quantity });
    }
    return materializeCart(stored.lines, stored.codes);
  },
  async updateCartLines(cartId, lines) {
    const stored = decodeCart(cartId);
    if (!stored) throw new Error("Cart not found");
    for (const l of lines) {
      const line = stored.lines.find((x) => x.id === l.id);
      if (line) line.quantity = l.quantity;
    }
    return materializeCart(stored.lines.filter((l) => l.quantity > 0), stored.codes);
  },
  async removeCartLines(cartId, lineIds) {
    const stored = decodeCart(cartId);
    if (!stored) throw new Error("Cart not found");
    return materializeCart(stored.lines.filter((l) => !lineIds.includes(l.id)), stored.codes);
  },
  async updateCartDiscountCodes(cartId, codes) {
    const stored = decodeCart(cartId);
    if (!stored) throw new Error("Cart not found");
    const normalized = codes.map((c) => c.trim().toUpperCase()).filter(Boolean);
    return materializeCart(stored.lines, [...new Set(normalized)]);
  },
};

export type { ProductCardData };

import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";
import { pl } from "@/i18n/pl";
import { blogLink, featuredCollections, homeNeeds, knowledgeLinks, needTitle, promoLink, typeCollections } from "@/lib/navigation";
import { CartButton } from "@/components/shop/CartButton";
import { MegaMenu, type MegaMenuItem } from "./MegaMenu";
import { MobileNav } from "./MobileNav";
import { SearchForm } from "./SearchForm";

const menuItems: MegaMenuItem[] = [
  {
    key: "rodzaje",
    label: pl.nav.types,
    columns: [
      { title: pl.nav.types, links: typeCollections.map((c) => ({ href: `/${c.handle}`, title: c.title })) },
      { title: "Wyróżnione", links: featuredCollections.filter((c) => c.handle !== "promocje").map((c) => ({ href: `/${c.handle}`, title: c.title })) },
    ],
  },
  {
    key: "na-co",
    label: pl.nav.needs,
    columns: [
      { title: pl.nav.needs, links: homeNeeds.map((n) => ({ href: `/na/${n}`, title: needTitle(n) })) },
      { title: "Więcej", links: ["trawienie", "bol", "dzieci", "pielegnacja"].map((n) => ({ href: `/na/${n}`, title: needTitle(n) })) },
    ],
  },
  { key: "wiedza", label: pl.nav.knowledge, columns: [{ title: pl.nav.knowledge, links: [...knowledgeLinks] }] },
];

/**
 * Header : mobile et tablette (< lg) reprennent la maquette (logo, bouton Koszyk
 * en pilule, bouton rond menu) ; desktop (lg+) : méga-menu, Blog et Promocje en
 * premier niveau, recherche, compte, panier.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-sand-200/60 bg-cream-50/80 backdrop-blur">
      <div className="container-page flex h-[72px] items-center gap-3 lg:h-16">
        <Link href="/" className="flex items-center gap-2" aria-label={pl.brand.name}>
          <Image src="/images/logo.svg" alt="" width={36} height={36} priority />
          <span className="font-serif text-xl font-semibold text-leaf-900">{pl.brand.name}</span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Główne">
          <MegaMenu items={menuItems} />
          <Link href={blogLink.href} className="rounded-md px-3 py-2 text-sm font-medium text-ink-900 hover:bg-leaf-100">
            {blogLink.title}
          </Link>
          <Link
            href={promoLink.href}
            className="rounded-md px-3 py-2 text-sm font-semibold text-amber-500 hover:bg-amber-500/10"
          >
            {promoLink.title}
          </Link>
        </nav>

        {/* Desktop : recherche, compte, panier */}
        <div className="ml-auto hidden min-w-0 items-center gap-1 lg:flex">
          {/* Champ fluide : a 1024 px une largeur fixe de 256 px faisait deborder la ligne */}
          <SearchForm className="w-40 min-w-0 shrink xl:w-64" />
          <Link href="/konto" className="flex size-11 items-center justify-center rounded-full hover:bg-leaf-100" aria-label={pl.nav.account}>
            <User className="size-5" aria-hidden />
          </Link>
          <CartButton />
        </div>

        {/* Mobile et tablette : Koszyk en pilule + bouton menu rond (maquette) */}
        <div className="ml-auto flex items-center gap-3 lg:hidden">
          <CartButton variant="pill" />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}

"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { pl } from "@/i18n/pl";
import { blogLink, knowledgeLinks, needs, needTitle, promoLink, typeCollections } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { SearchForm } from "./SearchForm";

/**
 * Menu mobile et tablette, reproduit de la maquette Lovable :
 * panneau plein écran glissant depuis la droite, motif de lignes et branche
 * botanique en fond, colonne décalée, liens principaux en 24px, sous-liens
 * dépliables, bouton « Do sklepu » en pilule.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  // Portal : le header a un backdrop-filter qui piégerait un enfant en position fixed
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const closeRef = useRef<HTMLButtonElement>(null);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.setAttribute("data-menu-open", "");
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.documentElement.removeAttribute("data-menu-open");
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const groups: { key: string; href: string; label: string; sub: { href: string; title: string }[] }[] = [
    {
      key: "rodzaje",
      href: "/olejki-eteryczne",
      label: pl.nav.allProducts,
      sub: typeCollections.map((c) => ({ href: `/${c.handle}`, title: c.title })),
    },
    { key: "na-co", href: "/na/sen", label: pl.nav.needs, sub: needs.map((n) => ({ href: `/na/${n}`, title: needTitle(n) })) },
  ];
  const links = [
    { ...promoLink, accent: true },
    ...knowledgeLinks.filter((l) => l.href !== "/jakosc").map((l) => ({ ...l, accent: false })),
    { ...blogLink, accent: false },
    { href: "/o-nas", title: pl.nav.about, accent: false },
    { href: "/kontakt", title: pl.nav.contact, accent: false },
  ];

  return (
    <>
      <button
        type="button"
        aria-label={pl.nav.menu}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(true)}
        className="grid size-12 place-items-center rounded-full border border-sand-200 bg-card/70 text-ink-900"
      >
        <Menu className="size-5" aria-hidden />
      </button>

      {mounted &&
        createPortal(
      <>
      {/* Zone visible de la page poussée : un tap ferme le menu */}
      <button
        type="button"
        tabIndex={-1}
        aria-label={pl.nav.closeMenu}
        onClick={close}
        className={cn("fixed inset-y-0 left-0 z-[61] w-[34vw] bg-transparent lg:hidden", open ? "block" : "hidden")}
      />
      <aside
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label={pl.nav.menu}
        className={cn(
          "fixed inset-y-0 right-0 z-[55] h-dvh w-screen overflow-hidden bg-card transition-transform duration-[1500ms] ease-[cubic-bezier(0.45,0,0.55,1)]",
          open ? "translate-x-0" : "translate-x-full",
        )}
        aria-hidden={!open}
      >
        <BotanicalBackdrop />

        <div className="relative ml-[38vw] flex h-full flex-col overflow-y-auto px-5 pb-12 pt-4 sm:px-8">
          <div className="flex items-start justify-end">
            <button
              ref={closeRef}
              type="button"
              aria-label={pl.nav.closeMenu}
              onClick={close}
              className="grid size-14 shrink-0 place-items-center rounded-full bg-ink-900/15 text-ink-900 backdrop-blur transition-colors hover:bg-ink-900/25"
            >
              <X className="size-6" aria-hidden />
            </button>
          </div>

          <Link href="/" onClick={close} className="mt-12 flex items-center gap-2 self-start" aria-label={pl.brand.name}>
            <Image src="/images/logo.svg" alt="" width={40} height={40} />
            <span className="font-serif text-2xl font-semibold text-leaf-900">{pl.brand.name}</span>
          </Link>

          <nav className="mt-8" aria-label={pl.nav.menu}>
            <ul>
              {groups.map((g) => {
                const isExpanded = expanded === g.key;
                return (
                  <li key={g.key} className="py-3">
                    <div className="flex items-center justify-between gap-4">
                      <Link href={g.href} onClick={close} className="text-[22px] font-medium leading-tight tracking-tight sm:text-2xl text-ink-900 transition-colors hover:text-leaf-700">
                        {g.label}
                      </Link>
                      <button
                        type="button"
                        aria-label={`${isExpanded ? pl.nav.collapse : pl.nav.expand} ${g.label}`}
                        aria-expanded={isExpanded}
                        onClick={() => setExpanded(isExpanded ? null : g.key)}
                        className="grid size-8 place-items-center text-ink-900/70"
                      >
                        <ChevronDown className={cn("size-5 transition-transform duration-300", isExpanded && "rotate-180")} aria-hidden />
                      </button>
                    </div>
                    <div
                      className="grid overflow-hidden transition-all duration-500"
                      style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr", opacity: isExpanded ? 1 : 0 }}
                    >
                      <ul className="min-h-0 space-y-3 pl-1 pt-4">
                        {g.sub.map((s) => (
                          <li key={s.href}>
                            <Link href={s.href} onClick={close} className="text-base text-ink-600 transition-colors hover:text-leaf-700">
                              {s.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                );
              })}
              {links.map((l) => (
                <li key={l.href} className="py-3">
                  <Link
                    href={l.href}
                    onClick={close}
                    className={cn(
                      "text-[22px] font-medium leading-tight tracking-tight sm:text-2xl transition-colors hover:text-leaf-700",
                      l.accent ? "text-amber-500" : "text-ink-900",
                    )}
                  >
                    {l.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <Link
            href="/olejki-eteryczne"
            onClick={close}
            className="mt-12 rounded-full bg-leaf-700 px-8 py-4 text-center text-xs uppercase tracking-[0.18em] text-cream-50"
          >
            {pl.nav.toShop}
          </Link>

          <div className="mt-8">
            <SearchForm />
          </div>
        </div>
      </aside>
      </>,
          document.body,
        )}
    </>
  );
}

/** Motif de lignes ondulées, eucalyptus en haut à droite, lavande en bas à droite (maquette). */
function BotanicalBackdrop() {
  const pattern = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='420' height='420' viewBox='0 0 420 420'><g fill='none' stroke='rgb(120 110 95)' stroke-opacity='0.14' stroke-width='1'>${Array.from(
      { length: 13 },
      (_, i) => {
        const y = 30 + i * 30;
        return `<path d='M-40 ${y} C 80 ${y - 40 + i * 4}, 180 ${y + 80 + i * 4}, 300 ${y + 15} S 420 ${y - 22 + i * 4}, 470 ${y + 30}'/>`;
      },
    ).join("")}</g></svg>`,
  );
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: `url("data:image/svg+xml;utf8,${pattern}")`, backgroundSize: "420px 420px" }}
        aria-hidden
      />
      {/* Eucalyptus */}
      <svg
        className="pointer-events-none absolute -right-14 -top-12 h-[20rem] w-[11rem] opacity-60 sm:-right-10"
        viewBox="0 0 120 240"
        fill="none"
        aria-hidden
      >
        <path d="M60 240 C 62 180, 58 100, 66 10" stroke="#8a9a7b" strokeWidth="1.6" strokeLinecap="round" />
        {Array.from({ length: 7 }, (_, i) => {
          const y = 30 + i * 30;
          return (
            <g key={i}>
              <ellipse cx={38} cy={y} rx="16" ry="12" fill="#cfe0d3" stroke="#9fb8a6" strokeWidth="1" transform={`rotate(-20 38 ${y})`} />
              <ellipse cx={86} cy={y + 14} rx="16" ry="12" fill="#d9e6dc" stroke="#9fb8a6" strokeWidth="1" transform={`rotate(20 86 ${y + 14})`} />
            </g>
          );
        })}
      </svg>
      {/* Lavande */}
      <svg
        className="pointer-events-none absolute -bottom-10 -right-4 h-[16rem] w-[10rem] rotate-[18deg] opacity-70"
        viewBox="0 0 120 300"
        fill="none"
        aria-hidden
      >
        <path d="M60 300 C 62 220, 58 140, 64 60" stroke="#8a9a7b" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M60 300 C 30 250, 20 220, 26 190" stroke="#8a9a7b" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M26 190 C 10 180, 4 170, 8 160 M26 190 C 40 178, 42 168, 36 158" stroke="#9fb8a6" strokeWidth="1" />
        {Array.from({ length: 9 }, (_, i) => {
          const y = 66 + i * 12;
          return (
            <g key={i}>
              <ellipse cx={54 - (i % 2) * 4} cy={y} rx="5" ry="7" fill="#c9b8e0" stroke="#a894c9" strokeWidth="0.8" />
              <ellipse cx={72 + (i % 2) * 4} cy={y + 6} rx="5" ry="7" fill="#d6c8ea" stroke="#a894c9" strokeWidth="0.8" />
            </g>
          );
        })}
      </svg>
    </>
  );
}

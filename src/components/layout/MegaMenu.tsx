"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type MegaMenuColumn = { title: string; links: { href: string; title: string }[] };
export type MegaMenuItem = { key: string; label: string; columns: MegaMenuColumn[] };

/**
 * Menu desktop : un seul panneau ouvert à la fois, survol ou clic, fermeture
 * en quittant la barre, avec Échap ou en cliquant ailleurs.
 */
export function MegaMenu({ items }: { items: MegaMenuItem[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(null), 120);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div ref={navRef} className="flex items-center gap-1" onMouseLeave={scheduleClose} onMouseEnter={cancelClose}>
      {items.map((item) => {
        const isOpen = open === item.key;
        return (
          <div key={item.key} className="relative" onMouseEnter={() => setOpen(item.key)}>
            <button
              type="button"
              aria-haspopup="true"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : item.key)}
              className={cn(
                "flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-ink-900 transition-colors hover:bg-leaf-100",
                isOpen && "bg-leaf-100",
              )}
            >
              {item.label}
              <ChevronDown className={cn("size-3.5 transition-transform", isOpen && "rotate-180")} aria-hidden />
            </button>
            <div
              className={cn("absolute left-0 top-full z-40 pt-2 transition-opacity", isOpen ? "visible opacity-100" : "invisible opacity-0")}
              hidden={!isOpen}
            >
              <div className="flex gap-8 rounded-md border border-sand-200 bg-card p-6 shadow-lg">
                {item.columns.map((col) => (
                  <div key={col.title} className="min-w-44">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-600">{col.title}</p>
                    <ul className="space-y-1">
                      {col.links.map((l) => (
                        <li key={l.href}>
                          <Link
                            href={l.href}
                            onClick={() => setOpen(null)}
                            className="block rounded px-2 py-1 text-sm hover:bg-leaf-100 hover:text-leaf-900"
                          >
                            {l.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

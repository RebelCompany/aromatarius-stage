"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { pl, t } from "@/i18n/pl";
import { pushEvent } from "@/lib/analytics/dataLayer";
import { FINDER_MAX_NEEDS, finderNeeds } from "@/lib/finder-core";
import { needTitle, type Need } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { NeedIcon } from "./NeedIcon";

type Props = { initial?: Need[] };

/**
 * Étape « Na co? » du parcours guidé. Formulaire GET natif (fonctionne sans JS) ;
 * le JS ajoute la limite de choix, le compteur et la barre d'action sticky.
 */
export function Finder({ initial = [] }: Props) {
  const [selected, setSelected] = useState<Need[]>(initial);
  const max = FINDER_MAX_NEEDS;
  const full = selected.length >= max;

  const toggle = (need: Need) =>
    setSelected((prev) => {
      if (prev.includes(need)) return prev.filter((n) => n !== need);
      if (prev.length >= max) return prev;
      return [...prev, need];
    });

  return (
    <form
      method="get"
      action="/dobierz/wyniki"
      onSubmit={() => pushEvent("finder_submit", { finder_needs: selected.join(",") })}
      className="pb-28 sm:pb-0"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-leaf-700">{t(pl.finder.step, { n: 1, total: 2 })}</p>
      <h2 className="mt-2 text-2xl sm:text-3xl">{pl.finder.needQuestion}</h2>
      <p className="mt-2 text-ink-600">{pl.finder.needHelp}</p>

      <fieldset className="mt-6">
        <legend className="sr-only">{pl.finder.needQuestion}</legend>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {finderNeeds.map((need) => {
            const checked = selected.includes(need);
            const disabled = full && !checked;
            const id = `finder-${need}`;
            return (
              <li key={need}>
                <input
                  id={id}
                  type="checkbox"
                  name="potrzeba"
                  value={need}
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggle(need)}
                  className="peer sr-only"
                />
                <label
                  htmlFor={id}
                  className={cn(
                    "flex h-full min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border bg-card p-4 text-center transition-colors",
                    "peer-focus-visible:ring-3 peer-focus-visible:ring-leaf-500/50",
                    checked ? "border-leaf-700 bg-leaf-100 ring-1 ring-leaf-700" : "border-sand-200 hover:border-leaf-500 hover:bg-leaf-100/60",
                    disabled && "cursor-not-allowed opacity-40",
                  )}
                >
                  <NeedIcon need={need} className={cn(checked && "text-leaf-700")} />
                  <span className="font-serif text-base leading-tight text-leaf-900">{needTitle(need)}</span>
                  <span className="text-xs leading-snug text-ink-600">{pl.finder.hints[need]}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <p className="mt-4 text-sm text-ink-600" aria-live="polite">
        {t(pl.finder.selected, { count: selected.length, max })}
        {full ? ` ${t(pl.finder.max, { max })}` : ""}
      </p>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-sand-200 bg-card/95 p-4 backdrop-blur sm:static sm:mt-8 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <div className="container-page flex flex-col gap-3 sm:flex-row sm:items-center sm:px-0">
          <Button type="submit" size="lg" disabled={selected.length === 0} className="h-12 bg-leaf-900 text-base hover:bg-leaf-700">
            {pl.finder.submit}
            <ArrowRight data-icon="inline-end" aria-hidden />
          </Button>
          <ButtonLink href="/bestsellery" variant="ghost" size="lg" className="h-12 text-base text-leaf-700">
            {pl.finder.unsure}
          </ButtonLink>
        </div>
      </div>
    </form>
  );
}

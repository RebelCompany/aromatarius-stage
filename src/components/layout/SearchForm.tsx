import { Search } from "lucide-react";
import { pl } from "@/i18n/pl";
import { cn } from "@/lib/utils";

type Props = { defaultValue?: string; className?: string; autoFocus?: boolean; size?: "sm" | "lg" };

/** Formulaire GET vers /szukaj (fonctionne sans JS). Recherche prédictive : phase suivante. */
export function SearchForm({ defaultValue = "", className, autoFocus, size = "sm" }: Props) {
  return (
    <form role="search" action="/szukaj" method="get" className={cn("relative", className)}>
      <label htmlFor={`search-${size}`} className="sr-only">
        {pl.search.title}
      </label>
      <input
        id={`search-${size}`}
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={pl.search.placeholder}
        autoComplete="off"
        autoFocus={autoFocus}
        className={cn(
          "w-full rounded-full border border-sand-200 bg-card pl-4 pr-11 text-ink-900 placeholder:text-ink-600/70 focus:border-leaf-500 focus:outline-none",
          size === "lg" ? "h-12 text-base" : "h-10 text-sm",
        )}
      />
      <button
        type="submit"
        className="absolute right-1 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-ink-600 hover:bg-leaf-100 hover:text-leaf-900"
        aria-label={pl.search.submit}
      >
        <Search className="size-4" aria-hidden />
      </button>
    </form>
  );
}

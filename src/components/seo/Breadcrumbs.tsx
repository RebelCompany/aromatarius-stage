import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { pl } from "@/i18n/pl";
import { breadcrumbSchema, type Crumb } from "@/lib/seo/schema";
import { JsonLd } from "./JsonLd";

type Props = { items: Crumb[]; className?: string };

/** Fil d'Ariane visible + BreadcrumbList schema. `items` sans la home. */
export function Breadcrumbs({ items, className }: Props) {
  const all: Crumb[] = [{ name: pl.breadcrumbs.home, href: "/" }, ...items];
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <JsonLd data={breadcrumbSchema(all)} />
      <ol className="flex flex-wrap items-center gap-1 text-sm text-ink-600">
        {all.map((c, i) => {
          const last = i === all.length - 1;
          return (
            <li key={c.href} className="flex items-center gap-1">
              {last ? (
                <span aria-current="page" className="text-ink-900">
                  {c.name}
                </span>
              ) : (
                <Link href={c.href} className="hover:text-leaf-700 hover:underline">
                  {c.name}
                </Link>
              )}
              {!last && <ChevronRight className="size-3.5 opacity-60" aria-hidden />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

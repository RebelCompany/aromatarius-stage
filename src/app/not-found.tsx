import Link from "next/link";
import { pl } from "@/i18n/pl";
import { typeCollections } from "@/lib/navigation";
import { SearchForm } from "@/components/layout/SearchForm";
import { ButtonLink } from "@/components/ui/button-link";

/** 404 avec recherche et collections (docs/04). */
export default function NotFound() {
  return (
    <div className="container-page max-w-2xl py-16 text-center">
      <h1>{pl.errors.notFoundTitle}</h1>
      <p className="mt-3 text-ink-600">{pl.errors.notFoundText}</p>
      <SearchForm size="lg" className="mx-auto mt-6 max-w-md" />
      <h2 className="mt-10 text-lg">{pl.errors.popularCollections}</h2>
      <ul className="mt-3 flex flex-wrap justify-center gap-2">
        {typeCollections.slice(0, 4).map((c) => (
          <li key={c.handle}>
            <Link href={`/${c.handle}`} className="rounded-full border border-sand-200 px-4 py-2 text-sm hover:bg-leaf-100">
              {c.title}
            </Link>
          </li>
        ))}
      </ul>
      <ButtonLink href="/" className="mt-8 bg-leaf-900 hover:bg-leaf-700">
        {pl.errors.notFoundCta}
      </ButtonLink>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { pl, t } from "@/i18n/pl";
import { buildMetadata } from "@/lib/seo/metadata";
import { searchProducts } from "@/lib/shopify";
import { SearchForm } from "@/components/layout/SearchForm";
import { ProductGrid } from "@/components/shop/ProductGrid";

type Props = { searchParams: Promise<{ q?: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q = "" } = await searchParams;
  return buildMetadata({
    title: q ? `${t(pl.search.resultsFor, { query: q })} | Aromatarius` : `${pl.search.title} | Aromatarius`,
    description: pl.search.placeholder,
    path: "/szukaj",
    noindex: true,
  });
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const result = q ? await searchProducts(q) : { products: [], collections: [] };

  return (
    <div className="container-page py-8 md:py-12">
      <h1 className="mb-6">{q ? t(pl.search.resultsFor, { query: q }) : pl.search.title}</h1>
      <SearchForm defaultValue={q} size="lg" className="mb-8 max-w-xl" autoFocus={!q} />

      {q && result.collections.length > 0 && (
        <section className="mb-8" aria-labelledby="search-collections">
          <h2 id="search-collections" className="mb-2 text-lg">
            {pl.search.collections}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {result.collections.map((c) => (
              <li key={c.handle}>
                <Link href={c.handle.startsWith("na-") ? `/na/${c.handle.slice(3)}` : `/${c.handle}`} className="rounded-full border border-sand-200 px-3 py-1.5 text-sm hover:bg-leaf-100">
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {q && (
        <section aria-labelledby="search-products">
          <h2 id="search-products" className="mb-4 text-lg">
            {pl.search.products}
          </h2>
          {result.products.length === 0 ? (
            <p className="rounded-md border border-sand-200 bg-card p-8 text-ink-600">{pl.search.noResults}</p>
          ) : (
            <ProductGrid products={result.products} listName="search" />
          )}
        </section>
      )}
    </div>
  );
}

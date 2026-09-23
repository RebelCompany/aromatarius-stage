import Link from "next/link";
import { Plus } from "lucide-react";
import { pl, t } from "@/i18n/pl";
import { filterLabels, filterOptions, needs, needTitle } from "@/lib/navigation";
import type { SearchParams } from "@/lib/plp";
import { collectionPageSchema, itemListSchema } from "@/lib/seo/schema";
import type { Collection, CollectionFilters, CollectionProductsResult, SortKey } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";
import { FaqAccordion } from "@/components/content/FaqAccordion";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { ProductGrid } from "./ProductGrid";
import { SortSelect } from "./SortSelect";

type Props = {
  collection: Collection;
  result: CollectionProductsResult;
  path: string;
  params: SearchParams;
  sort: SortKey;
  filters: CollectionFilters;
  hasFilters: boolean;
  /** Masque le filtre "potrzeba" sur les pages /na/* */
  hideNeedFilter?: boolean;
};

/** Page collection (PLP) : H1 + intro, filtres, grille, pagination, texte SEO, FAQ (docs/05). */
export function CollectionView({ collection, result, path, params, sort, filters, hasFilters, hideNeedFilter }: Props) {
  const { products, total, page, totalPages } = result;
  return (
    <div className="container-page py-6 md:py-10">
      <JsonLd
        data={[
          collectionPageSchema({ name: collection.title, description: collection.description, path }),
          itemListSchema(products, collection.title),
        ]}
      />
      <Breadcrumbs items={[{ name: collection.title, href: path }]} className="mb-4" />
      <header className="mb-6 max-w-3xl">
        <h1>{collection.title}</h1>
        {collection.meta.introHtml && (
          <div className="prose-aroma mt-3 text-ink-600" dangerouslySetInnerHTML={{ __html: collection.meta.introHtml }} />
        )}
        <p className="mt-2 text-sm text-ink-600">{t(pl.collection.productsCount, { count: total })}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside>
          {/*
            Mobile : panneau repliable. Desktop : sidebar toujours visible.
            Deux rendus distincts et non un seul <details> : le contenu d'un
            <details> ferme est masque par le navigateur, aucune classe CSS ne
            peut le reafficher de maniere fiable.
          */}
          <details className="group rounded-md border border-sand-200 bg-card lg:hidden" open={hasFilters}>
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-medium [&::-webkit-details-marker]:hidden">
              <span>
                {pl.collection.filter} {hasFilters ? "•" : ""}
              </span>
              <Plus className="size-4 shrink-0 transition-transform group-open:rotate-45" aria-hidden />
            </summary>
            <FiltersForm
              path={path}
              sort={sort}
              filters={filters}
              hasFilters={hasFilters}
              hideNeedFilter={hideNeedFilter}
              className="px-4 pb-4"
            />
          </details>
          <div className="hidden lg:block">
            <FiltersForm
              path={path}
              sort={sort}
              filters={filters}
              hasFilters={hasFilters}
              hideNeedFilter={hideNeedFilter}
            />
          </div>
        </aside>

        <div>
          <div className="mb-4 flex items-center justify-end">
            <SortSelect current={sort} />
          </div>
          {products.length === 0 ? (
            <p className="rounded-md border border-sand-200 bg-card p-8 text-center text-ink-600">{pl.collection.empty}</p>
          ) : (
            <ProductGrid products={products} listName={`collection_${collection.handle}`} priorityCount={2} />
          )}
          {totalPages > 1 && <Pagination path={path} params={params} page={page} totalPages={totalPages} />}
        </div>
      </div>

      {(collection.meta.seoTextHtml || collection.meta.faq.length > 0) && (
        <div className="mt-16 grid gap-10 lg:grid-cols-2">
          {collection.meta.seoTextHtml && (
            <div className="prose-aroma" dangerouslySetInnerHTML={{ __html: collection.meta.seoTextHtml }} />
          )}
          <FaqAccordion items={collection.meta.faq} title={pl.product.faq} />
        </div>
      )}
    </div>
  );
}

/** Formulaire de filtres, rendu deux fois : panneau mobile et sidebar desktop. */
function FiltersForm({
  path,
  sort,
  filters,
  hasFilters,
  hideNeedFilter,
  className,
}: {
  path: string;
  sort: SortKey;
  filters: CollectionFilters;
  hasFilters: boolean;
  hideNeedFilter?: boolean;
  className?: string;
}) {
  return (
    <form method="get" action={path} className={cn("divide-y divide-sand-200", className)}>
      <input type="hidden" name="sort" value={sort} />
      <label className="flex items-center gap-2 py-3 text-sm font-medium">
        <input type="checkbox" name="bio" value="1" defaultChecked={filters.bio} className="size-4 accent-leaf-700" />
        {pl.collection.filters.bio}
      </label>
      {!hideNeedFilter && (
        <FilterGroup name="potrzeba" label={pl.collection.filters.need} values={[...needs]} selected={filters.potrzeba ?? []} labelFor={needTitle} />
      )}
      <FilterGroup name="zapach" label={pl.collection.filters.scent} values={[...filterOptions.zapach]} selected={filters.zapach ?? []} labelFor={(v) => filterLabels[v] ?? v} />
      <FilterGroup name="uzycie" label={pl.collection.filters.usage} values={[...filterOptions.uzycie]} selected={filters.uzycie ?? []} labelFor={(v) => filterLabels[v] ?? v} />
      <FilterGroup name="bezpieczny" label={pl.collection.filters.safety} values={[...filterOptions.bezpieczny]} selected={filters.bezpieczny ?? []} labelFor={(v) => filterLabels[v] ?? v} />
      <FilterGroup name="ml" label={pl.product.variantLabel} values={filterOptions.ml.map(String)} selected={(filters.ml ?? []).map(String)} labelFor={(v) => `${v} ml`} />
      <div className="flex gap-2 pt-4">
        <button type="submit" className="h-10 flex-1 rounded-lg bg-leaf-900 px-4 text-sm font-medium text-cream-50 hover:bg-leaf-700">
          {pl.collection.filter}
        </button>
        {hasFilters && (
          <Link href={path} className="flex h-10 items-center rounded-lg border border-sand-200 px-3 text-sm hover:bg-leaf-100">
            {pl.collection.clearFilters}
          </Link>
        )}
      </div>
    </form>
  );
}

/**
 * Un groupe = un accordeon. Ouvert d'office quand il porte une selection,
 * pour que le client voie tout de suite ce qui filtre sa liste.
 */
function FilterGroup({
  name,
  label,
  values,
  selected,
  labelFor,
}: {
  name: string;
  label: string;
  values: string[];
  selected: string[];
  labelFor: (v: string) => string;
}) {
  return (
    <details className="group/acc py-1" open={selected.length > 0}>
      <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-sm font-semibold text-leaf-900 [&::-webkit-details-marker]:hidden">
        <span>
          {label}
          {selected.length > 0 && <span className="ml-1 font-normal text-ink-600">({selected.length})</span>}
        </span>
        <Plus className="size-4 shrink-0 text-ink-600 transition-transform group-open/acc:rotate-45" aria-hidden />
      </summary>
      <div className="space-y-1.5 pb-3">
        {values.map((v) => (
          <label key={v} className="flex items-center gap-2 text-sm">
            <input type="checkbox" name={name} value={v} defaultChecked={selected.includes(v)} className="size-4 accent-leaf-700" />
            {labelFor(v)}
          </label>
        ))}
      </div>
    </details>
  );
}

/** Pagination classique avec vrais liens <a> (docs/04). */
function Pagination({ path, params, page, totalPages }: { path: string; params: SearchParams; page: number; totalPages: number }) {
  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (k === "page" || v == null) continue;
      for (const item of Array.isArray(v) ? v : [v]) sp.append(k, item);
    }
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `${path}?${qs}` : path;
  };
  return (
    <nav aria-label="Paginacja" className="mt-8 flex items-center justify-center gap-2">
      {page > 1 && (
        <Link href={href(page - 1)} className="rounded-lg border border-sand-200 px-3 py-2 text-sm hover:bg-leaf-100">
          {pl.collection.pagination.prev}
        </Link>
      )}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          href={href(p)}
          aria-current={p === page ? "page" : undefined}
          className={`rounded-lg px-3 py-2 text-sm ${p === page ? "bg-leaf-900 text-cream-50" : "border border-sand-200 hover:bg-leaf-100"}`}
        >
          {p}
        </Link>
      ))}
      {page < totalPages && (
        <Link href={href(page + 1)} className="rounded-lg border border-sand-200 px-3 py-2 text-sm hover:bg-leaf-100">
          {pl.collection.pagination.next}
        </Link>
      )}
    </nav>
  );
}

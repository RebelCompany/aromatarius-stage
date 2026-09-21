import { getProductsByHandles } from "@/lib/shopify";
import { ProductGrid } from "@/components/shop/ProductGrid";

type Props = { handles: string[]; title: string; listName?: string };

/** Résout des handles en ProductCards via l'adapter (prix et dispo à jour). */
export async function RelatedProducts({ handles, title, listName = "related" }: Props) {
  if (!handles.length) return null;
  const products = await getProductsByHandles(handles);
  if (!products.length) return null;
  return (
    <section aria-labelledby={`${listName}-title`} className="mt-12">
      <h2 id={`${listName}-title`} className="mb-4">
        {title}
      </h2>
      <ProductGrid products={products} listName={listName} />
    </section>
  );
}

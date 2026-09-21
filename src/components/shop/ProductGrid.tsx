import type { ProductCardData } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";

type Props = { products: ProductCardData[]; listName: string; priorityCount?: number; className?: string };

/** Grille 2 colonnes mobile, 3 tablette, 4 desktop (docs/05). */
export function ProductGrid({ products, listName, priorityCount = 0, className }: Props) {
  return (
    <ul className={cn("grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4", className)} data-list={listName}>
      {products.map((p, i) => (
        <li key={p.id}>
          <ProductCard product={p} priority={i < priorityCount} index={i} listName={listName} className="h-full" />
        </li>
      ))}
    </ul>
  );
}

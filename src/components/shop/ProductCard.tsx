import Link from "next/link";
import { Star } from "lucide-react";
import { pl } from "@/i18n/pl";
import { formatMoney } from "@/lib/format";
import type { ProductCardData } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "./ProductImage";
import { QuickAdd } from "./QuickAdd";

type Props = {
  product: ProductCardData;
  priority?: boolean;
  index?: number;
  listName?: string;
  className?: string;
};

/** Carte produit identique partout : home, PLP, receptura, cross-sell (docs/05). */
export function ProductCard({ product, priority = false, className }: Props) {
  const href = `/produkt/${product.handle}`;
  const hasRange = product.priceRange.min.amount !== product.priceRange.max.amount;
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-md border border-sand-200 bg-card transition-shadow hover:shadow-md",
        className,
      )}
    >
      <Link href={href} className="relative block aspect-square overflow-hidden bg-cream-50" tabIndex={-1} aria-hidden>
        <ProductImage
          image={product.featuredImage}
          sizes="(min-width: 1280px) 300px, (min-width: 768px) 33vw, 50vw"
          priority={priority}
          className="transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {product.onPromo && (
          <Badge className="absolute right-2 top-2 bg-danger text-white">{pl.product.promoBadge}</Badge>
        )}
        <div className="absolute left-2 top-2 flex gap-1">
          {product.isBio && <Badge className="bg-amber-500 text-white">{pl.product.bioBadge}</Badge>}
          {product.chemotyp && (
            <Badge variant="secondary" className="bg-leaf-100 text-leaf-900">
              ct. {product.chemotyp.split("/")[0].trim()}
            </Badge>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
        <h3 className="font-serif text-base leading-snug md:text-lg">
          <Link href={href} className="after:absolute after:inset-0 hover:text-leaf-700">
            {product.title}
          </Link>
        </h3>
        {product.nazwaLacinska && <p className="latin text-sm">{product.nazwaLacinska}</p>}
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <p className="text-base font-semibold text-ink-900">
            {hasRange && <span className="mr-1 text-sm font-normal text-ink-600">{pl.product.from}</span>}
            {formatMoney(product.priceRange.min)}
          </p>
          {product.rating && (
            <p className="flex items-center gap-1 text-sm text-ink-600">
              <Star className="size-3.5 fill-amber-500 text-amber-500" aria-hidden />
              {product.rating.value.toFixed(1)} ({product.rating.count})
            </p>
          )}
        </div>
        {!product.availableForSale && <p className="text-xs text-ink-600">{pl.product.outOfStock}</p>}
      </div>
      {product.availableForSale && product.defaultVariantId && (
        <div className="relative z-10 hidden px-4 pb-4 md:block">
          <QuickAdd merchandiseId={product.defaultVariantId} />
        </div>
      )}
    </article>
  );
}

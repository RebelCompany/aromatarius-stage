import Image from "next/image";
import type { ProductImage as ProductImageType } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

type Props = {
  image: ProductImageType | null;
  sizes: string;
  priority?: boolean;
  className?: string;
  fill?: boolean;
};

/**
 * next/image avec `sizes` obligatoire et `priority` uniquement sur le LCP (règle 5).
 * Les SVG de démo passent en `unoptimized`, les images Shopify CDN sont optimisées.
 */
export function ProductImage({ image, sizes, priority = false, className, fill = true }: Props) {
  if (!image) {
    return (
      <div
        className={cn("flex items-center justify-center bg-leaf-100 text-ink-600", className)}
        aria-hidden
      >
        <span className="font-serif italic">Aromatarius</span>
      </div>
    );
  }
  const isSvg = image.url.endsWith(".svg");
  return (
    <Image
      src={image.url}
      alt={image.alt}
      sizes={sizes}
      priority={priority}
      fetchPriority={priority ? "high" : undefined}
      unoptimized={isSvg}
      className={cn("object-cover", className)}
      {...(fill ? { fill: true } : { width: image.width, height: image.height })}
    />
  );
}

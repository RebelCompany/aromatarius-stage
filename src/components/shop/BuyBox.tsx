"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { pl, t } from "@/i18n/pl";
import { pushEvent, variantToItem } from "@/lib/analytics/dataLayer";
import { formatMoney } from "@/lib/format";
import type { Money, Product } from "@/lib/shopify/types";
import { Button } from "@/components/ui/button";
import { useCart } from "./CartProvider";
import { PriceTag } from "./PriceTag";
import { StockBadge } from "./StockBadge";
import { VariantSelector } from "./VariantSelector";

type Props = { product: Product; freeShippingThreshold: Money };

/**
 * Colonne d'achat PDP : prix, sélecteur de variante, AddToCart, ligne livraison.
 * Sticky bar mobile dès que le bouton principal sort du viewport.
 */
export function BuyBox({ product, freeShippingThreshold }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { add, pending } = useCart();
  const initial =
    product.variants.find((v) => v.id === searchParams.get("variant")) ??
    product.variants.find((v) => v.availableForSale) ??
    product.variants[0];
  const [selectedId, setSelectedId] = useState(initial.id);
  const variant = product.variants.find((v) => v.id === selectedId) ?? initial;
  const [showSticky, setShowSticky] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    pushEvent("view_item", { value: variant.price.amount, items: [variantToItem(product, variant)] });
    // uniquement au montage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = buttonRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setShowSticky(!entry.isIntersecting), {
      rootMargin: "0px 0px -1px 0px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function select(id: string) {
    setSelectedId(id);
    const params = new URLSearchParams(searchParams.toString());
    params.set("variant", id);
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  const addButton = (
    <Button
      type="button"
      size="lg"
      className="h-12 w-full bg-leaf-900 text-base hover:bg-leaf-700"
      disabled={pending || !variant.availableForSale}
      onClick={() => add([{ merchandiseId: variant.id, quantity: 1 }])}
    >
      <ShoppingBag data-icon="inline-start" aria-hidden />
      {pending ? pl.product.adding : pl.product.addToCart}
    </Button>
  );

  return (
    <div className="flex flex-col gap-5">
      <PriceTag
        price={variant.price}
        compareAtPrice={variant.compareAtPrice}
        lowestPrice30={product.meta.najnizszaCena30}
        volumeMl={variant.volumeMl}
      />
      <VariantSelector variants={product.variants} selectedId={variant.id} onSelect={select} />
      <StockBadge available={variant.availableForSale} quantity={variant.quantityAvailable} />
      <div ref={buttonRef}>{addButton}</div>
      <ul className="space-y-1 text-sm text-ink-600">
        <li>{t(pl.product.shippingLine, { amount: formatMoney(freeShippingThreshold) })}</li>
        <li>{pl.product.returnsLine}</li>
      </ul>

      {/* Sticky add-to-cart mobile */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-sand-200 bg-card/95 p-3 backdrop-blur transition-transform md:hidden ${
          showSticky ? "translate-y-0" : "translate-y-full"
        }`}
        aria-hidden={!showSticky}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-sm">{product.title}</p>
            <p className="text-sm font-semibold">
              {variant.title} · {formatMoney(variant.price)}
            </p>
          </div>
          <div className="w-44">{addButton}</div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { ShoppingBag } from "lucide-react";
import { pl } from "@/i18n/pl";
import { useCart } from "./CartProvider";

/** Icône panier avec le nombre d'articles, identique sur mobile et desktop. */
export function CartButton() {
  const { cart, setOpen } = useCart();
  const count = cart?.totalQuantity ?? 0;

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="relative flex size-11 items-center justify-center rounded-full hover:bg-leaf-100"
      aria-label={`${pl.cart.open} (${count})`}
    >
      <ShoppingBag className="size-5" aria-hidden />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-leaf-900 text-[11px] font-semibold text-cream-50">
          {count}
        </span>
      )}
    </button>
  );
}

"use client";

import { ShoppingBag } from "lucide-react";
import { pl } from "@/i18n/pl";
import { useCart } from "./CartProvider";

type Props = { variant?: "icon" | "pill" };

export function CartButton({ variant = "icon" }: Props) {
  const { cart, setOpen } = useCart();
  const count = cart?.totalQuantity ?? 0;

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center gap-2 rounded-full bg-leaf-700 px-6 text-xs uppercase tracking-[0.18em] text-cream-50 transition-transform duration-300 hover:scale-105"
        aria-label={`${pl.cart.open} (${count})`}
      >
        {pl.nav.cart}
        {count > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-cream-50 text-[11px] font-semibold tracking-normal text-leaf-900">
            {count}
          </span>
        )}
      </button>
    );
  }

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

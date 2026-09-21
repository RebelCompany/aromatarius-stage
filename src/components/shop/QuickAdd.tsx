"use client";

import { ShoppingBag } from "lucide-react";
import { pl } from "@/i18n/pl";
import { Button } from "@/components/ui/button";
import { useCart } from "./CartProvider";

type Props = { merchandiseId: string };

/** Bouton "Do koszyka" rapide sur desktop (ProductCard). */
export function QuickAdd({ merchandiseId }: Props) {
  const { add, pending } = useCart();
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="w-full border-leaf-700 text-leaf-900 hover:bg-leaf-100"
      disabled={pending}
      onClick={() => add([{ merchandiseId, quantity: 1 }])}
    >
      <ShoppingBag data-icon="inline-start" aria-hidden />
      {pl.product.addToCart}
    </Button>
  );
}

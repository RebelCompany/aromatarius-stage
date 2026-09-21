"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import { lineToItem, pushEvent } from "@/lib/analytics/dataLayer";
import {
  addToCartAction,
  getCartAction,
  removeCartLineAction,
  updateCartLineAction,
} from "@/lib/shopify/actions";
import type { Cart } from "@/lib/shopify/types";

type CartContextValue = {
  cart: Cart | null;
  open: boolean;
  setOpen: (open: boolean) => void;
  pending: boolean;
  error: string | null;
  add: (lines: { merchandiseId: string; quantity: number }[]) => Promise<boolean>;
  update: (lineId: string, quantity: number) => Promise<void>;
  remove: (lineId: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

/**
 * Store panier côté client. Le panier est lu au montage via Server Action
 * (cookie httpOnly géré par l'adapter), les pages restent statiques/ISR.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    const c = await getCartAction();
    setCart(c);
  }, []);

  useEffect(() => {
    let active = true;
    getCartAction().then((c) => {
      if (active) setCart(c);
    });
    return () => {
      active = false;
    };
  }, []);

  const add = useCallback(
    (lines: { merchandiseId: string; quantity: number }[]) =>
      new Promise<boolean>((resolve) => {
        setError(null);
        startTransition(async () => {
          const result = await addToCartAction(lines);
          if (result.ok) {
            setCart(result.cart);
            setOpen(true);
            const added = result.cart.lines.filter((l) => lines.some((x) => x.merchandiseId === l.merchandise.id));
            pushEvent("add_to_cart", {
              value: added.reduce((s, l) => s + l.merchandise.price.amount, 0),
              items: added.map(lineToItem),
            });
            resolve(true);
          } else {
            setError(result.error);
            resolve(false);
          }
        });
      }),
    [],
  );

  const update = useCallback(
    (lineId: string, quantity: number) =>
      new Promise<void>((resolve) => {
        startTransition(async () => {
          const result = await updateCartLineAction(lineId, quantity);
          if (result.ok) setCart(result.cart);
          else setError(result.error);
          resolve();
        });
      }),
    [],
  );

  const remove = useCallback(
    (lineId: string) =>
      new Promise<void>((resolve) => {
        const line = cart?.lines.find((l) => l.id === lineId);
        startTransition(async () => {
          const result = await removeCartLineAction(lineId);
          if (result.ok) {
            setCart(result.cart);
            if (line) pushEvent("remove_from_cart", { value: line.cost.total.amount, items: [lineToItem(line)] });
          } else setError(result.error);
          resolve();
        });
      }),
    [cart],
  );

  const value = useMemo(
    () => ({ cart, open, setOpen, pending, error, add, update, remove, refresh }),
    [cart, open, pending, error, add, update, remove, refresh],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans <CartProvider>");
  return ctx;
}

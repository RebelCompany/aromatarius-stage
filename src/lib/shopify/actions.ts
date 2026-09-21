"use server";

import { addToCart, getCart, removeCartLine, updateCartLine } from "./index";
import type { Cart } from "./types";

/**
 * Server Actions panier, appelées depuis les composants client
 * (AddToCart, CartDrawer). Font partie de l'adapter.
 */

export type CartActionResult = { ok: true; cart: Cart } | { ok: false; error: string };

export async function addToCartAction(
  lines: { merchandiseId: string; quantity: number }[],
): Promise<CartActionResult> {
  try {
    const valid = lines.filter((l) => l.merchandiseId && l.quantity > 0);
    if (!valid.length) return { ok: false, error: "Brak produktu do dodania." };
    const cart = await addToCart(valid);
    return { ok: true, cart };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Nie udało się dodać do koszyka." };
  }
}

export async function updateCartLineAction(lineId: string, quantity: number): Promise<CartActionResult> {
  try {
    const cart = await updateCartLine(lineId, quantity);
    if (!cart) return { ok: false, error: "Brak koszyka." };
    return { ok: true, cart };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Nie udało się zaktualizować koszyka." };
  }
}

export async function removeCartLineAction(lineId: string): Promise<CartActionResult> {
  try {
    const cart = await removeCartLine(lineId);
    if (!cart) return { ok: false, error: "Brak koszyka." };
    return { ok: true, cart };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Nie udało się usunąć produktu." };
  }
}

export async function getCartAction(): Promise<Cart | null> {
  return getCart();
}

"use server";

import { pl } from "@/i18n/pl";
import {
  addToCart,
  applyDiscountCode,
  createPartnerLead,
  getCart,
  getCurrentCustomer,
  removeCartLine,
  removeDiscountCode,
  updateCartLine,
} from "./index";
import { parsePartnership, type PartnershipErrors } from "@/lib/b2b";
import type { Cart, Customer } from "./types";

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

export async function applyDiscountCodeAction(code: string): Promise<CartActionResult> {
  try {
    if (!code.trim()) return { ok: false, error: pl.cart.promoEmpty };
    const result = await applyDiscountCode(code);
    if (!result) return { ok: false, error: pl.cart.promoNoCart };
    if (!result.applied) return { ok: false, error: pl.cart.promoInvalid };
    return { ok: true, cart: result.cart };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : pl.cart.promoError };
  }
}

export async function removeDiscountCodeAction(code: string): Promise<CartActionResult> {
  try {
    const cart = await removeDiscountCode(code);
    if (!cart) return { ok: false, error: pl.cart.promoNoCart };
    return { ok: true, cart };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : pl.cart.promoError };
  }
}

export async function getCartAction(): Promise<Cart | null> {
  return getCart();
}

/* ---------- Compte client ---------- */

/**
 * La connexion et la deconnexion passent par des Route Handlers, pas par des
 * Server Actions : le flux OAuth est une suite de redirections. Il ne reste
 * ici que la lecture de session, pour le store client.
 */
export async function getCurrentCustomerAction(): Promise<Customer | null> {
  return getCurrentCustomer();
}

/* ---------- Partenariat ---------- */

export type PartnershipResult =
  | { ok: true }
  | { ok: false; errors: PartnershipErrors }
  | { ok: false; failed: true };

/**
 * Validation cote serveur avant tout appel reseau : les attributs required du
 * formulaire ne protegent de rien, une Server Action etant appelable seule.
 */
export async function submitPartnershipAction(form: FormData): Promise<PartnershipResult> {
  const raw = Object.fromEntries(
    ["fullName", "company", "nip", "email", "phone", "kind", "message"].map((k) => [k, String(form.get(k) ?? "")]),
  );

  const parsed = parsePartnership(raw);
  if (!parsed.ok) return { ok: false, errors: parsed.errors };

  try {
    const code = await createPartnerLead(parsed.data);
    // Un e-mail deja connu veut dire que la demande est arrivee : cote client
    // c'est un succes, sans quoi la personne renverrait le formulaire en boucle.
    if (code === "FAILED") return { ok: false, failed: true };
    return { ok: true };
  } catch {
    return { ok: false, failed: true };
  }
}

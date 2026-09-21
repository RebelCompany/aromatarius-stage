/**
 * Événements GA4 e-commerce poussés dans le dataLayer (docs/08).
 * `purchase` est envoyé depuis le checkout Shopify, jamais d'ici.
 */
import type { Cart, CartLine, Product, ProductCardData, ProductVariant } from "@/lib/shopify/types";

export type GaItem = {
  item_id: string;
  item_name: string;
  item_brand: "Aromatarius";
  item_category?: string;
  item_variant?: string;
  price: number;
  quantity: number;
  index?: number;
  item_list_name?: string;
};

type EventName =
  | "view_item_list"
  | "select_item"
  | "view_item"
  | "add_to_cart"
  | "remove_from_cart"
  | "view_cart"
  | "begin_checkout"
  | "search"
  | "sign_up"
  | "newsletter_signup"
  | "download_analysis"
  | "finder_submit";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export function pushEvent(event: EventName, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  // Reset de l'objet ecommerce entre deux événements (recommandation GA4)
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({ event, ecommerce: { currency: "PLN", ...params } });
}

export function cardToItem(p: ProductCardData, index?: number, listName?: string): GaItem {
  return {
    item_id: p.defaultVariantId,
    item_name: p.title,
    item_brand: "Aromatarius",
    item_category: p.productType,
    price: p.priceRange.min.amount,
    quantity: 1,
    index,
    item_list_name: listName,
  };
}

export function variantToItem(product: Product, variant: ProductVariant, quantity = 1): GaItem {
  return {
    item_id: variant.sku || variant.id,
    item_name: product.title,
    item_brand: "Aromatarius",
    item_category: product.productType,
    item_variant: variant.title,
    price: variant.price.amount,
    quantity,
  };
}

export function lineToItem(line: CartLine): GaItem {
  return {
    item_id: line.merchandise.sku || line.merchandise.id,
    item_name: line.merchandise.product.title,
    item_brand: "Aromatarius",
    item_variant: line.merchandise.title,
    price: line.merchandise.price.amount,
    quantity: line.quantity,
  };
}

export function cartValue(cart: Cart): number {
  return cart.cost.subtotal.amount;
}

"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { pl, t } from "@/i18n/pl";
import { lineToItem, pushEvent } from "@/lib/analytics/dataLayer";
import { formatMoney } from "@/lib/format";
import type { Cart, Money } from "@/lib/shopify/types";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "./CartProvider";
import { FreeShippingBar } from "./FreeShippingBar";
import { ProductImage } from "./ProductImage";

type Props = { freeShippingThreshold: Money };

export function CartDrawer({ freeShippingThreshold }: Props) {
  const { cart, open, setOpen, pending, error, update, remove } = useCart();
  const isEmpty = !cart || cart.lines.length === 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md" aria-describedby={undefined}>
        <SheetHeader>
          <SheetTitle className="font-serif text-xl text-leaf-900">{pl.cart.title}</SheetTitle>
          <SheetDescription className="sr-only">{pl.cart.shippingNote}</SheetDescription>
        </SheetHeader>

        {isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
            <ShoppingBag className="size-10 text-leaf-500" aria-hidden />
            <p className="text-ink-600">{pl.cart.empty}</p>
            <ButtonLink href="/olejki-eteryczne" onClick={() => setOpen(false)}>
              {pl.cart.emptyCta}
            </ButtonLink>
          </div>
        ) : (
          <>
            <div className="px-4">
              <FreeShippingBar subtotal={cart.cost.subtotal} threshold={freeShippingThreshold} />
            </div>
            <ul className="flex-1 divide-y divide-sand-200 overflow-y-auto px-4" aria-live="polite" aria-busy={pending}>
              {cart.lines.map((line) => (
                <li key={line.id} className="flex gap-3 py-4">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-cream-50">
                    <ProductImage image={line.merchandise.product.featuredImage} sizes="80px" />
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <Link
                      href={`/produkt/${line.merchandise.product.handle}`}
                      className="font-serif leading-snug hover:text-leaf-700"
                      onClick={() => setOpen(false)}
                    >
                      {line.merchandise.product.title}
                    </Link>
                    <p className="text-sm text-ink-600">{line.merchandise.title}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-sand-200" role="group" aria-label={pl.cart.quantity}>
                        <button
                          type="button"
                          className="flex size-9 items-center justify-center rounded-full hover:bg-leaf-100 disabled:opacity-40"
                          aria-label={`${pl.cart.quantity} -1`}
                          disabled={pending}
                          onClick={() => update(line.id, line.quantity - 1)}
                        >
                          <Minus className="size-4" aria-hidden />
                        </button>
                        <span className="w-8 text-center text-sm tabular-nums">{line.quantity}</span>
                        <button
                          type="button"
                          className="flex size-9 items-center justify-center rounded-full hover:bg-leaf-100 disabled:opacity-40"
                          aria-label={`${pl.cart.quantity} +1`}
                          disabled={pending}
                          onClick={() => update(line.id, line.quantity + 1)}
                        >
                          <Plus className="size-4" aria-hidden />
                        </button>
                      </div>
                      <p className="font-semibold tabular-nums">{formatMoney(line.cost.total)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="self-start rounded-full p-2 text-ink-600 hover:bg-leaf-100 hover:text-danger"
                    aria-label={`${pl.cart.remove}: ${line.merchandise.product.title}`}
                    disabled={pending}
                    onClick={() => remove(line.id)}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
            {error && <p className="px-4 text-sm text-danger" role="alert">{error}</p>}
            <SheetFooter className="border-t border-sand-200">
              <CartSummary cart={cart} />
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function CartSummary({ cart }: { cart: Cart }) {
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center justify-between text-base">
        <span>{pl.cart.subtotal}</span>
        <span className="font-semibold tabular-nums">{formatMoney(cart.cost.subtotal)}</span>
      </div>
      <p className="text-xs text-ink-600">{pl.cart.shippingNote}</p>
      {/* Navigation complète vers le checkout Shopify (jamais router client), docs/03 */}
      <a
        href={cart.checkoutUrl}
        className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-leaf-900 text-base font-medium text-cream-50 hover:bg-leaf-700"
        onClick={() =>
          pushEvent("begin_checkout", { value: cart.cost.subtotal.amount, items: cart.lines.map(lineToItem) })
        }
      >
        {pl.cart.goToCheckout}
      </a>
      <p className="text-center text-xs text-ink-600">{pl.cart.checkoutNote}</p>
      <p className="text-center text-xs text-ink-600">{t(pl.cart.itemsInCart, { count: cart.totalQuantity })}</p>
    </div>
  );
}

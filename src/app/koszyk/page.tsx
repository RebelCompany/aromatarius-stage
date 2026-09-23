import type { Metadata } from "next";
import Link from "next/link";
import { pl } from "@/i18n/pl";
import { formatMoney } from "@/lib/format";
import { buildMetadata } from "@/lib/seo/metadata";
import { getCart, getShopInfo, isMockMode } from "@/lib/shopify";
import { FreeShippingBar } from "@/components/shop/FreeShippingBar";
import { ProductImage } from "@/components/shop/ProductImage";
import { PromoCode } from "@/components/shop/PromoCode";
import { ButtonLink } from "@/components/ui/button-link";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return buildMetadata({ title: `${pl.cart.title} | Aromatarius`, description: pl.cart.shippingNote, path: "/koszyk", noindex: true });
}

/** Page panier : fallback sans JS du drawer, handoff vers checkout Shopify. */
export default async function CartPage({ searchParams }: { searchParams: Promise<{ checkout?: string }> }) {
  const [cart, shop, sp] = await Promise.all([getCart(), getShopInfo(), searchParams]);
  const mockCheckout = sp.checkout === "mock" && isMockMode();

  return (
    <div className="container-page max-w-3xl py-8 md:py-12">
      <h1 className="mb-6">{pl.cart.title}</h1>

      {mockCheckout && (
        <p className="mb-6 rounded-md border border-amber-500/50 bg-amber-500/10 p-4 text-sm" role="status">
          Tryb demo: bez sklepu Shopify checkout nie jest dostępny. Po podłączeniu sklepu przycisk przekieruje na checkout.aromatarius.pl.
        </p>
      )}

      {!cart || cart.lines.length === 0 ? (
        <div className="rounded-md border border-sand-200 bg-card p-8 text-center">
          <p className="text-ink-600">{pl.cart.empty}</p>
          <ButtonLink href="/olejki-eteryczne" className="mt-4 bg-leaf-900 hover:bg-leaf-700">
            {pl.cart.emptyCta}
          </ButtonLink>
        </div>
      ) : (
        <>
          <FreeShippingBar subtotal={cart.cost.subtotal} threshold={shop.freeShippingThreshold} />
          <ul className="mt-6 divide-y divide-sand-200 rounded-md border border-sand-200 bg-card">
            {cart.lines.map((line) => (
              <li key={line.id} className="flex items-center gap-4 p-4">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-cream-50">
                  <ProductImage image={line.merchandise.product.featuredImage} sizes="64px" />
                </div>
                <div className="flex-1">
                  <Link href={`/produkt/${line.merchandise.product.handle}`} className="font-serif hover:text-leaf-700">
                    {line.merchandise.product.title}
                  </Link>
                  <p className="text-sm text-ink-600">
                    {line.merchandise.title} × {line.quantity}
                  </p>
                </div>
                <p className="font-semibold tabular-nums">{formatMoney(line.cost.total)}</p>
              </li>
            ))}
          </ul>
          <PromoCode discountCodes={cart.discountCodes} />

          <div className="mt-6 flex items-center justify-between text-lg">
            <span>{pl.cart.subtotal}</span>
            <span className="font-semibold">{formatMoney(cart.cost.subtotal)}</span>
          </div>
          {cart.discountTotal.amount > 0 && (
            <div className="mt-2 flex items-center justify-between text-lg text-leaf-700">
              <span>{pl.cart.promoDiscount}</span>
              <span className="font-semibold">-{formatMoney(cart.discountTotal)}</span>
            </div>
          )}
          {cart.discountTotal.amount > 0 && (
            <div className="mt-2 flex items-center justify-between border-t border-sand-200 pt-2 text-lg">
              <span>{pl.cart.total}</span>
              <span className="font-semibold">{formatMoney(cart.cost.total)}</span>
            </div>
          )}
          <p className="mt-1 text-sm text-ink-600">{pl.cart.shippingNote}</p>
          <a
            href={cart.checkoutUrl}
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-lg bg-leaf-900 text-base font-medium text-cream-50 hover:bg-leaf-700"
          >
            {pl.cart.goToCheckout}
          </a>
          <Link href="/olejki-eteryczne" className="mt-4 inline-block text-sm text-leaf-700 hover:underline">
            {pl.cart.continueShopping}
          </Link>
        </>
      )}
    </div>
  );
}

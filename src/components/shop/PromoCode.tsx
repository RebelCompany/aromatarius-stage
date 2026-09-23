"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { pl, t } from "@/i18n/pl";
import { applyDiscountCodeAction, removeDiscountCodeAction } from "@/lib/shopify/actions";
import type { CartDiscountCode } from "@/lib/shopify/types";

type Props = {
  /** Codes deja portes par le panier, tels que renvoyes par l'adapter. */
  discountCodes: CartDiscountCode[];
  /** Optionnel : notifie le store client du panier (drawer). */
  onChange?: () => void;
};

/**
 * Champ code promo du panier. La validation appartient a Shopify : ce composant
 * n'en fait aucune, il envoie le code et affiche le verdict.
 */
export function PromoCode({ discountCodes, onChange }: Props) {
  const router = useRouter();
  const inputId = useId();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const active = discountCodes.filter((d) => d.applicable);

  // La page panier est un Server Component : c'est refresh() qui relit le panier.
  function sync() {
    onChange?.();
    router.refresh();
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await applyDiscountCodeAction(code);
      if (result.ok) {
        setCode("");
        sync();
      } else {
        setError(result.error);
      }
    });
  }

  function remove(value: string) {
    setError(null);
    startTransition(async () => {
      const result = await removeDiscountCodeAction(value);
      if (result.ok) sync();
      else setError(result.error);
    });
  }

  return (
    <div className="mt-6 rounded-md border border-sand-200 bg-card p-4">
      <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor={inputId} className="block text-sm font-medium text-leaf-900">
            {pl.cart.promoLabel}
          </label>
          <input
            id={inputId}
            name="promo"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={pl.cart.promoPlaceholder}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className="mt-1 h-11 w-full rounded-md border border-sand-200 bg-cream-50 px-3 uppercase placeholder:normal-case placeholder:text-ink-600 focus:border-leaf-500 focus:outline-none focus:ring-2 focus:ring-leaf-500/40"
          />
        </div>
        <button
          type="submit"
          disabled={pending || !code.trim()}
          className="h-11 shrink-0 rounded-md bg-leaf-900 px-5 text-sm font-medium text-cream-50 hover:bg-leaf-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pl.cart.promoApply}
        </button>
      </form>

      {error && (
        <p id={`${inputId}-error`} role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {active.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {active.map((d) => (
            <li
              key={d.code}
              className="flex items-center gap-2 rounded-full bg-leaf-100 py-1 pl-3 pr-1 text-sm text-leaf-900"
            >
              <span className="font-medium">{d.code}</span>
              <button
                type="button"
                onClick={() => remove(d.code)}
                disabled={pending}
                aria-label={t(pl.cart.promoRemoveLabel, { code: d.code })}
                className="flex size-6 items-center justify-center rounded-full hover:bg-white disabled:opacity-50"
              >
                <span aria-hidden>&times;</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

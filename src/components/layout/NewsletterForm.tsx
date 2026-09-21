"use client";

import { useState } from "react";
import { pl } from "@/i18n/pl";
import { pushEvent } from "@/lib/analytics/dataLayer";
import { Button } from "@/components/ui/button";

/**
 * Newsletter 5 %. V1 : POST /api/newsletter (à brancher sur Shopify Email / customerCreate).
 * Double opt-in géré côté Shopify.
 */
export function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "pending" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = new FormData(form).get("email");
    setStatus("pending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      pushEvent("newsletter_signup");
      setStatus("done");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p className="rounded-md bg-card p-4 text-leaf-900" role="status">
        {pl.newsletter.success}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          {pl.newsletter.placeholder}
        </label>
        <input
          id="newsletter-email"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder={pl.newsletter.placeholder}
          className="h-12 flex-1 rounded-lg border border-sand-200 bg-card px-4 text-base focus:border-leaf-500 focus:outline-none"
        />
        <Button type="submit" size="lg" className="h-12 bg-leaf-900 px-6 text-base hover:bg-leaf-700" disabled={status === "pending"}>
          {pl.newsletter.submit}
        </Button>
      </div>
      <p className="text-xs text-ink-600">{pl.newsletter.consent}</p>
      {status === "error" && (
        <p className="text-sm text-danger" role="alert">
          {pl.errors.generic}
        </p>
      )}
    </form>
  );
}

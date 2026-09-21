import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });

/**
 * Inscription newsletter (5 %). V1 : validation + log.
 * À brancher : Shopify Admin API `customerCreate` (email_marketing_consent, double opt-in)
 * ou Shopify Email / Klaviyo (phase 2). Aucune donnée personnelle dans les logs.
 */
export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Nieprawidłowy adres e-mail" }, { status: 400 });

  // TODO(semaine 3) : appel Admin API customerCreate avec consentement marketing
  return NextResponse.json({ ok: true });
}

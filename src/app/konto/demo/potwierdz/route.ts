import { NextResponse, type NextRequest } from "next/server";
import { isMockMode } from "@/lib/shopify";
import { encodeMockCode } from "@/lib/shopify/mock";

/**
 * Valide l'écran de démo. Route Handler et non Server Action : une redirection
 * en chaine depuis une Server Action laisse l'URL figée sur le callback, avec
 * le code visible dans l'historique.
 */
export async function POST(request: NextRequest) {
  if (!isMockMode()) return NextResponse.json({ error: "not found" }, { status: 404 });

  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim();
  const state = String(form.get("state") ?? "");

  if (!email.includes("@")) {
    return NextResponse.redirect(new URL("/konto/demo", request.nextUrl.origin), 303);
  }

  const callback = new URL("/konto/callback", request.nextUrl.origin);
  callback.searchParams.set("code", encodeMockCode(email));
  callback.searchParams.set("state", state);
  // 303 : transforme le POST en GET, comme le ferait le retour de Shopify.
  return NextResponse.redirect(callback, 303);
}

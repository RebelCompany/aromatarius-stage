import { NextResponse, type NextRequest } from "next/server";
import { completeLogin } from "@/lib/shopify";

/** Retour de Shopify : valide l'etat, ouvre la session, rattache le panier. */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const redirectUri = new URL("/konto/callback", request.nextUrl.origin).toString();

  const result = await completeLogin({
    code: params.get("code"),
    state: params.get("state"),
    redirectUri,
  });

  if (!result.ok) {
    return NextResponse.redirect(new URL(`/konto?blad=${result.code}`, request.nextUrl.origin));
  }
  return NextResponse.redirect(new URL(result.data.returnTo, request.nextUrl.origin));
}

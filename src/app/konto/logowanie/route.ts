import { NextResponse, type NextRequest } from "next/server";
import { beginLogin } from "@/lib/shopify";

/**
 * Entree du flux : pose state, verifieur PKCE et page de retour, puis renvoie
 * vers l'ecran de connexion héberge par Shopify. C'est une route et non une
 * page : seul un Route Handler peut ecrire des cookies avant de rediriger.
 */
export async function GET(request: NextRequest) {
  const returnTo = request.nextUrl.searchParams.get("powrot");
  const redirectUri = new URL("/konto/callback", request.nextUrl.origin).toString();
  try {
    const url = await beginLogin(redirectUri, returnTo);
    return NextResponse.redirect(url.startsWith("/") ? new URL(url, request.nextUrl.origin) : url);
  } catch {
    return NextResponse.redirect(new URL("/konto?blad=UNKNOWN", request.nextUrl.origin));
  }
}

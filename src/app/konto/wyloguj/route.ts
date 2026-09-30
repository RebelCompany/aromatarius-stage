import { NextResponse, type NextRequest } from "next/server";
import { beginLogout } from "@/lib/shopify";

/**
 * Deconnexion. En POST depuis le bouton, en GET pour le retour de Shopify
 * apres fermeture de la session cote Customer Accounts.
 */
async function handle(request: NextRequest) {
  const home = new URL("/", request.nextUrl.origin);
  const shopifyLogout = await beginLogout(home.toString());
  return NextResponse.redirect(shopifyLogout ?? home);
}

export const GET = handle;
export const POST = handle;

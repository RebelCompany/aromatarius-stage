import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

/**
 * Webhook Shopify (products/update, products/delete, collections/update,
 * inventory_levels/update) -> revalidateTag (docs/06 §Webhooks).
 * Vérification HMAC avec SHOPIFY_REVALIDATION_SECRET (secret du webhook).
 */
export async function POST(request: Request) {
  const secret = process.env.SHOPIFY_REVALIDATION_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook secret not configured" }, { status: 503 });

  const body = await request.text();
  const signature = request.headers.get("x-shopify-hmac-sha256") ?? "";
  const digest = createHmac("sha256", secret).update(body, "utf8").digest("base64");
  const valid =
    signature.length === digest.length && timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  if (!valid) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  const topic = request.headers.get("x-shopify-topic") ?? "";
  let payload: { handle?: string } = {};
  try {
    payload = JSON.parse(body);
  } catch {
    // corps vide ou non JSON : on revalide large
  }

  const tags = new Set<string>();
  if (topic.startsWith("products/")) {
    tags.add("products");
    if (payload.handle) tags.add(`product:${payload.handle}`);
    tags.add("collections");
  } else if (topic.startsWith("collections/")) {
    tags.add("collections");
    if (payload.handle) tags.add(`collection:${payload.handle}`);
  } else if (topic.startsWith("inventory_levels/")) {
    tags.add("products");
  } else {
    tags.add("products");
    tags.add("collections");
    tags.add("shop");
  }

  for (const tag of tags) revalidateTag(tag, "max");
  return NextResponse.json({ revalidated: [...tags], topic, at: new Date().toISOString() });
}

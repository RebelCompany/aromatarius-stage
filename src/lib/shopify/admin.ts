import "server-only";
import { shopifyConfig } from "./config";
import type { PartnershipInput } from "@/lib/b2b";

/**
 * Admin API, uniquement pour les demandes de partenariat.
 *
 * La Storefront API ne sait pas poser de tag sur un client : le taggage
 * "b2b-pending" impose donc l'Admin API. Ce jeton ne quitte jamais le serveur
 * (docs/03, section Securite) et n'est utilise que par cette fonction.
 */

const ADMIN_API_VERSION = "2026-07";

const CUSTOMER_CREATE = /* GraphQL */ `
  mutation PartnerCreate($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export type LeadResultCode = "CREATED" | "NOT_CONFIGURED" | "ALREADY_EXISTS" | "FAILED";

/**
 * Cree le contact avec le tag "b2b-pending" et le tag du profil declare.
 * Bogusia filtre ensuite sur ces tags dans l'admin Shopify.
 */
export async function createPartnerLead(input: PartnershipInput): Promise<LeadResultCode> {
  const token = process.env.SHOPIFY_ADMIN_TOKEN;
  if (!token || !shopifyConfig.storeDomain) return "NOT_CONFIGURED";

  const [firstName, ...rest] = input.fullName.split(/\s+/);
  const res = await fetch(`https://${shopifyConfig.storeDomain}/admin/api/${ADMIN_API_VERSION}/graphql.json`, {
    method: "POST",
    headers: { "content-type": "application/json", "X-Shopify-Access-Token": token },
    cache: "no-store",
    body: JSON.stringify({
      query: CUSTOMER_CREATE,
      variables: {
        input: {
          firstName,
          lastName: rest.join(" ") || null,
          email: input.email,
          phone: input.phone || null,
          tags: ["b2b-pending", `b2b-${input.kind}`],
          note: [`NIP: ${input.nip}`, `Firma: ${input.company}`, "", input.message].join("\n"),
        },
      },
    }),
  });

  if (!res.ok) return "FAILED";
  const json = (await res.json()) as {
    data?: { customerCreate: { customer: { id: string } | null; userErrors: { field: string[] | null; message: string }[] } };
  };
  const result = json.data?.customerCreate;
  if (result?.customer) return "CREATED";
  // Un e-mail deja present n'est pas un echec : la demande est bien arrivee,
  // et ecraser un client existant depuis un formulaire public serait dangereux.
  const taken = result?.userErrors?.some((e) => /taken|already/i.test(e.message));
  return taken ? "ALREADY_EXISTS" : "FAILED";
}

/**
 * Seules les destinations internes sont acceptees. Sans ce filtre, un lien
 * /konto/logowanie?powrot=https://ailleurs renverrait le client hors du site
 * juste apres sa connexion : redirection ouverte classique.
 *
 * Fichier separe de index.ts, qui est "server-only" : cette fonction est pure
 * et doit rester testable.
 */
export function safeReturnPath(value: string | null | undefined): string {
  if (!value) return "/konto";
  if (!value.startsWith("/") || value.startsWith("//")) return "/konto";
  return value;
}

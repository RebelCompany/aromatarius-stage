/**
 * Preview client (Vercel) : SITE_NOINDEX=1 bloque l'indexation partout
 * (robots.txt, meta robots, header X-Robots-Tag).
 * RAPPEL LANCEMENT : retirer SITE_NOINDEX du projet Vercel de production
 * avant la bascule DNS (checklist docs/07 §7).
 */
export function isNoindex(): boolean {
  return process.env.SITE_NOINDEX === "1";
}

/**
 * Validation du formulaire de partenariat. Module pur, sans acces reseau :
 * il est appele par la Server Action et couvert par les tests unitaires.
 */

export const partnerKinds = ["apteka", "gabinet", "ambasador", "dystrybutor"] as const;
export type PartnerKind = (typeof partnerKinds)[number];

export type PartnershipInput = {
  fullName: string;
  company: string;
  nip: string;
  email: string;
  phone: string;
  kind: PartnerKind;
  message: string;
};

export type PartnershipField = keyof PartnershipInput;

/** Un champ, un message : le formulaire surligne precisement ce qui bloque. */
export type PartnershipErrors = Partial<Record<PartnershipField, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NIP_WEIGHTS = [6, 5, 7, 2, 3, 4, 5, 6, 7];

/** Retire espaces, tirets et prefixe PL : les clients saisissent les trois. */
export function normalizeNip(value: string): string {
  return value.trim().toUpperCase().replace(/^PL/, "").replace(/[\s-]/g, "");
}

/**
 * NIP polonais : dix chiffres avec somme de controle. Le seul controle de
 * longueur laisserait passer n'importe quelle suite de dix chiffres, dont les
 * fautes de frappe les plus courantes.
 */
export function isValidNip(value: string): boolean {
  const digits = normalizeNip(value);
  if (!/^\d{10}$/.test(digits)) return false;
  const sum = NIP_WEIGHTS.reduce((acc, weight, i) => acc + weight * Number(digits[i]), 0);
  const checksum = sum % 11;
  // 10 n'est pas un chiffre : ces NIP n'existent pas.
  if (checksum === 10) return false;
  return checksum === Number(digits[9]);
}

/** Souple a dessein : indicatif, espaces et tirets acceptes, 9 chiffres minimum. */
export function isValidPhone(value: string): boolean {
  const digits = value.replace(/[\s\-().]/g, "").replace(/^\+/, "");
  return /^\d{9,15}$/.test(digits);
}

export function isPartnerKind(value: string): value is PartnerKind {
  return (partnerKinds as readonly string[]).includes(value);
}

/**
 * Valide et normalise. Renvoie soit l'entree propre, soit les erreurs par champ.
 * Les messages sont des cles d'i18n, pas du texte : la couche UI traduit.
 */
export function parsePartnership(raw: Record<string, string>): { ok: true; data: PartnershipInput } | { ok: false; errors: PartnershipErrors } {
  const errors: PartnershipErrors = {};
  const fullName = (raw.fullName ?? "").trim();
  const company = (raw.company ?? "").trim();
  const nip = (raw.nip ?? "").trim();
  const email = (raw.email ?? "").trim().toLowerCase();
  const phone = (raw.phone ?? "").trim();
  const kind = (raw.kind ?? "").trim();
  const message = (raw.message ?? "").trim();

  if (fullName.length < 3) errors.fullName = "required";
  if (company.length < 2) errors.company = "required";
  if (!isValidNip(nip)) errors.nip = nip ? "invalid" : "required";
  if (!EMAIL_RE.test(email)) errors.email = email ? "invalid" : "required";
  // Telephone facultatif, mais s'il est rempli il doit etre exploitable.
  if (phone && !isValidPhone(phone)) errors.phone = "invalid";
  if (!isPartnerKind(kind)) errors.kind = "required";
  if (message.length < 10) errors.message = "required";

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data: { fullName, company, nip: normalizeNip(nip), email, phone, kind: kind as PartnerKind, message } };
}

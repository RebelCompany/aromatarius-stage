import { describe, expect, it } from "vitest";
import { isValidNip, isValidPhone, normalizeNip, parsePartnership } from "@/lib/b2b";

/** NIP réels du registre public polonais, utilisés comme cas valides. */
const NIP_VALIDE = "5252248481";

const base = {
  fullName: "Bogusia Kowalska",
  company: "Aromatarius sp. z o.o.",
  nip: NIP_VALIDE,
  email: "kontakt@aromatarius.pl",
  phone: "+48 600 100 200",
  kind: "apteka",
  message: "Chcielibyśmy wprowadzić olejki do naszej apteki.",
};

describe("normalizeNip", () => {
  it("retire le préfixe PL, les espaces et les tirets", () => {
    expect(normalizeNip(" pl 525-224-84-81 ")).toBe(NIP_VALIDE);
  });
});

describe("isValidNip", () => {
  it("accepte un NIP correct, quel que soit le format saisi", () => {
    expect(isValidNip(NIP_VALIDE)).toBe(true);
    expect(isValidNip("525-224-84-81")).toBe(true);
    expect(isValidNip("PL5252248481")).toBe(true);
  });

  it("refuse une somme de contrôle fausse", () => {
    // Un simple controle de longueur laisserait passer ce numero.
    expect(isValidNip("5252248480")).toBe(false);
    expect(isValidNip("1234567890")).toBe(false);
  });

  it("refuse une longueur incorrecte ou des lettres", () => {
    expect(isValidNip("525224848")).toBe(false);
    expect(isValidNip("52522484811")).toBe(false);
    expect(isValidNip("52522484AB")).toBe(false);
    expect(isValidNip("")).toBe(false);
  });
});

describe("isValidPhone", () => {
  it("accepte les formats courants", () => {
    expect(isValidPhone("+48 600 100 200")).toBe(true);
    expect(isValidPhone("600-100-200")).toBe(true);
    expect(isValidPhone("(48) 600100200")).toBe(true);
  });

  it("refuse un numéro trop court ou non numérique", () => {
    expect(isValidPhone("12345")).toBe(false);
    expect(isValidPhone("abcdefghij")).toBe(false);
  });
});

describe("parsePartnership", () => {
  it("accepte un dossier complet et normalise", () => {
    const r = parsePartnership({ ...base, nip: "525-224-84-81", email: "KONTAKT@Aromatarius.PL " });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.nip).toBe(NIP_VALIDE);
      expect(r.data.email).toBe("kontakt@aromatarius.pl");
      expect(r.data.kind).toBe("apteka");
    }
  });

  it("signale chaque champ fautif séparément", () => {
    const r = parsePartnership({ ...base, fullName: "", nip: "1234567890", email: "pas-un-email", message: "krótko" });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors).toEqual({
        fullName: "required",
        nip: "invalid",
        email: "invalid",
        message: "required",
      });
    }
  });

  it("accepte un téléphone vide mais refuse un téléphone invalide", () => {
    expect(parsePartnership({ ...base, phone: "" }).ok).toBe(true);
    const r = parsePartnership({ ...base, phone: "123" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.phone).toBe("invalid");
  });

  it("refuse un type d'activité inconnu", () => {
    const r = parsePartnership({ ...base, kind: "cokolwiek" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.kind).toBe("required");
  });
});

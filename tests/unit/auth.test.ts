import { describe, expect, it } from "vitest";
import { safeReturnPath } from "@/lib/shopify/return-path";
import { encodeMockCode, mockProvider } from "@/lib/shopify/mock";

describe("safeReturnPath", () => {
  it("garde une destination interne", () => {
    expect(safeReturnPath("/koszyk")).toBe("/koszyk");
    expect(safeReturnPath("/na/sen?bio=1")).toBe("/na/sen?bio=1");
  });

  it("refuse une redirection vers un autre site", () => {
    // Sans ce filtre, ?powrot=https://ailleurs renverrait le client hors du
    // site juste apres sa connexion : redirection ouverte classique.
    expect(safeReturnPath("https://ailleurs.example")).toBe("/konto");
    expect(safeReturnPath("//ailleurs.example")).toBe("/konto");
    expect(safeReturnPath("javascript:alert(1)")).toBe("/konto");
  });

  it("retombe sur /konto quand rien n'est fourni", () => {
    expect(safeReturnPath(null)).toBe("/konto");
    expect(safeReturnPath(undefined)).toBe("/konto");
    expect(safeReturnPath("")).toBe("/konto");
  });
});

describe("startAuthorization (démo)", () => {
  it("renvoie une URL et les secrets du flux", async () => {
    const req = await mockProvider.startAuthorization("http://localhost:3000/konto/callback");
    expect(req.url).toContain("/konto/demo");
    expect(req.state).toBeTruthy();
    expect(req.codeVerifier).toBeTruthy();
  });
});

describe("completeAuthorization (démo)", () => {
  it("ouvre une session depuis un code valide", async () => {
    const result = await mockProvider.completeAuthorization({
      code: encodeMockCode("bogusia@aromatarius.pl"),
      redirectUri: "http://localhost:3000/konto/callback",
      codeVerifier: "peu-importe",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.accessToken).toBeTruthy();
      expect(new Date(result.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
    }
  });

  it("refuse un code inconnu", async () => {
    const result = await mockProvider.completeAuthorization({
      code: "code-invente",
      redirectUri: "http://localhost:3000/konto/callback",
      codeVerifier: "peu-importe",
    });
    expect(result).toEqual({ ok: false, code: "EXCHANGE_FAILED" });
  });
});

describe("getCustomer (démo)", () => {
  it("résout le client depuis son jeton", async () => {
    const session = await mockProvider.completeAuthorization({
      code: encodeMockCode("Bogusia.Kowalska@Aromatarius.PL"),
      redirectUri: "http://localhost:3000/konto/callback",
      codeVerifier: "peu-importe",
    });
    if (!session.ok) throw new Error("session attendue");
    const customer = await mockProvider.getCustomer(session.data.accessToken);
    // L'e-mail est normalise a l'encodage du code.
    expect(customer?.email).toBe("bogusia.kowalska@aromatarius.pl");
    expect(customer?.firstName).toBe("Bogusia");
  });

  it("renvoie null sur un jeton inconnu ou malformé", async () => {
    expect(await mockProvider.getCustomer("n-importe-quoi")).toBeNull();
    expect(await mockProvider.getCustomer("mockcust:!!!")).toBeNull();
  });
});

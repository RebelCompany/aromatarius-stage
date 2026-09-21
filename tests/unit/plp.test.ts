import { describe, expect, it } from "vitest";
import { parsePlpParams } from "@/lib/plp";

describe("parsePlpParams", () => {
  it("retourne des valeurs par défaut", () => {
    const r = parsePlpParams({});
    expect(r.page).toBe(1);
    expect(r.sort).toBe("relevance");
    expect(r.hasFilters).toBe(false);
  });

  it("parse les filtres multi-valeurs et le tri", () => {
    const r = parsePlpParams({ bio: "1", potrzeba: "sen,stres", ml: ["5", "10"], sort: "priceAsc", page: "2" });
    expect(r.filters.bio).toBe(true);
    expect(r.filters.potrzeba).toEqual(["sen", "stres"]);
    expect(r.filters.ml).toEqual([5, 10]);
    expect(r.sort).toBe("priceAsc");
    expect(r.page).toBe(2);
    expect(r.hasFilters).toBe(true);
  });

  it("ignore un tri inconnu", () => {
    expect(parsePlpParams({ sort: "hack" }).sort).toBe("relevance");
  });
});

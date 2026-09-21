import { describe, expect, it } from "vitest";
import { parseVolumeMl, richTextToHtml } from "@/lib/shopify/mappers";

describe("parseVolumeMl", () => {
  it("extrait la contenance", () => {
    expect(parseVolumeMl("10 ml")).toBe(10);
    expect(parseVolumeMl("5ml")).toBe(5);
    expect(parseVolumeMl("100 ML")).toBe(100);
    expect(parseVolumeMl("Default Title")).toBeNull();
  });
});

describe("richTextToHtml", () => {
  it("convertit le rich text Shopify en HTML", () => {
    const rich = JSON.stringify({
      type: "root",
      children: [
        { type: "paragraph", children: [{ type: "text", value: "Hello ", bold: true }, { type: "text", value: "<b>" }] },
        { type: "list", listType: "unordered", children: [{ type: "list-item", children: [{ type: "text", value: "a" }] }] },
      ],
    });
    expect(richTextToHtml(rich)).toBe("<p><strong>Hello </strong>&lt;b&gt;</p><ul><li>a</li></ul>");
  });
  it("laisse passer le HTML brut", () => {
    expect(richTextToHtml("<p>ok</p>")).toBe("<p>ok</p>");
  });
});

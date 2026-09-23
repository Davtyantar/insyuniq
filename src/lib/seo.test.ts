import { describe, expect, it } from "vitest";
import { buildDescription } from "./seo";

describe("buildDescription", () => {
  it("leads with price and place, then a word-bounded excerpt", () => {
    const text = buildDescription({
      title: "Բնակարան",
      price: "$ 300/ամիս",
      location: "Կապան",
      description: "բառ ".repeat(100),
    });
    expect(text.startsWith("Բնակարան — $ 300/ամիս, Կապան. ")).toBe(true);
    expect(text.length).toBeLessThanOrEqual(160);
    expect(text.endsWith(" ")).toBe(false);
  });

  it("omits the price clause when there is none", () => {
    expect(buildDescription({ title: "Ծառայություն", location: "Գորիս", description: "Կարճ" })).toBe(
      "Ծառայություն, Գորիս. Կարճ",
    );
  });
});

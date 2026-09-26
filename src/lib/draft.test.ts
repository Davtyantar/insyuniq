import { describe, expect, it } from "vitest";
import { EMPTY_DRAFT, stepErrors, type ListingDraft } from "./draft";

const d = (overrides: Partial<ListingDraft>): ListingDraft => ({ ...EMPTY_DRAFT, city: "Կապան", ...overrides });

describe("stepErrors for API categories", () => {
  it("adds the API's rules and drops the contact fields the profile now provides", () => {
    expect(stepErrors("type", d({ category: "rentals", subcategory: "garages", term: "daily" }))).toHaveLength(1);
    expect(stepErrors("specs", d({ category: "real-estate", subcategory: "apartments", area: "80" }))).toEqual(
      expect.arrayContaining(["Նշեք սենյակների քանակը", "Ընտրեք վիճակը"]),
    );
    expect(stepErrors("photos", d({ category: "real-estate", subcategory: "apartments" }))).toEqual(["Ավելացրեք առնվազն մեկ լուսանկար"]);
    expect(stepErrors("description", d({ category: "hotels", title: "Հյուրանոց Տաթևում", description: "ա".repeat(4001) }))).toContain(
      "Նկարագրությունը՝ առավելագույնը 4000 նիշ",
    );
    expect(stepErrors("price", d({ category: "real-estate", price: "100" }))).toEqual([]);
  });

  it("leaves the mock doors' rules as they were", () => {
    expect(stepErrors("photos", d({ category: "cars" }))).toEqual([]);
    expect(stepErrors("price", d({ category: "cars", price: "100" }))).toEqual(["Նշեք հեռախոսահամարը", "Նշեք անունը"]);
  });
});

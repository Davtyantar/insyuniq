import { describe, expect, it } from "vitest";
import { PROPERTY_FIXTURE } from "@/test/fixtures";
import { formatArea } from "./format";
import { propertyBadges, propertyChips, propertySpecs, propertySummary } from "./property-format";

const labels = (specs: { label: string }[]) => specs.map((spec) => spec.label);

describe("propertySummary", () => {
  it("leads with rooms for dwellings and with the kind otherwise", () => {
    expect(propertySummary({ subcategory: "apartments", rooms: 3, area: 82 })).toBe(`3-սենյականոց · ${formatArea(82)}`);
    expect(propertySummary({ subcategory: "apartments", rooms: 0, area: 30 })).toBe(`Ստուդիո · ${formatArea(30)}`);
    expect(propertySummary({ subcategory: "garages", area: 24 })).toBe(`Ավտոտնակ · ${formatArea(24)}`);
    expect(propertySummary({ subcategory: "land", landArea: 10 })).toBe("Հողատարածք · 10 սոտկա");
  });
});

describe("propertyBadges", () => {
  it("marks new buildings and nightly stays", () => {
    expect(propertyBadges({ deal: "sale", buildingType: "new" })).toEqual(["Նորակառույց"]);
    expect(propertyBadges({ deal: "daily" })).toEqual(["Օրավարձով"]);
    expect(propertyBadges({ deal: "rent" })).toEqual([]);
  });
});

describe("propertySpecs", () => {
  it("shows amenities for dwellings and utilities for garages and land", () => {
    expect(labels(propertySpecs(PROPERTY_FIXTURE))).toEqual(
      expect.arrayContaining(["Տեսակ", "Գործարք", "Սենյակներ", "Հարկ", "Կահույք", "Կայանատեղի"]),
    );
    const garage = { ...PROPERTY_FIXTURE, subcategory: "garages" as const, rooms: undefined, water: true, pit: false };
    const garageLabels = labels(propertySpecs(garage));
    expect(garageLabels).toEqual(expect.arrayContaining(["Ջուր", "Յամա"]));
    expect(garageLabels).not.toContain("Կահույք");
  });

  it("names the pool only for nightly stays or when present", () => {
    expect(labels(propertySpecs(PROPERTY_FIXTURE))).not.toContain("Լողավազան");
    expect(labels(propertySpecs({ ...PROPERTY_FIXTURE, deal: "daily" }))).toContain("Լողավազան");
  });
});

describe("propertyChips", () => {
  it("lists the compact facts under the title", () => {
    expect(propertyChips(PROPERTY_FIXTURE)).toEqual(["2-սենյականոց", formatArea(60), "3/5 հարկ", "Լավ վիճակում"]);
  });
});

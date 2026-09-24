import { describe, expect, it } from "vitest";
import { dealValues, propertySubcategoryValues } from "@/lib/api/schema";
import { DOOR_BY_DEAL, PROPERTY_DOORS, doorSubcategoryLabel, isPropertyDoor, propertyHref } from "./property-doors";

describe("property doors", () => {
  it("only offers subcategories the contract knows", () => {
    for (const config of Object.values(PROPERTY_DOORS)) {
      for (const option of config.subcategories) expect(propertySubcategoryValues).toContain(option.value);
    }
  });

  it("gives every deal exactly one door, so a listing appears on one door only", () => {
    for (const deal of dealValues) expect(PROPERTY_DOORS[DOOR_BY_DEAL[deal]].deal).toBe(deal);
  });

  it("links a listing to its deal's door", () => {
    expect(propertyHref({ id: "abc", deal: "daily" })).toBe("/hotels/abc");
    expect(isPropertyDoor("rentals")).toBe(true);
    expect(isPropertyDoor("cars")).toBe(false);
    expect(doorSubcategoryLabel("hotels", "guesthouses")).toBe("Հյուրատներ");
  });
});

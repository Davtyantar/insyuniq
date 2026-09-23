import { describe, expect, it } from "vitest";
import { PROPERTY_FIXTURE } from "@/test/fixtures";
import { propertyListingJsonLd } from "./structured-data";

describe("propertyListingJsonLd", () => {
  it("takes the currency from the listing and leases out rentals", () => {
    const data = propertyListingJsonLd({ ...PROPERTY_FIXTURE, price: { ...PROPERTY_FIXTURE.price, currency: "AMD" } });
    expect(data.offers.priceCurrency).toBe("AMD");
    expect(data.offers.businessFunction).toBe("http://purl.org/goodrelations/v1#LeaseOut");
    expect(data.url.endsWith(`/rentals/${PROPERTY_FIXTURE.id}`)).toBe(true);
  });

  it("claims no price for a negotiable listing without an amount", () => {
    const data = propertyListingJsonLd({
      ...PROPERTY_FIXTURE,
      price: { amount: null, currency: "USD", period: "month", negotiable: true },
    });
    expect("price" in data.offers).toBe(false);
  });
});

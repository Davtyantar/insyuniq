import { describe, expect, it } from "vitest";
import { EMPTY_DRAFT, type ListingDraft } from "./draft";
import {
  draftDealError,
  draftToCreateRequest,
  firstStepWithErrors,
  publishesToApi,
  requiredSpecErrors,
  serverErrorsByStep,
} from "./property-draft";

const draft = (overrides: Partial<ListingDraft>): ListingDraft => ({
  ...EMPTY_DRAFT,
  city: "Կապան",
  title: "Լուսավոր բնակարան կենտրոնում",
  description: "Բնակարանը վերանորոգված է, կահավորված, կենտրոնում, դպրոցի մոտ։",
  price: "30000",
  ...overrides,
});

describe("publishesToApi", () => {
  it("covers exactly the doors on the API", () => {
    expect(publishesToApi("real-estate")).toBe(true);
    expect(publishesToApi("hotels")).toBe(true);
    expect(publishesToApi("cars")).toBe(false);
    expect(publishesToApi(null)).toBe(false);
  });
});

describe("draftToCreateRequest", () => {
  it("maps an apartment for sale with slugs, money and required fields", () => {
    const request = draftToCreateRequest(
      draft({
        category: "real-estate",
        subcategory: "apartments",
        deal: "sale",
        district: "Կենտրոն",
        address: " Շահումյան 8 ",
        rooms: "3",
        area: "82",
        floor: "3",
        totalFloors: "5",
        reCondition: "good",
        buildingType: "secondary",
        bathrooms: "1",
        furniture: true,
      }),
      ["u1/a.jpg"],
    );
    expect(request).toEqual({
      subcategory: "apartments",
      deal: "sale",
      title: "Լուսավոր բնակարան կենտրոնում",
      description: "Բնակարանը վերանորոգված է, կահավորված, կենտրոնում, դպրոցի մոտ։",
      price: { amount: 30000, currency: "USD", period: "total", negotiable: false },
      city: "kapan",
      district: "kapan-center",
      address: "Շահումյան 8",
      images: ["u1/a.jpg"],
      rooms: 3,
      area: 82,
      floor: 3,
      totalFloors: 5,
      condition: "good",
      buildingType: "secondary",
      bathrooms: 1,
      furniture: true,
      balcony: false,
      parking: false,
      pool: false,
    });
  });

  it("sends land fields and utilities for land, and nothing the validator forbids", () => {
    const request = draftToCreateRequest(
      draft({ category: "real-estate", subcategory: "land", rooms: "2", landArea: "10", landType: "agricultural", water: true, bathrooms: "1" }),
      ["u1/a.jpg"],
    );
    expect(request.landArea).toBe(10);
    expect(request.landType).toBe("agricultural");
    expect(request.water).toBe(true);
    expect(request.rooms).toBeUndefined();
    expect(request.bathrooms).toBeUndefined();
    expect(request.buildingType).toBeUndefined();
    expect(request.condition).toBeUndefined();
  });

  it("maps the rentals door by term and the hotels door to nightly houses", () => {
    const garage = draftToCreateRequest(draft({ category: "rentals", subcategory: "garages", term: "long", area: "24", floor: "1", pit: true }), ["p"]);
    expect(garage.deal).toBe("rent");
    expect(garage.price.period).toBe("month");
    expect(garage.floor).toBeUndefined();
    expect(garage.pit).toBe(true);

    const cottage = draftToCreateRequest(draft({ category: "hotels", subcategory: "cottages", rooms: "2", area: "60" }), ["p"]);
    expect(cottage.subcategory).toBe("houses");
    expect(cottage.deal).toBe("daily");
    expect(cottage.price.period).toBe("night");
  });

  it("uses AMD when only the AMD price is filled, and null for a negotiable empty price", () => {
    expect(draftToCreateRequest(draft({ category: "real-estate", subcategory: "garages", price: "", priceAmd: "4000000", area: "20" }), ["p"]).price)
      .toEqual({ amount: 4000000, currency: "AMD", period: "total", negotiable: false });
    expect(draftToCreateRequest(draft({ category: "real-estate", subcategory: "garages", price: "", negotiable: true, area: "20" }), ["p"]).price)
      .toEqual({ amount: null, currency: "USD", period: "total", negotiable: true });
  });

  it("marks new buildings as new and rejects an unknown city", () => {
    expect(draftToCreateRequest(draft({ category: "real-estate", subcategory: "new-buildings", rooms: "2", area: "60", reCondition: "shell" }), ["p"]).buildingType).toBe("new");
    expect(() => draftToCreateRequest(draft({ category: "real-estate", subcategory: "garages", city: "Paris" }), ["p"])).toThrow();
  });
});

describe("client-side rules", () => {
  it("blocks deals the subcategory does not allow", () => {
    expect(draftDealError(draft({ category: "rentals", subcategory: "garages", term: "daily" }))).not.toBeNull();
    expect(draftDealError(draft({ category: "rentals", subcategory: "apartments", term: "daily" }))).toBeNull();
  });

  it("asks for the fields the API requires for the subcategory", () => {
    expect(requiredSpecErrors(draft({ category: "real-estate", subcategory: "apartments", area: "80", reCondition: "" }))).toHaveLength(2);
    expect(requiredSpecErrors(draft({ category: "real-estate", subcategory: "land" }))).toHaveLength(1);
    expect(requiredSpecErrors(draft({ category: "cars" }))).toEqual([]);
  });
});

describe("server errors", () => {
  it("files each rejected field under the step that edits it", () => {
    const byStep = serverErrorsByStep({ title: ["too short"], bathrooms: ["required for this subcategory"], images: ["x"], deal: ["x"] });
    expect(Object.keys(byStep).sort()).toEqual(["description", "photos", "specs", "type"]);
    expect(byStep.specs?.[0]).toContain("Սանհանգույցներ");
    expect(firstStepWithErrors(["category", "type", "specs", "photos", "description", "price", "preview"], byStep)).toBe("type");
    expect(firstStepWithErrors(["price"], {})).toBeNull();
  });
});

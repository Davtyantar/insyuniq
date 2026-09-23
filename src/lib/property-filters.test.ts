import { describe, expect, it } from "vitest";
import {
  DEFAULT_PROPERTY_FILTERS,
  countActivePropertyFilters,
  parsePropertyState,
  propertyStateToSearch,
  stripRejectedParams,
  toPropertyQuery,
} from "./property-filters";

const parse = (door: Parameters<typeof parsePropertyState>[0], query: string) =>
  parsePropertyState(door, new URLSearchParams(query));

describe("parsePropertyState", () => {
  it("reads lists, flags, sort and page", () => {
    const state = parse("real-estate", "city=kapan,goris&rooms=1,2&furniture=1&sort=price-asc&page=2");
    expect(state.filters.city).toEqual(["kapan", "goris"]);
    expect(state.filters.rooms).toEqual(["1", "2"]);
    expect(state.filters.furniture).toBe(true);
    expect(state.sort).toBe("price-asc");
    expect(state.page).toBe(2);
  });

  it("drops values the contract would reject instead of letting the API 400", () => {
    const state = parse("real-estate", "city=paris&condition=euro,bogus&sort=nope&page=-3&areaMin=abc&priceMax=1e9");
    expect(state.filters.city).toEqual([]);
    expect(state.filters.condition).toEqual(["euro"]);
    expect(state.sort).toBe("relevant");
    expect(state.page).toBe(1);
    expect(state.filters.areaMin).toBe("");
    expect(state.filters.priceMax).toBe("");
  });

  it("drops a subcategory the door does not offer and a district outside the chosen cities", () => {
    expect(parse("hotels", "subcategory=land").filters.subcategory).toBe("");
    expect(parse("hotels", "subcategory=guesthouses").filters.subcategory).toBe("guesthouses");
    expect(parse("rentals", "city=goris&district=kapan-center").filters.district).toBe("");
    expect(parse("rentals", "city=kapan&district=kapan-center").filters.district).toBe("kapan-center");
    expect(parse("rentals", "district=kapan-center").filters.district).toBe("kapan-center");
  });
});

describe("propertyStateToSearch", () => {
  it("round-trips a canonical query", () => {
    const query = "city=kapan%2Cgoris&rooms=1%2C2&areaMin=40&condition=euro&furniture=1&sort=price-asc&page=3";
    expect(propertyStateToSearch(parse("real-estate", query))).toBe(`?${query}`);
  });

  it("leaves defaults out of the URL", () => {
    expect(propertyStateToSearch({ filters: DEFAULT_PROPERTY_FILTERS, sort: "relevant", page: 1 })).toBe("");
  });
});

describe("toPropertyQuery", () => {
  it("adds the door's deal preset, which never appears in the URL", () => {
    const state = parse("rentals", "city=kapan,goris&rooms=1,2&furniture=1&page=2");
    expect(toPropertyQuery("rentals", state)).toEqual({
      deal: "rent",
      city: "kapan,goris",
      rooms: "1,2",
      furniture: "1",
      page: 2,
      pageSize: 12,
    });
    expect(propertyStateToSearch(state)).not.toContain("deal");
  });

  it("scopes price bounds to one currency, USD unless the viewer chose AMD", () => {
    expect(toPropertyQuery("real-estate", parse("real-estate", "priceMax=50000")).cur).toBe("USD");
    expect(toPropertyQuery("real-estate", parse("real-estate", "priceMax=50000&cur=AMD")).cur).toBe("AMD");
    expect(toPropertyQuery("real-estate", parse("real-estate", "")).cur).toBeUndefined();
  });
});

describe("countActivePropertyFilters", () => {
  it("counts every non-default filter except the text query", () => {
    expect(countActivePropertyFilters(parse("real-estate", "q=բնակարան&city=kapan&furniture=1&areaMin=40").filters)).toBe(3);
  });
});

describe("stripRejectedParams", () => {
  it("removes exactly the parameters the API rejected", () => {
    const params = new URLSearchParams("city=kapan&areaMin=5&page=2");
    expect(stripRejectedParams(params, { areaMin: ["too small"] })).toBe("?city=kapan&page=2");
  });
});

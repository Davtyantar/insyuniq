import { describe, expect, it } from "vitest";
import { catalogFixture, PROPERTY_FIXTURE } from "@/test/fixtures";
import { CAR_LISTINGS } from "@/mock/cars";
import { SERVICE_LISTINGS } from "@/mock/services";
import { WORK_LISTINGS } from "@/mock/work";
import {
  type CardModel,
  catalogCard,
  isCard,
  legacyCard,
  newestCards,
  orderByIds,
  propertyCard,
  sortCards,
} from "./card";

describe("propertyCard", () => {
  it("links to the deal's door and summarises size", () => {
    const card = propertyCard(PROPERTY_FIXTURE);
    expect(card.door).toBe("rentals");
    expect(card.href).toBe(`/rentals/${PROPERTY_FIXTURE.id}`);
    expect(card.location).toBe("Կապան, Կենտրոն");
    expect(card.headline.startsWith("2-սենյականոց")).toBe(true);
    expect(card.imageCount).toBe(2);
  });
});

describe("catalogCard", () => {
  it("maps property cards from the card bag, cover only", () => {
    const card = catalogCard(catalogFixture({ card: { deal: "daily", rooms: 1, area: 40 } }));
    expect(card?.door).toBe("hotels");
    expect(card?.images).toEqual([PROPERTY_FIXTURE.images[0]]);
    expect(card?.badges).toEqual(["Օրավարձով"]);
  });

  it("returns null for categories not yet on the API, and for a card without a deal", () => {
    expect(catalogCard(catalogFixture({ category: "jobs" }))).toBeNull();
    expect(catalogCard(catalogFixture({ card: {} }))).toBeNull();
  });
});

describe("legacyCard", () => {
  it("keeps mock doors rendering as before", () => {
    expect(legacyCard(SERVICE_LISTINGS[0]).price).toBeNull();
    expect(legacyCard(WORK_LISTINGS[0]).headline).toBe(WORK_LISTINGS[0].title);
    const car = legacyCard(CAR_LISTINGS[0]);
    expect(car.door).toBe("cars");
    expect(car.price?.currency).toBe("USD");
    expect(car.href).toBe(`/cars/${CAR_LISTINGS[0].id}`);
  });
});

describe("sortCards", () => {
  const base = propertyCard(PROPERTY_FIXTURE);
  const card = (id: string, amount: number | null, currency: "USD" | "AMD", publishedAt: string): CardModel => ({
    ...base,
    id,
    publishedAt,
    price: { amount, currency, period: "total", negotiable: amount === null },
  });

  it("orders prices across currencies, negotiable last", () => {
    const cards = [
      card("a", 80_000, "AMD", "2026-09-01T00:00:00Z"),
      card("b", null, "USD", "2026-09-02T00:00:00Z"),
      card("c", 150, "USD", "2026-09-03T00:00:00Z"),
    ];
    expect(sortCards(cards, "price-asc").map((c) => c.id)).toEqual(["c", "a", "b"]);
    expect(sortCards(cards, "date-desc").map((c) => c.id)).toEqual(["c", "b", "a"]);
  });
});

describe("orderByIds", () => {
  it("follows the favorites order and drops ids with no card", () => {
    const base = propertyCard(PROPERTY_FIXTURE);
    const cards = [{ ...base, id: "a" }, { ...base, id: "b" }];
    expect(orderByIds(["b", "gone", "a"], cards).map((c) => c.id)).toEqual(["b", "a"]);
  });
});

describe("newestCards", () => {
  it("merges sources newest first and caps the count", () => {
    const base = propertyCard(PROPERTY_FIXTURE);
    const at = (id: string, day: number) => ({ ...base, id, publishedAt: `2026-09-${String(day).padStart(2, "0")}T00:00:00Z` });
    expect(newestCards([[at("a", 3), at("b", 1)], [at("c", 2)]], 2).map((c) => c.id)).toEqual(["a", "c"]);
    expect([base, null].filter(isCard)).toHaveLength(1);
  });
});

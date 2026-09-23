import { describe, expect, it } from "vitest";
import { cityValues, districtValues } from "@/lib/api/schema";
import { CITY_LABEL, DISTRICT_LABEL, citySlugOf, districtsOf, isCity, locationText } from "./geo";

describe("geo", () => {
  it("labels every contract city and district", () => {
    for (const city of cityValues) expect(CITY_LABEL[city]).toBeTruthy();
    for (const district of districtValues) expect(DISTRICT_LABEL[district]).toBeTruthy();
  });

  it("lists a city's districts by slug prefix", () => {
    expect(districtsOf(["kajaran"])).toEqual(["kajaran-center", "kajaran-norashen", "kajaran-lernayin"]);
    expect(districtsOf([])).toEqual([]);
  });

  it("round-trips the Armenian city names the app stores", () => {
    expect(citySlugOf("Կապան")).toBe("kapan");
    expect(citySlugOf("Paris")).toBeUndefined();
    expect(isCity("goris")).toBe(true);
    expect(isCity("Գորիս")).toBe(false);
  });

  it("renders city and district as one line", () => {
    expect(locationText("kapan", "kapan-center")).toBe("Կապան, Կենտրոն");
    expect(locationText("tatev")).toBe("Տաթև");
  });
});

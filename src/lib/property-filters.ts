import {
  buildingTypeValues,
  cityValues,
  currencyValues,
  districtValues,
  propertyConditionValues,
  propertySortKeyValues,
  roomsOptionValues,
} from "@/lib/api/schema";
import type {
  BuildingType,
  City,
  Currency,
  District,
  PropertyCondition,
  PropertyFacetQuery,
  PropertySearchQuery,
  PropertySortKey,
  PropertySubcategory,
  RoomsOption,
} from "@/lib/api/types";
import { PAGE_SIZE } from "@/lib/constants";
import { PROPERTY_DOORS, type PropertyDoor } from "@/lib/property-doors";

/** Filter state of a property door. Field names are the contract's query parameter names, so the
 * page URL is the API query minus the door's deal preset. Numbers stay strings, as inputs hold them. */
export interface PropertyFilters {
  q: string;
  city: City[];
  district: District | "";
  priceMin: string;
  priceMax: string;
  cur: Currency | "";
  withPhoto: boolean;
  verifiedOnly: boolean;
  subcategory: PropertySubcategory | "";
  rooms: RoomsOption[];
  areaMin: string;
  areaMax: string;
  floorMin: string;
  floorMax: string;
  totalFloorsMin: string;
  totalFloorsMax: string;
  condition: PropertyCondition[];
  buildingType: BuildingType | "";
  furniture: boolean;
  balcony: boolean;
  parking: boolean;
  pool: boolean;
}

export const DEFAULT_PROPERTY_FILTERS: PropertyFilters = {
  q: "",
  city: [],
  district: "",
  priceMin: "",
  priceMax: "",
  cur: "",
  withPhoto: false,
  verifiedOnly: false,
  subcategory: "",
  rooms: [],
  areaMin: "",
  areaMax: "",
  floorMin: "",
  floorMax: "",
  totalFloorsMin: "",
  totalFloorsMax: "",
  condition: [],
  buildingType: "",
  furniture: false,
  balcony: false,
  parking: false,
  pool: false,
};

export interface PropertyPageState {
  filters: PropertyFilters;
  sort: PropertySortKey;
  page: number;
}

const MAX_WHOLE = 1_000_000_000;

function oneOf<T extends string>(values: readonly T[], raw: string | null): T | "" {
  return raw !== null && (values as readonly string[]).includes(raw) ? (raw as T) : "";
}

function listOf<T extends string>(values: readonly T[], raw: string | null): T[] {
  if (!raw) return [];
  return [...new Set(raw.split(","))].filter((value): value is T => (values as readonly string[]).includes(value));
}

const flag = (raw: string | null) => raw === "1" || raw === "true";
/** Non-negative integers below a billion; anything else is dropped rather than sent. */
const whole = (raw: string | null) => (raw !== null && /^\d{1,9}$/.test(raw) && Number(raw) < MAX_WHOLE ? raw : "");
const decimal = (raw: string | null) => (raw !== null && /^\d{1,6}(\.\d{1,2})?$/.test(raw) ? raw : "");

export function parsePropertyState(door: PropertyDoor, params: URLSearchParams): PropertyPageState {
  const allowedSubcategories = PROPERTY_DOORS[door].subcategories.map((option) => option.value);
  const city = listOf(cityValues, params.get("city"));
  const district = oneOf(districtValues, params.get("district"));
  const filters: PropertyFilters = {
    q: (params.get("q") ?? "").trim().slice(0, 200),
    city,
    district: district && (city.length === 0 || city.some((c) => district.startsWith(`${c}-`))) ? district : "",
    priceMin: whole(params.get("priceMin")),
    priceMax: whole(params.get("priceMax")),
    cur: oneOf(currencyValues, params.get("cur")),
    withPhoto: flag(params.get("withPhoto")),
    verifiedOnly: flag(params.get("verifiedOnly")),
    subcategory: oneOf(allowedSubcategories, params.get("subcategory")),
    rooms: listOf(roomsOptionValues, params.get("rooms")),
    areaMin: decimal(params.get("areaMin")),
    areaMax: decimal(params.get("areaMax")),
    floorMin: whole(params.get("floorMin")),
    floorMax: whole(params.get("floorMax")),
    totalFloorsMin: whole(params.get("totalFloorsMin")),
    totalFloorsMax: whole(params.get("totalFloorsMax")),
    condition: listOf(propertyConditionValues, params.get("condition")),
    buildingType: oneOf(buildingTypeValues, params.get("buildingType")),
    furniture: flag(params.get("furniture")),
    balcony: flag(params.get("balcony")),
    parking: flag(params.get("parking")),
    pool: flag(params.get("pool")),
  };
  const page = Number(whole(params.get("page")) || "1");
  return {
    filters,
    sort: oneOf(propertySortKeyValues, params.get("sort")) || "relevant",
    page: page >= 1 ? page : 1,
  };
}

export function propertyStateToSearch(state: PropertyPageState): string {
  const params = new URLSearchParams();
  for (const key of Object.keys(DEFAULT_PROPERTY_FILTERS) as (keyof PropertyFilters)[]) {
    const value = state.filters[key];
    if (Array.isArray(value)) {
      if (value.length) params.set(key, value.join(","));
    } else if (typeof value === "boolean") {
      if (value) params.set(key, "1");
    } else if (value) {
      params.set(key, value);
    }
  }
  if (state.sort !== "relevant") params.set("sort", state.sort);
  if (state.page > 1) params.set("page", String(state.page));
  const query = params.toString();
  return query ? `?${query}` : "";
}

const num = (value: string) => (value === "" ? undefined : Number(value));
const csv = (values: readonly string[]) => (values.length ? values.join(",") : undefined);
const yes = (value: boolean) => (value ? ("1" as const) : undefined);

export function toPropertyFacetQuery(door: PropertyDoor, filters: PropertyFilters): PropertyFacetQuery {
  const priced = filters.priceMin !== "" || filters.priceMax !== "";
  return {
    deal: PROPERTY_DOORS[door].deal,
    q: filters.q || undefined,
    city: csv(filters.city),
    district: filters.district || undefined,
    priceMin: num(filters.priceMin),
    priceMax: num(filters.priceMax),
    // The API compares amounts in the listing's own currency, so bounds need one (spec 4.5).
    cur: priced ? filters.cur || "USD" : undefined,
    withPhoto: yes(filters.withPhoto),
    verifiedOnly: yes(filters.verifiedOnly),
    subcategory: filters.subcategory || undefined,
    rooms: csv(filters.rooms),
    areaMin: num(filters.areaMin),
    areaMax: num(filters.areaMax),
    floorMin: num(filters.floorMin),
    floorMax: num(filters.floorMax),
    totalFloorsMin: num(filters.totalFloorsMin),
    totalFloorsMax: num(filters.totalFloorsMax),
    condition: csv(filters.condition),
    buildingType: filters.buildingType || undefined,
    furniture: yes(filters.furniture),
    balcony: yes(filters.balcony),
    parking: yes(filters.parking),
    pool: yes(filters.pool),
  };
}

export function toPropertyQuery(door: PropertyDoor, state: PropertyPageState, pageSize = PAGE_SIZE): PropertySearchQuery {
  return {
    ...toPropertyFacetQuery(door, state.filters),
    sort: state.sort === "relevant" ? undefined : state.sort,
    page: state.page > 1 ? state.page : undefined,
    pageSize,
  };
}

export function countActivePropertyFilters(filters: PropertyFilters): number {
  let count = 0;
  for (const key of Object.keys(DEFAULT_PROPERTY_FILTERS) as (keyof PropertyFilters)[]) {
    if (key === "q") continue;
    const value = filters[key];
    if (key === "cur" && filters.priceMin === "" && filters.priceMax === "") continue;
    if (Array.isArray(value) ? value.length > 0 : Boolean(value)) count += 1;
  }
  return count;
}

/** After a 400, the door page drops the rejected parameters and reloads once (spec 5). */
export function stripRejectedParams(params: URLSearchParams, errors: Record<string, string[]>): string {
  const next = new URLSearchParams(params);
  for (const key of Object.keys(errors)) next.delete(key);
  const query = next.toString();
  return query ? `?${query}` : "";
}

/** Next passes page `searchParams` as a record; repeated keys arrive as arrays. */
export function toSearchParams(record: Record<string, string | string[] | undefined>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(record)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first !== undefined) params.set(key, first);
  }
  return params;
}

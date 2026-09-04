import type {
  CarFilters,
  CarListing,
  CategorySlug,
  Listing,
  RealEstateFilters,
  RealEstateListing,
  SortKey,
} from "./types";

export const DEFAULT_RE_FILTERS: RealEstateFilters = {
  q: "",
  city: "",
  priceMin: "",
  priceMax: "",
  withPhoto: false,
  verifiedOnly: false,
  subcategory: "",
  deal: "",
  district: "",
  rooms: [],
  areaMin: "",
  areaMax: "",
  floorMin: "",
  floorMax: "",
  totalFloorsMin: "",
  condition: [],
  buildingType: "",
  furniture: false,
  balcony: false,
  parking: false,
};

export const DEFAULT_CAR_FILTERS: CarFilters = {
  q: "",
  city: "",
  priceMin: "",
  priceMax: "",
  withPhoto: false,
  verifiedOnly: false,
  subcategory: "",
  brand: "",
  model: "",
  yearMin: "",
  yearMax: "",
  mileageMin: "",
  mileageMax: "",
  bodyType: [],
  fuel: [],
  engineMin: "",
  engineMax: "",
  transmission: [],
  drive: [],
  color: "",
  condition: "",
  steering: "",
  ownersMax: "",
  accidentFree: false,
};

export function defaultFilters(category: CategorySlug) {
  return category === "cars" ? { ...DEFAULT_CAR_FILTERS } : { ...DEFAULT_RE_FILTERS };
}

type FilterShape = Record<string, string | string[] | boolean>;

/** Reads filter state out of URL search params, using defaults for anything absent. */
export function parseFilters<T extends object>(
  defaults: T,
  params: URLSearchParams | Record<string, string | string[] | undefined>,
): T {
  const get = (key: string): string | undefined => {
    if (params instanceof URLSearchParams) return params.get(key) ?? undefined;
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const next = { ...defaults } as FilterShape;
  for (const [key, fallback] of Object.entries(defaults as FilterShape)) {
    const raw = get(key);
    if (raw === undefined || raw === "") continue;
    if (Array.isArray(fallback)) next[key] = raw.split(",").filter(Boolean);
    else if (typeof fallback === "boolean") next[key] = raw === "1" || raw === "true";
    else next[key] = raw;
  }
  return next as T;
}

/** Serialises filters back to a query string, dropping everything left at default. */
export function filtersToQuery<T extends object>(
  defaults: T,
  filters: T,
  extra: Record<string, string | undefined> = {},
): string {
  const params = new URLSearchParams();
  for (const [key, fallback] of Object.entries(defaults as FilterShape)) {
    const value = filters[key as keyof T] as string | string[] | boolean;
    if (Array.isArray(value)) {
      if (value.length) params.set(key, value.join(","));
    } else if (typeof fallback === "boolean") {
      if (value) params.set(key, "1");
    } else if (value) {
      params.set(key, String(value));
    }
  }
  for (const [key, value] of Object.entries(extra)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function countActiveFilters<T extends object>(defaults: T, filters: T): number {
  let count = 0;
  for (const [key, fallback] of Object.entries(defaults as FilterShape)) {
    if (key === "q") continue;
    const value = filters[key as keyof T] as string | string[] | boolean;
    if (Array.isArray(value)) count += value.length ? 1 : 0;
    else if (typeof fallback === "boolean") count += value ? 1 : 0;
    else count += value ? 1 : 0;
  }
  return count;
}

const num = (value: string) => {
  const parsed = Number(value.replace(/\s/g, ""));
  return Number.isFinite(parsed) && value !== "" ? parsed : undefined;
};

function inRange(value: number, min?: number, max?: number) {
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
}

function matchesText(listing: Listing, q: string) {
  if (!q.trim()) return true;
  const haystack = [
    listing.title,
    listing.description,
    listing.city,
    listing.district ?? "",
    listing.address,
    "brand" in listing ? `${listing.brand} ${listing.model}` : "",
  ]
    .join(" ")
    .toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

function matchesCommon(listing: Listing, filters: { city: string; priceMin: string; priceMax: string; withPhoto: boolean; verifiedOnly: boolean; q: string }) {
  if (!matchesText(listing, filters.q)) return false;
  if (filters.city && listing.city !== filters.city) return false;
  if (!inRange(listing.price, num(filters.priceMin), num(filters.priceMax))) return false;
  if (filters.withPhoto && listing.images.length === 0) return false;
  if (filters.verifiedOnly && !listing.verified) return false;
  return true;
}

export function filterRealEstate(
  listings: RealEstateListing[],
  filters: RealEstateFilters,
): RealEstateListing[] {
  return listings.filter((l) => {
    if (!matchesCommon(l, filters)) return false;
    if (filters.subcategory && l.subcategory !== filters.subcategory) return false;
    if (filters.deal && l.deal !== filters.deal) return false;
    if (filters.district && l.district !== filters.district) return false;
    if (filters.rooms.length) {
      const bucket = l.rooms >= 5 ? "5" : String(l.rooms);
      if (!filters.rooms.includes(bucket)) return false;
    }
    if (!inRange(l.area, num(filters.areaMin), num(filters.areaMax))) return false;
    if (l.floor !== undefined && !inRange(l.floor, num(filters.floorMin), num(filters.floorMax)))
      return false;
    const minTotalFloors = num(filters.totalFloorsMin);
    if (minTotalFloors !== undefined && (l.totalFloors ?? 0) < minTotalFloors) return false;
    if (filters.condition.length && !filters.condition.includes(l.condition)) return false;
    if (filters.buildingType && l.buildingType !== filters.buildingType) return false;
    if (filters.furniture && !l.furniture) return false;
    if (filters.balcony && !l.balcony) return false;
    if (filters.parking && !l.parking) return false;
    return true;
  });
}

export function filterCars(listings: CarListing[], filters: CarFilters): CarListing[] {
  return listings.filter((l) => {
    if (!matchesCommon(l, filters)) return false;
    if (filters.subcategory && l.subcategory !== filters.subcategory) return false;
    if (filters.brand && l.brand !== filters.brand) return false;
    if (filters.model && l.model !== filters.model) return false;
    if (!inRange(l.year, num(filters.yearMin), num(filters.yearMax))) return false;
    if (!inRange(l.mileage, num(filters.mileageMin), num(filters.mileageMax))) return false;
    if (filters.bodyType.length && !filters.bodyType.includes(l.bodyType)) return false;
    if (filters.fuel.length && !filters.fuel.includes(l.fuel)) return false;
    if (!inRange(l.engineVolume, num(filters.engineMin), num(filters.engineMax))) return false;
    if (filters.transmission.length && !filters.transmission.includes(l.transmission)) return false;
    if (filters.drive.length && !filters.drive.includes(l.drive)) return false;
    if (filters.color && l.color !== filters.color) return false;
    if (filters.condition && l.condition !== filters.condition) return false;
    if (filters.steering && l.steering !== filters.steering) return false;
    const maxOwners = num(filters.ownersMax);
    if (maxOwners !== undefined && l.owners > maxOwners) return false;
    if (filters.accidentFree && !l.accidentFree) return false;
    return true;
  });
}

export const SORT_OPTIONS: Record<CategorySlug, { value: SortKey; label: string }[]> = {
  "real-estate": [
    { value: "relevant", label: "По релевантности" },
    { value: "date-desc", label: "Сначала новые" },
    { value: "price-asc", label: "Сначала дешевле" },
    { value: "price-desc", label: "Сначала дороже" },
    { value: "area-desc", label: "Больше площадь" },
  ],
  cars: [
    { value: "relevant", label: "По релевантности" },
    { value: "date-desc", label: "Сначала новые" },
    { value: "price-asc", label: "Сначала дешевле" },
    { value: "price-desc", label: "Сначала дороже" },
    { value: "mileage-asc", label: "Меньше пробег" },
    { value: "year-desc", label: "Новее год выпуска" },
  ],
};

export function sortListings<T extends Listing>(listings: T[], sort: SortKey): T[] {
  const sorted = [...listings];
  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "date-desc":
      return sorted.sort(
        (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
      );
    case "area-desc":
      return sorted.sort(
        (a, b) => ("area" in b ? b.area : 0) - ("area" in a ? a.area : 0),
      );
    case "mileage-asc":
      return sorted.sort(
        (a, b) =>
          ("mileage" in a ? a.mileage : 0) - ("mileage" in b ? b.mileage : 0),
      );
    case "year-desc":
      return sorted.sort(
        (a, b) => ("year" in b ? b.year : 0) - ("year" in a ? a.year : 0),
      );
    default:
      return sorted.sort((a, b) => b.views - a.views);
  }
}

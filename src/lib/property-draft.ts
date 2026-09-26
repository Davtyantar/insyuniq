import { landTypeValues } from "@/lib/api/schema";
import type { CreatePropertyListingRequest, Deal, LandType, PropertySubcategory } from "@/lib/api/types";
import type { ListingDraft, WizardStepKey } from "@/lib/draft";
import { citySlugOf, districtSlugOf } from "@/lib/geo";

/** Wizard categories whose doors read the API (PR A1); they publish there too. */
const API_CATEGORIES = new Set(["real-estate", "rentals", "hotels"]);

export function publishesToApi(category: ListingDraft["category"]): boolean {
  return category !== null && API_CATEGORIES.has(category);
}

/** Mirrors the contract's `Deal` description (the matrix has no schema of its own). */
export const DEALS_BY_SUBCATEGORY: Record<PropertySubcategory, Deal[]> = {
  apartments: ["sale", "rent", "daily"],
  houses: ["sale", "rent", "daily"],
  "new-buildings": ["sale"],
  commercial: ["sale", "rent"],
  land: ["sale", "rent"],
  garages: ["sale", "rent"],
  hotels: ["daily"],
  guesthouses: ["daily"],
};

const PERIOD_BY_DEAL = { sale: "total", rent: "month", daily: "night" } as const;

/** Mirrors InSyunik-Api's CreateListingValidator field table (contract PropertyFields descriptions). */
const RULES = {
  roomsRequired: ["apartments", "houses", "new-buildings", "hotels", "guesthouses"],
  roomsForbidden: ["land", "garages"],
  landAreaForbidden: ["apartments", "new-buildings", "garages", "hotels", "guesthouses"],
  floorForbidden: ["houses", "land", "garages", "hotels", "guesthouses"],
  totalFloorsForbidden: ["land", "garages", "hotels", "guesthouses"],
  conditionRequired: ["apartments", "houses", "new-buildings", "commercial"],
  buildingTypeForbidden: ["land", "garages"],
  ceilingForbidden: ["land", "garages"],
  bathroomsRequired: ["apartments", "houses", "new-buildings", "hotels", "guesthouses"],
  bathroomsForbidden: ["land", "garages"],
  utilitiesAllowed: ["land", "garages"],
} satisfies Record<string, PropertySubcategory[]>;

/** The prototype's stay types the contract folds into `houses` (spec W4). */
const SUBCATEGORY_ALIASES: Record<string, PropertySubcategory> = { "daily-houses": "houses", cottages: "houses" };
const SUBCATEGORIES = new Set(Object.keys(DEALS_BY_SUBCATEGORY));

export function draftSubcategory(draft: ListingDraft): PropertySubcategory | null {
  const value = SUBCATEGORY_ALIASES[draft.subcategory] ?? draft.subcategory;
  return SUBCATEGORIES.has(value) ? (value as PropertySubcategory) : null;
}

export function draftDeal(draft: ListingDraft): Deal {
  if (draft.category === "hotels") return "daily";
  if (draft.category === "rentals") return draft.term === "daily" ? "daily" : "rent";
  return draft.deal;
}

export function draftDealError(draft: ListingDraft): string | null {
  const subcategory = draftSubcategory(draft);
  if (!publishesToApi(draft.category) || !subcategory) return null;
  return DEALS_BY_SUBCATEGORY[subcategory].includes(draftDeal(draft))
    ? null
    : "Այս տեսակի համար ընտրված գործարքը հնարավոր չէ";
}

const blank = (value: string) => value.trim() === "";
const num = (value: string) => (blank(value) ? undefined : Number(value));
const is = (list: readonly string[], subcategory: PropertySubcategory) => list.includes(subcategory);

/** The required fields the API would otherwise reject with a 400. */
export function requiredSpecErrors(draft: ListingDraft): string[] {
  const subcategory = draftSubcategory(draft);
  if (!publishesToApi(draft.category) || !subcategory) return [];
  const errors: string[] = [];
  if (is(RULES.roomsRequired, subcategory) && blank(draft.rooms)) errors.push("Նշեք սենյակների քանակը");
  if (subcategory !== "land" && blank(draft.area)) errors.push("Նշեք մակերեսը");
  if (subcategory === "land" && blank(draft.landArea)) errors.push("Նշեք հողամասի մակերեսը (սոտկա)");
  if (is(RULES.conditionRequired, subcategory) && !draft.reCondition) errors.push("Ընտրեք վիճակը");
  if (is(RULES.bathroomsRequired, subcategory) && blank(draft.bathrooms)) errors.push("Նշեք սանհանգույցների քանակը");
  return errors;
}

export function draftToCreateRequest(draft: ListingDraft, imagePaths: string[]): CreatePropertyListingRequest {
  const subcategory = draftSubcategory(draft);
  if (!subcategory) throw new Error(`Not a property subcategory: ${draft.subcategory}`);
  const city = citySlugOf(draft.city);
  if (!city) throw new Error(`Unknown city: ${draft.city}`);
  const deal = draftDeal(draft);
  const usd = num(draft.price);
  const amd = num(draft.priceAmd);
  const [amount, currency] = usd !== undefined ? [usd, "USD" as const] : amd !== undefined ? [amd, "AMD" as const] : [null, "USD" as const];
  const utilities = is(RULES.utilitiesAllowed, subcategory);
  const landType = (landTypeValues as readonly string[]).includes(draft.landType) ? (draft.landType as LandType) : undefined;

  return {
    subcategory,
    deal,
    title: draft.title.trim(),
    description: draft.description.trim(),
    price: { amount, currency, period: PERIOD_BY_DEAL[deal], negotiable: draft.negotiable || amount === null },
    city,
    district: draft.district ? districtSlugOf(city, draft.district) : undefined,
    address: draft.address.trim() || undefined,
    images: imagePaths,
    rooms: is(RULES.roomsForbidden, subcategory) ? undefined : num(draft.rooms),
    area: num(draft.area),
    landArea: is(RULES.landAreaForbidden, subcategory) ? undefined : num(draft.landArea),
    landType: subcategory === "land" ? landType : undefined,
    floor: is(RULES.floorForbidden, subcategory) ? undefined : num(draft.floor),
    totalFloors: is(RULES.totalFloorsForbidden, subcategory) ? undefined : num(draft.totalFloors),
    condition: subcategory === "land" ? undefined : draft.reCondition || undefined,
    buildingType: is(RULES.buildingTypeForbidden, subcategory)
      ? undefined
      : subcategory === "new-buildings"
        ? "new"
        : draft.buildingType,
    buildYear: subcategory === "land" ? undefined : num(draft.buildYear),
    ceilingHeight: is(RULES.ceilingForbidden, subcategory) ? undefined : num(draft.ceilingHeight),
    bathrooms: is(RULES.bathroomsForbidden, subcategory) ? undefined : num(draft.bathrooms),
    furniture: draft.furniture,
    balcony: draft.balcony,
    parking: draft.parking,
    pool: draft.pool,
    water: utilities ? draft.water : undefined,
    gas: utilities ? draft.gas : undefined,
    electricity: utilities ? draft.electricity : undefined,
    pit: utilities ? draft.pit : undefined,
  };
}

export type ServerStepErrors = Partial<Record<WizardStepKey, string[]>>;

const FIELD_STEP: Record<string, WizardStepKey> = {
  subcategory: "type",
  deal: "type",
  title: "description",
  description: "description",
  price: "price",
  images: "photos",
};

const FIELD_LABEL: Record<string, string> = {
  subcategory: "Տեսակ",
  deal: "Գործարք",
  title: "Վերնագիր",
  description: "Նկարագրություն",
  price: "Գին",
  images: "Լուսանկարներ",
  city: "Քաղաք",
  district: "Թաղամաս",
  address: "Հասցե",
  rooms: "Սենյակներ",
  area: "Մակերես",
  landArea: "Հողամաս",
  landType: "Հողի տեսակ",
  floor: "Հարկ",
  totalFloors: "Հարկայնություն",
  condition: "Վիճակ",
  buildingType: "Շենքի տեսակ",
  bathrooms: "Սանհանգույցներ",
  buildYear: "Կառուցման տարի",
  ceilingHeight: "Առաստաղի բարձրություն",
};

/** A 400's field errors, filed under the wizard step that edits each field. The API's
 * messages are English, so each becomes "<Armenian label>՝ ստուգեք արժեքը". */
export function serverErrorsByStep(errors: Record<string, string[]>): ServerStepErrors {
  const byStep: ServerStepErrors = {};
  for (const field of Object.keys(errors)) {
    const step = FIELD_STEP[field] ?? "specs";
    (byStep[step] ??= []).push(`${FIELD_LABEL[field] ?? field}՝ ստուգեք արժեքը`);
  }
  return byStep;
}

export function firstStepWithErrors(steps: WizardStepKey[], byStep: ServerStepErrors): WizardStepKey | null {
  return steps.find((step) => (byStep[step]?.length ?? 0) > 0) ?? null;
}

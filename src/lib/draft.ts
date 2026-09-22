import { MOCK_NOW } from "./constants";
import type { Currency } from "./currency";
import {
  isCar,
  isHotelStay,
  isRealEstate,
  isRental,
  isService,
  type BodyType,
  type CarCondition,
  type CarListing,
  type CategorySlug,
  type DealType,
  type DriveType,
  type FuelType,
  type HotelListing,
  type Listing,
  type RealEstateCondition,
  type RealEstateListing,
  type RentalListing,
  type RentalTerm,
  type ServiceListing,
  type Steering,
  type Transmission,
} from "./types";
import {
  APARTMENT_PHOTOS,
  CAR_PHOTOS,
  COMMERCIAL_PHOTOS,
  HOTEL_PHOTOS,
  HOUSE_PHOTOS,
  WORK_PHOTOS,
} from "@/mock/images";

export interface DraftPhoto {
  id: string;
  url: string;
  name: string;
}

/** Everything the publish wizard collects. Numbers stay strings until publishing. */
export interface ListingDraft {
  category: CategorySlug | null;
  subcategory: string;
  deal: DealType;

  // Rentals
  term: RentalTerm;

  // Real estate
  rooms: string;
  area: string;
  landArea: string;
  landType: string;
  floor: string;
  totalFloors: string;
  bathrooms: string;
  buildYear: string;
  ceilingHeight: string;
  reCondition: RealEstateCondition | "";
  buildingType: "new" | "secondary";
  furniture: boolean;
  balcony: boolean;
  parking: boolean;
  water: boolean;
  gas: boolean;
  electricity: boolean;
  pit: boolean;

  // Hotels
  pool: boolean;

  // Services
  provider: string;
  workingHours: string;

  // Cars
  brand: string;
  model: string;
  year: string;
  mileage: string;
  bodyType: BodyType | "";
  fuel: FuelType | "";
  engineVolume: string;
  power: string;
  transmission: Transmission | "";
  drive: DriveType | "";
  color: string;
  carCondition: CarCondition;
  steering: Steering;
  owners: string;
  accidentFree: boolean;

  // Common
  city: string;
  district: string;
  address: string;
  title: string;
  description: string;
  price: string;
  priceEur: string;
  priceAmd: string;
  priceRub: string;
  photos: DraftPhoto[];
  contactName: string;
  phone: string;
  urgent: boolean;
  negotiable: boolean;
}

export const EMPTY_DRAFT: ListingDraft = {
  category: null,
  subcategory: "",
  deal: "sale",
  term: "daily",
  rooms: "",
  area: "",
  landArea: "",
  landType: "",
  floor: "",
  totalFloors: "",
  bathrooms: "1",
  buildYear: "",
  ceilingHeight: "",
  reCondition: "",
  buildingType: "secondary",
  furniture: false,
  balcony: false,
  parking: false,
  water: false,
  gas: false,
  electricity: false,
  pit: false,
  pool: false,
  provider: "",
  workingHours: "",
  brand: "",
  model: "",
  year: "",
  mileage: "",
  bodyType: "",
  fuel: "",
  engineVolume: "",
  power: "",
  transmission: "",
  drive: "",
  color: "",
  carCondition: "used",
  steering: "left",
  owners: "1",
  accidentFree: true,
  city: "",
  district: "",
  address: "",
  title: "",
  description: "",
  price: "",
  priceEur: "",
  priceAmd: "",
  priceRub: "",
  photos: [],
  contactName: "",
  phone: "",
  urgent: false,
  negotiable: false,
};

export type WizardStepKey =
  | "category"
  | "type"
  | "specs"
  | "photos"
  | "description"
  | "price"
  | "preview";

export interface WizardStepDef {
  id: number;
  key: WizardStepKey;
  title: string;
  hint: string;
}

const ALL_WIZARD_STEPS: Omit<WizardStepDef, "id">[] = [
  { key: "category", title: "Կատեգորիա", hint: "Ինչ եք տեղադրում" },
  { key: "type", title: "Հայտարարության տեսակ", hint: "Ճշտեք բաժինը" },
  { key: "specs", title: "Բնութագրեր", hint: "Հիմնական պարամետրեր" },
  { key: "photos", title: "Լուսանկարներ", hint: "Որքան շատ, այնքան լավ" },
  { key: "description", title: "Նկարագրություն", hint: "Վերնագիր և տեքստ" },
  { key: "price", title: "Գին և կոնտակտներ", hint: "Ինչպես կապվել ձեզ հետ" },
  { key: "preview", title: "Նախադիտում", hint: "Ստուգեք և հրապարակեք" },
];

/** Services skip the price/contacts step entirely — pricing and reaching a provider aren't
 * shown for that category (see the services card/filters), so asking for it here would be a
 * dead end. */
export function wizardSteps(category: CategorySlug | null): WizardStepDef[] {
  return ALL_WIZARD_STEPS.filter((step) => !(category === "services" && step.key === "price")).map(
    (step, index) => ({ ...step, id: index + 1 }),
  );
}

const numberOr = (value: string, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && value !== "" ? parsed : fallback;
};

/** Only the currencies the seller actually filled in end up in the listing's `prices` map. */
function draftPrices(draft: ListingDraft): Partial<Record<Currency, number>> {
  const prices: Partial<Record<Currency, number>> = {};
  if (draft.price) prices.USD = numberOr(draft.price);
  if (draft.priceEur) prices.EUR = numberOr(draft.priceEur);
  if (draft.priceAmd) prices.AMD = numberOr(draft.priceAmd);
  if (draft.priceRub) prices.RUB = numberOr(draft.priceRub);
  return prices;
}

/** Which fields block the Next button on each step. */
export function stepErrors(stepKey: WizardStepKey, draft: ListingDraft): string[] {
  const errors: string[] = [];
  switch (stepKey) {
    case "category":
      if (!draft.category) errors.push("Ընտրեք կատեգորիան");
      break;
    case "type":
      if (!draft.subcategory) errors.push("Ընտրեք հայտարարության տեսակը");
      break;
    case "specs":
      if (!draft.city) errors.push("Նշեք քաղաքը");
      if (draft.category === "rentals" || draft.category === "hotels") {
        if (!draft.area) errors.push("Նշեք մակերեսը");
      } else if (draft.category === "services") {
        if (!draft.provider.trim()) errors.push("Նշեք մատուցողի անունը");
      } else if (draft.category !== "real-estate") {
        if (!draft.brand) errors.push("Ընտրեք մակնիշը");
        if (!draft.model) errors.push("Ընտրեք մոդելը");
        if (!draft.year) errors.push("Նշեք թողարկման տարին");
      }
      break;
    case "description":
      if (draft.title.trim().length < 10) errors.push("Վերնագիրը՝ նվազագույնը 10 նիշ");
      if (draft.description.trim().length < 40) errors.push("Նկարագրությունը՝ նվազագույնը 40 նիշ");
      break;
    case "price":
      if (!draft.price) errors.push("Նշեք գինը");
      if (draft.phone.trim().length < 6) errors.push("Նշեք հեռախոսահամարը");
      if (!draft.contactName.trim()) errors.push("Նշեք անունը");
      break;
    default:
      break;
  }
  return errors;
}

/** Photos are optional, but a listing must still render, so fall back to stock imagery. */
function draftImages(draft: ListingDraft): string[] {
  // Services show a single photo, no gallery — keep only the cover shot.
  if (draft.category === "services") {
    return draft.photos.length ? [draft.photos[0].url] : [WORK_PHOTOS[0]];
  }
  if (draft.photos.length) return draft.photos.map((photo) => photo.url);
  if (draft.category === "cars") return [CAR_PHOTOS.toyotaSedan, CAR_PHOTOS.darkSedan];
  if (draft.category === "rentals") {
    if (draft.subcategory === "houses") return [HOUSE_PHOTOS[0], HOUSE_PHOTOS[1]];
    if (draft.subcategory === "garages" || draft.subcategory === "commercial") {
      return [COMMERCIAL_PHOTOS[0], COMMERCIAL_PHOTOS[1]];
    }
    return [APARTMENT_PHOTOS[0], APARTMENT_PHOTOS[1]];
  }
  if (draft.category === "hotels") {
    if (draft.subcategory === "hotels") return [HOTEL_PHOTOS[0], HOTEL_PHOTOS[1]];
    if (
      draft.subcategory === "houses" ||
      draft.subcategory === "guesthouses" ||
      draft.subcategory === "daily-houses"
    ) {
      return [HOUSE_PHOTOS[0], HOUSE_PHOTOS[1]];
    }
    return [APARTMENT_PHOTOS[0], APARTMENT_PHOTOS[1]];
  }
  if (draft.subcategory === "garages" || draft.subcategory === "commercial") {
    return [COMMERCIAL_PHOTOS[0], COMMERCIAL_PHOTOS[1]];
  }
  return [APARTMENT_PHOTOS[0], APARTMENT_PHOTOS[1]];
}

/** Converts the wizard draft into a listing the rest of the app can render. */
export function draftToListing(draft: ListingDraft, id = `my-${Date.now()}`): Listing {
  const base = {
    id,
    subcategory: draft.subcategory,
    title: draft.title.trim(),
    price: numberOr(draft.price),
    prices: draftPrices(draft),
    city: draft.city,
    district: draft.district || undefined,
    address: draft.address || draft.city,
    images: draftImages(draft),
    description: draft.description.trim(),
    publishedAt: new Date(MOCK_NOW).toISOString(),
    sellerId: "me",
    verified: false,
    urgent: draft.urgent,
    negotiable: draft.negotiable,
    views: 0,
    status: "active" as const,
    coords: { lat: 40.1792, lng: 44.4991 },
  };

  if (draft.category === "cars") {
    const car: CarListing = {
      ...base,
      category: "cars",
      subcategory: (draft.subcategory || "passenger") as CarListing["subcategory"],
      brand: draft.brand,
      model: draft.model,
      year: numberOr(draft.year, new Date(MOCK_NOW).getFullYear()),
      mileage: numberOr(draft.mileage),
      bodyType: (draft.bodyType || "sedan") as BodyType,
      fuel: (draft.fuel || "petrol") as FuelType,
      engineVolume: numberOr(draft.engineVolume),
      power: numberOr(draft.power, 150),
      transmission: (draft.transmission || "automatic") as Transmission,
      drive: (draft.drive || "fwd") as DriveType,
      color: draft.color || "Սպիտակ",
      condition: draft.carCondition,
      steering: draft.steering,
      owners: numberOr(draft.owners, 1),
      accidentFree: draft.accidentFree,
      customsCleared: true,
    };
    return car;
  }

  if (draft.category === "rentals") {
    const rental: RentalListing = {
      ...base,
      category: "rentals",
      subcategory: (draft.subcategory || "apartments") as RentalListing["subcategory"],
      term: draft.term,
      rooms: numberOr(draft.rooms),
      area: numberOr(draft.area),
      floor: draft.floor ? numberOr(draft.floor) : undefined,
      totalFloors: draft.totalFloors ? numberOr(draft.totalFloors) : undefined,
      bathrooms: numberOr(draft.bathrooms, 1),
      furniture: draft.furniture,
      balcony: draft.balcony,
      parking: draft.parking,
    };
    return rental;
  }

  if (draft.category === "hotels") {
    const stay: HotelListing = {
      ...base,
      category: "hotels",
      subcategory: (draft.subcategory || "hotels") as HotelListing["subcategory"],
      term: draft.term,
      rooms: numberOr(draft.rooms),
      area: numberOr(draft.area),
      floor: draft.floor ? numberOr(draft.floor) : undefined,
      totalFloors: draft.totalFloors ? numberOr(draft.totalFloors) : undefined,
      bathrooms: numberOr(draft.bathrooms, 1),
      furniture: draft.furniture,
      balcony: draft.balcony,
      parking: draft.parking,
      pool: draft.pool,
    };
    return stay;
  }

  if (draft.category === "services") {
    const service: ServiceListing = {
      ...base,
      category: "services",
      subcategory: (draft.subcategory || "other") as ServiceListing["subcategory"],
      provider: draft.provider.trim() || draft.contactName.trim(),
      workingHours: draft.workingHours.trim() || undefined,
    };
    return service;
  }

  const realEstate: RealEstateListing = {
    ...base,
    category: "real-estate",
    subcategory: (draft.subcategory || "apartments") as RealEstateListing["subcategory"],
    deal: draft.deal,
    rooms: numberOr(draft.rooms),
    area: numberOr(draft.area),
    landArea: draft.landArea ? numberOr(draft.landArea) : undefined,
    landType: draft.landType || undefined,
    floor: draft.floor ? numberOr(draft.floor) : undefined,
    totalFloors: draft.totalFloors ? numberOr(draft.totalFloors) : undefined,
    condition: (draft.reCondition || "good") as RealEstateCondition,
    buildingType: draft.buildingType,
    buildYear: draft.buildYear ? numberOr(draft.buildYear) : undefined,
    ceilingHeight: draft.ceilingHeight ? numberOr(draft.ceilingHeight) : undefined,
    bathrooms: numberOr(draft.bathrooms, 1),
    furniture: draft.furniture,
    balcony: draft.balcony,
    parking: draft.parking,
    water: draft.water,
    gas: draft.gas,
    electricity: draft.electricity,
    pit: draft.pit,
  };
  return realEstate;
}

/** Reverses draftToListing — opens an already-published listing back into the wizard for
 * editing. `contact` prefills the price step's name/phone fields, which draftToListing never
 * actually stores on the listing itself (the seller card always reads those from the account,
 * not the ad), so there's nothing on `listing` to read them back from. */
export function listingToDraft(listing: Listing, contact?: { name?: string; phone?: string }): ListingDraft {
  const draft: ListingDraft = {
    ...EMPTY_DRAFT,
    category: listing.category === "work" ? null : listing.category,
    subcategory: listing.subcategory,
    city: listing.city,
    district: listing.district ?? "",
    address: listing.address,
    title: listing.title,
    description: listing.description,
    price: listing.prices?.USD != null ? String(listing.prices.USD) : String(listing.price),
    priceEur: listing.prices?.EUR != null ? String(listing.prices.EUR) : "",
    priceAmd: listing.prices?.AMD != null ? String(listing.prices.AMD) : "",
    priceRub: listing.prices?.RUB != null ? String(listing.prices.RUB) : "",
    photos: listing.images.map((url, index) => ({ id: `existing-${index}`, url, name: `photo-${index + 1}` })),
    contactName: contact?.name ?? "",
    phone: contact?.phone ?? "",
    urgent: listing.urgent,
    negotiable: listing.negotiable ?? false,
  };

  if (isRealEstate(listing)) {
    return {
      ...draft,
      deal: listing.deal,
      rooms: String(listing.rooms),
      area: String(listing.area),
      landArea: listing.landArea != null ? String(listing.landArea) : "",
      landType: listing.landType ?? "",
      floor: listing.floor != null ? String(listing.floor) : "",
      totalFloors: listing.totalFloors != null ? String(listing.totalFloors) : "",
      bathrooms: String(listing.bathrooms),
      buildYear: listing.buildYear != null ? String(listing.buildYear) : "",
      ceilingHeight: listing.ceilingHeight != null ? String(listing.ceilingHeight) : "",
      reCondition: listing.condition,
      buildingType: listing.buildingType,
      furniture: listing.furniture,
      balcony: listing.balcony,
      parking: listing.parking,
      water: listing.water ?? false,
      gas: listing.gas ?? false,
      electricity: listing.electricity ?? false,
      pit: listing.pit ?? false,
    };
  }

  if (isCar(listing)) {
    return {
      ...draft,
      brand: listing.brand,
      model: listing.model,
      year: String(listing.year),
      mileage: String(listing.mileage),
      bodyType: listing.bodyType,
      fuel: listing.fuel,
      engineVolume: String(listing.engineVolume),
      power: String(listing.power),
      transmission: listing.transmission,
      drive: listing.drive,
      color: listing.color,
      carCondition: listing.condition,
      steering: listing.steering,
      owners: String(listing.owners),
      accidentFree: listing.accidentFree,
    };
  }

  if (isRental(listing)) {
    return {
      ...draft,
      term: listing.term,
      rooms: String(listing.rooms),
      area: String(listing.area),
      floor: listing.floor != null ? String(listing.floor) : "",
      totalFloors: listing.totalFloors != null ? String(listing.totalFloors) : "",
      bathrooms: String(listing.bathrooms),
      furniture: listing.furniture,
      balcony: listing.balcony,
      parking: listing.parking,
    };
  }

  if (isHotelStay(listing)) {
    return {
      ...draft,
      term: listing.term,
      rooms: String(listing.rooms),
      area: String(listing.area),
      floor: listing.floor != null ? String(listing.floor) : "",
      totalFloors: listing.totalFloors != null ? String(listing.totalFloors) : "",
      bathrooms: String(listing.bathrooms),
      furniture: listing.furniture,
      balcony: listing.balcony,
      parking: listing.parking,
      pool: listing.pool,
    };
  }

  if (isService(listing)) {
    return {
      ...draft,
      provider: listing.provider,
      workingHours: listing.workingHours ?? "",
    };
  }

  return draft;
}

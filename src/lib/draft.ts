import { MOCK_NOW } from "./constants";
import type {
  BodyType,
  CarCondition,
  CarListing,
  CategorySlug,
  DealType,
  DriveType,
  FuelType,
  HotelListing,
  Listing,
  RealEstateCondition,
  RealEstateListing,
  RentalListing,
  RentalTerm,
  Steering,
  Transmission,
} from "./types";
import {
  APARTMENT_PHOTOS,
  CAR_PHOTOS,
  COMMERCIAL_PHOTOS,
  HOTEL_PHOTOS,
  HOUSE_PHOTOS,
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

  // Hotels
  pool: boolean;

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
  photos: DraftPhoto[];
  contactName: string;
  phone: string;
}

export const EMPTY_DRAFT: ListingDraft = {
  category: null,
  subcategory: "",
  deal: "sale",
  term: "daily",
  rooms: "",
  area: "",
  landArea: "",
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
  pool: false,
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
  photos: [],
  contactName: "",
  phone: "",
};

export const WIZARD_STEPS = [
  { id: 1, title: "Կատեգորիա", hint: "Ինչ եք տեղադրում" },
  { id: 2, title: "Հայտարարության տեսակ", hint: "Ճշտեք բաժինը" },
  { id: 3, title: "Բնութագրեր", hint: "Հիմնական պարամետրեր" },
  { id: 4, title: "Լուսանկարներ", hint: "Որքան շատ, այնքան լավ" },
  { id: 5, title: "Նկարագրություն", hint: "Վերնագիր և տեքստ" },
  { id: 6, title: "Գին և կոնտակտներ", hint: "Ինչպես կապվել ձեզ հետ" },
  { id: 7, title: "Նախադիտում", hint: "Ստուգեք և հրապարակեք" },
] as const;

const numberOr = (value: string, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && value !== "" ? parsed : fallback;
};

/** Which fields block the Next button on each step. */
export function stepErrors(step: number, draft: ListingDraft): string[] {
  const errors: string[] = [];
  switch (step) {
    case 1:
      if (!draft.category) errors.push("Ընտրեք կատեգորիան");
      break;
    case 2:
      if (!draft.subcategory) errors.push("Ընտրեք հայտարարության տեսակը");
      break;
    case 3:
      if (!draft.city) errors.push("Նշեք քաղաքը");
      if (
        draft.category === "real-estate" ||
        draft.category === "rentals" ||
        draft.category === "hotels"
      ) {
        if (!draft.area) errors.push("Նշեք մակերեսը");
      } else {
        if (!draft.brand) errors.push("Ընտրեք մակնիշը");
        if (!draft.model) errors.push("Ընտրեք մոդելը");
        if (!draft.year) errors.push("Նշեք թողարկման տարին");
      }
      break;
    case 5:
      if (draft.title.trim().length < 10) errors.push("Վերնագիրը՝ նվազագույնը 10 նիշ");
      if (draft.description.trim().length < 40) errors.push("Նկարագրությունը՝ նվազագույնը 40 նիշ");
      break;
    case 6:
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
      draft.subcategory === "cottages" ||
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
    city: draft.city,
    district: draft.district || undefined,
    address: draft.address || draft.city,
    images: draftImages(draft),
    description: draft.description.trim(),
    publishedAt: new Date(MOCK_NOW).toISOString(),
    sellerId: "me",
    verified: false,
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

  const realEstate: RealEstateListing = {
    ...base,
    category: "real-estate",
    subcategory: (draft.subcategory || "apartments") as RealEstateListing["subcategory"],
    deal: draft.deal,
    rooms: numberOr(draft.rooms),
    area: numberOr(draft.area),
    landArea: draft.landArea ? numberOr(draft.landArea) : undefined,
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
  };
  return realEstate;
}

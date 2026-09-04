import { MOCK_NOW } from "./constants";
import type {
  BodyType,
  CarCondition,
  CarListing,
  CategorySlug,
  DealType,
  DriveType,
  FuelType,
  Listing,
  RealEstateCondition,
  RealEstateListing,
  Steering,
  Transmission,
} from "./types";
import { APARTMENT_PHOTOS, CAR_PHOTOS } from "@/mock/images";

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
  { id: 1, title: "Категория", hint: "Что вы размещаете" },
  { id: 2, title: "Тип объявления", hint: "Уточните раздел" },
  { id: 3, title: "Характеристики", hint: "Основные параметры" },
  { id: 4, title: "Фотографии", hint: "Чем больше, тем лучше" },
  { id: 5, title: "Описание", hint: "Заголовок и текст" },
  { id: 6, title: "Цена и контакты", hint: "Как с вами связаться" },
  { id: 7, title: "Предпросмотр", hint: "Проверьте и публикуйте" },
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
      if (!draft.category) errors.push("Выберите категорию");
      break;
    case 2:
      if (!draft.subcategory) errors.push("Выберите тип объявления");
      break;
    case 3:
      if (!draft.city) errors.push("Укажите город");
      if (draft.category === "real-estate") {
        if (!draft.area) errors.push("Укажите площадь");
      } else {
        if (!draft.brand) errors.push("Выберите марку");
        if (!draft.model) errors.push("Выберите модель");
        if (!draft.year) errors.push("Укажите год выпуска");
      }
      break;
    case 5:
      if (draft.title.trim().length < 10) errors.push("Заголовок от 10 символов");
      if (draft.description.trim().length < 40) errors.push("Описание от 40 символов");
      break;
    case 6:
      if (!draft.price) errors.push("Укажите цену");
      if (draft.phone.trim().length < 6) errors.push("Укажите телефон");
      if (!draft.contactName.trim()) errors.push("Укажите имя");
      break;
    default:
      break;
  }
  return errors;
}

/** Photos are optional, but a listing must still render, so fall back to stock imagery. */
function draftImages(draft: ListingDraft): string[] {
  if (draft.photos.length) return draft.photos.map((photo) => photo.url);
  return draft.category === "cars"
    ? [CAR_PHOTOS.toyotaSedan, CAR_PHOTOS.darkSedan]
    : [APARTMENT_PHOTOS[0], APARTMENT_PHOTOS[1]];
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
      color: draft.color || "Белый",
      condition: draft.carCondition,
      steering: draft.steering,
      owners: numberOr(draft.owners, 1),
      accidentFree: draft.accidentFree,
      customsCleared: true,
    };
    return car;
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

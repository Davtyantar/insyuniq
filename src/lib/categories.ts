import { Building2, Car, type LucideIcon } from "lucide-react";
import { CAR_LISTINGS } from "@/mock/cars";
import { REAL_ESTATE_LISTINGS } from "@/mock/real-estate";
import { CAR_SUBCATEGORIES, REAL_ESTATE_SUBCATEGORIES, type Option } from "@/mock/taxonomy";
import type { CategorySlug, Listing } from "./types";

export interface CategoryConfig {
  slug: CategorySlug;
  label: string;
  /** Used in sentences: "Найдено 12 объявлений в недвижимости". */
  labelPrepositional: string;
  href: string;
  icon: LucideIcon;
  searchPlaceholder: string;
  subcategories: Option[];
  listings: Listing[];
  cover: string;
  /** Short marketing line on the home page. */
  tagline: string;
}

export const CATEGORIES: Record<CategorySlug, CategoryConfig> = {
  "real-estate": {
    slug: "real-estate",
    label: "Недвижимость",
    labelPrepositional: "недвижимости",
    href: "/real-estate",
    icon: Building2,
    searchPlaceholder: "Квартира, дом, район…",
    subcategories: REAL_ESTATE_SUBCATEGORIES,
    listings: REAL_ESTATE_LISTINGS,
    cover: REAL_ESTATE_LISTINGS[0].images[0],
    tagline: "Квартиры, дома и участки по всему Сюнику",
  },
  cars: {
    slug: "cars",
    label: "Автомобили",
    labelPrepositional: "автомобилях",
    href: "/cars",
    icon: Car,
    searchPlaceholder: "Марка, модель, например BMW X5",
    subcategories: CAR_SUBCATEGORIES,
    listings: CAR_LISTINGS,
    cover: CAR_LISTINGS[4].images[0],
    tagline: "Легковые, внедорожники и электромобили в Сюнике",
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);

export function isCategorySlug(value: string): value is CategorySlug {
  return value === "real-estate" || value === "cars";
}

export function categoryOf(listing: Listing): CategoryConfig {
  return CATEGORIES[listing.category];
}

export function listingHref(listing: Listing): string {
  return `/${listing.category}/${listing.id}`;
}

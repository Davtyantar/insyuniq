import { BedDouble, Briefcase, Building2, Car, KeyRound, type LucideIcon } from "lucide-react";
import { CAR_LISTINGS } from "@/mock/cars";
import { HOTEL_LISTINGS } from "@/mock/hotels";
import { REAL_ESTATE_LISTINGS } from "@/mock/real-estate";
import { RENTAL_LISTINGS } from "@/mock/rentals";
import {
  CAR_SUBCATEGORIES,
  HOTEL_SUBCATEGORIES,
  REAL_ESTATE_SUBCATEGORIES,
  RENTAL_SUBCATEGORIES,
  WORK_SUBCATEGORIES,
  type Option,
} from "@/mock/taxonomy";
import { WORK_LISTINGS } from "@/mock/work";
import type { CategorySlug, Listing } from "./types";

export interface CategoryConfig {
  slug: CategorySlug;
  label: string;
  /** Used in sentences like "Գտնվել է 12 հայտարարություն անշարժ գույքի կատեգորիայում". */
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
    label: "Անշարժ գույք",
    labelPrepositional: "անշարժ գույքի",
    href: "/real-estate",
    icon: Building2,
    searchPlaceholder: "Բնակարան, տուն, թաղամաս…",
    subcategories: REAL_ESTATE_SUBCATEGORIES,
    listings: REAL_ESTATE_LISTINGS,
    cover: REAL_ESTATE_LISTINGS[0].images[0],
    tagline: "Բնակարաններ, տներ և հողատարածքներ ողջ Սյունիքում",
  },
  cars: {
    slug: "cars",
    label: "Ավտոմեքենաներ",
    labelPrepositional: "ավտոմեքենաների",
    href: "/cars",
    icon: Car,
    searchPlaceholder: "Մակնիշ, մոդել, օրինակ՝ BMW X5",
    subcategories: CAR_SUBCATEGORIES,
    listings: CAR_LISTINGS,
    cover: CAR_LISTINGS[4].images[0],
    tagline: "Մարդատար, ամենագնաց և էլեկտրական մեքենաներ Սյունիքում",
  },
  rentals: {
    slug: "rentals",
    label: "Վարձակալություն",
    labelPrepositional: "վարձակալության",
    href: "/rentals",
    icon: KeyRound,
    searchPlaceholder: "Բնակարան, տուն, ավտոտնակ վարձով…",
    subcategories: RENTAL_SUBCATEGORIES,
    listings: RENTAL_LISTINGS,
    cover: RENTAL_LISTINGS[0].images[0],
    tagline: "Բնակարաններ, տներ, կոմերցիոն գույք և ավտոտնակներ վարձով",
  },
  hotels: {
    slug: "hotels",
    label: "Հյուրանոցներ և հանգիստ",
    labelPrepositional: "հյուրանոցների և հանգստի",
    href: "/hotels",
    icon: BedDouble,
    searchPlaceholder: "Հյուրանոց, հյուրատուն, օրավարձ բնակարան…",
    subcategories: HOTEL_SUBCATEGORIES,
    listings: HOTEL_LISTINGS,
    cover: HOTEL_LISTINGS[0].images[0],
    tagline: "Հյուրանոցներ, հյուրատներ և հանգստյան բնակատեղեր՝ օրավարձ և ժամկետով",
  },
  work: {
    slug: "work",
    label: "Աշխատանք",
    labelPrepositional: "աշխատանքի",
    href: "/work",
    icon: Briefcase,
    searchPlaceholder: "Պաշտոն, մասնագիտություն, աշխատավայր…",
    subcategories: WORK_SUBCATEGORIES,
    listings: WORK_LISTINGS,
    cover: WORK_LISTINGS[0].images[0],
    tagline: "Թափուր աշխատատեղեր Սյունիքի մարզի գործատուներից",
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);

export function isCategorySlug(value: string): value is CategorySlug {
  return (
    value === "real-estate" ||
    value === "cars" ||
    value === "rentals" ||
    value === "hotels" ||
    value === "work"
  );
}

export function categoryOf(listing: Listing): CategoryConfig {
  return CATEGORIES[listing.category];
}

export function listingHref(listing: Listing): string {
  return `/${listing.category}/${listing.id}`;
}

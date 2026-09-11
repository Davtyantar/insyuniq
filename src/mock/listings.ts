import type {
  CarListing,
  HotelListing,
  Listing,
  RealEstateListing,
  RentalListing,
  WorkListing,
} from "@/lib/types";
import { CAR_LISTINGS } from "./cars";
import { HOTEL_LISTINGS } from "./hotels";
import { REAL_ESTATE_LISTINGS } from "./real-estate";
import { RENTAL_LISTINGS } from "./rentals";
import { WORK_LISTINGS } from "./work";

export const ALL_LISTINGS: Listing[] = [
  ...REAL_ESTATE_LISTINGS,
  ...CAR_LISTINGS,
  ...RENTAL_LISTINGS,
  ...HOTEL_LISTINGS,
  ...WORK_LISTINGS,
];

const BY_ID = new Map<string, Listing>(ALL_LISTINGS.map((l) => [l.id, l]));

export function getListing(id: string): Listing | undefined {
  return BY_ID.get(id);
}

export function getListings(ids: string[]): Listing[] {
  return ids.map((id) => BY_ID.get(id)).filter((l): l is Listing => Boolean(l));
}

export function getRealEstate(id: string): RealEstateListing | undefined {
  const listing = BY_ID.get(id);
  return listing?.category === "real-estate" ? listing : undefined;
}

export function getCar(id: string): CarListing | undefined {
  const listing = BY_ID.get(id);
  return listing?.category === "cars" ? listing : undefined;
}

export function getRental(id: string): RentalListing | undefined {
  const listing = BY_ID.get(id);
  return listing?.category === "rentals" ? listing : undefined;
}

export function getHotel(id: string): HotelListing | undefined {
  const listing = BY_ID.get(id);
  return listing?.category === "hotels" ? listing : undefined;
}

export function getWork(id: string): WorkListing | undefined {
  const listing = BY_ID.get(id);
  return listing?.category === "work" ? listing : undefined;
}

/** Newest listings across every category, for the home page "recently added" showcase. */
export const RECENT_LISTINGS = [...ALL_LISTINGS]
  .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
  .slice(0, 12);

/** Hand-picked highlights for the home page. */
export const FEATURED_IDS = [
  "re-1",
  "car-17",
  "re-10",
  "car-8",
  "re-5",
  "car-3",
  "re-14",
  "car-16",
];

export const FEATURED_LISTINGS = getListings(FEATURED_IDS);

/** Top picks per category for the home page. */
const byViews = (a: Listing, b: Listing) => b.views - a.views;

export const TOP_REAL_ESTATE = [...REAL_ESTATE_LISTINGS].sort(byViews).slice(0, 8);
export const TOP_CARS = [...CAR_LISTINGS].sort(byViews).slice(0, 8);
export const TOP_RENTALS = [...RENTAL_LISTINGS].sort(byViews).slice(0, 8);
export const TOP_HOTELS = [...HOTEL_LISTINGS].sort(byViews).slice(0, 8);

/** Split out of TOP_HOTELS for their own home-page sections. */
export const TOP_HOTEL_ROOMS = HOTEL_LISTINGS.filter((l) => l.subcategory === "hotels")
  .sort(byViews)
  .slice(0, 8);
export const TOP_VACATION_HOUSES = HOTEL_LISTINGS.filter((l) => l.subcategory === "houses")
  .sort(byViews)
  .slice(0, 8);
export const TOP_DAILY_HOUSES = HOTEL_LISTINGS.filter((l) => l.subcategory === "daily-houses")
  .sort(byViews)
  .slice(0, 8);

/** Listings that belong to the signed-in user of this prototype. */
export const MY_LISTING_IDS = ["re-2", "car-5", "re-12"];
export const MY_ARCHIVED_IDS = ["car-10", "re-6"];

export const MY_LISTINGS: Listing[] = getListings(MY_LISTING_IDS).map((l) => ({
  ...l,
  sellerId: "me",
}));

export const MY_ARCHIVED: Listing[] = getListings(MY_ARCHIVED_IDS).map((l) => ({
  ...l,
  sellerId: "me",
  status: "archived" as const,
}));

/** Similar listings for a detail page: same category and subcategory first. */
export function getSimilar(listing: Listing, limit = 4): Listing[] {
  const sameCategory = ALL_LISTINGS.filter(
    (l) => l.category === listing.category && l.id !== listing.id,
  );
  const scored = sameCategory
    .map((l) => ({
      listing: l,
      score:
        (l.subcategory === listing.subcategory ? 2 : 0) +
        (l.city === listing.city ? 1 : 0) -
        Math.abs(l.price - listing.price) / Math.max(listing.price, 1),
    }))
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.listing);
}

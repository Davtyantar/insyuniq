import { isUuid } from "@/lib/api/client";
import type { CatalogCard, Money, PropertyListing } from "@/lib/api/types";
import { listingHref } from "@/lib/categories";
import { locationText } from "@/lib/geo";
import { label } from "@/lib/labels";
import { convertAmount } from "@/lib/money";
import { getListing } from "@/mock/listings";
import { DOOR_BY_DEAL, propertyHref } from "@/lib/property-doors";
import { propertyBadges, propertySummary } from "@/lib/property-format";
import { isDaily, isMonthly, listingSummary, locationLine } from "@/lib/specs";
import type { CategorySlug, Listing, SortKey } from "@/lib/types";

/** Everything a listing card renders, whichever source the listing came from. The approved spec
 * (4.7) fixes one card shape so the card has one implementation across API and mock doors. */
export interface CardModel {
  id: string;
  door: CategorySlug;
  href: string;
  title: string;
  /** Null hides the price row (services). */
  price: Money | null;
  location: string;
  /** Cover first. Catalog cards carry only the cover, so hover-scrub shows one image. */
  images: string[];
  imageCount: number;
  featured: boolean;
  verified: boolean;
  publishedAt: string;
  badges: string[];
  /** The card's title line: a size summary for property and cars, the job title for work. */
  headline: string;
  description?: string;
}

export function propertyCard(listing: PropertyListing): CardModel {
  return {
    id: listing.id,
    door: DOOR_BY_DEAL[listing.deal],
    href: propertyHref(listing),
    title: listing.title,
    price: listing.price,
    location: locationText(listing.city, listing.district),
    images: listing.images,
    imageCount: listing.images.length,
    featured: listing.featured,
    verified: listing.verified,
    publishedAt: listing.publishedAt,
    badges: propertyBadges(listing),
    headline: propertySummary(listing),
    description: listing.description,
  };
}

const num = (value: unknown) => (typeof value === "number" ? value : undefined);

/** Null for categories whose door is still on mock data (jobs, vehicles, services before their PRs). */
export function catalogCard(card: CatalogCard): CardModel | null {
  if (card.category !== "property") return null;
  const deal = card.card.deal;
  if (deal !== "sale" && deal !== "rent" && deal !== "daily") return null;
  return {
    id: card.id,
    door: DOOR_BY_DEAL[deal],
    href: propertyHref({ id: card.id, deal }),
    title: card.title,
    price: card.price,
    location: locationText(card.city, card.district),
    images: card.coverImage ? [card.coverImage] : [],
    imageCount: card.imageCount,
    featured: card.featured,
    verified: card.verified,
    publishedAt: card.publishedAt,
    badges: propertyBadges({ deal }),
    headline: propertySummary({
      subcategory: card.subcategory,
      rooms: num(card.card.rooms),
      area: num(card.card.area),
      landArea: num(card.card.landArea),
    }),
  };
}

/** Moved verbatim from listing-card.tsx; deleted with the last mock door. */
function legacyBadges(listing: Listing): string[] {
  const badges: string[] = [];
  if (listing.category === "real-estate") {
    if (listing.buildingType === "new") badges.push("Նորակառույց");
    if (listing.deal === "rent") badges.push("Վարձակալություն");
  } else if (listing.category === "rentals" || listing.category === "hotels") {
    badges.push(listing.term === "daily" ? "Օրավարձով" : "Երկարաժամկետ");
  } else if (listing.category === "work") {
    badges.push(label("employmentType", listing.employmentType));
  } else if (listing.category === "cars") {
    if (listing.fuel === "electric") badges.push("Էլեկտրական");
    if (listing.condition === "new") badges.push("Նոր");
    else if (listing.accidentFree) badges.push("Առանց ավարիայի");
  }
  return badges;
}

/** A mock listing's price as contract Money: USD, period from the legacy term rules. */
export function legacyMoney(listing: Listing): Money {
  const period: Money["period"] = isDaily(listing) ? "night" : isMonthly(listing) ? "month" : "total";
  return { amount: listing.prices?.USD ?? listing.price, currency: "USD", period, negotiable: Boolean(listing.negotiable) };
}

export function legacyCard(listing: Listing): CardModel {
  return {
    id: listing.id,
    door: listing.category,
    href: listingHref(listing),
    title: listing.title,
    price: listing.category === "services" ? null : legacyMoney(listing),
    location: locationLine(listing),
    images: listing.images,
    imageCount: listing.images.length,
    featured: listing.urgent,
    verified: listing.verified,
    publishedAt: listing.publishedAt,
    badges: legacyBadges(listing),
    headline: listing.category === "work" ? listing.title : listingSummary(listing),
    description: listing.description,
  };
}

const usdValue = (card: CardModel) =>
  card.price?.amount == null ? null : convertAmount(card.price.amount, card.price.currency, "USD");
const newestFirst = (a: CardModel, b: CardModel) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt);

/** For lists merged in the browser (search). Server-paged lists keep the API's order. */
export function sortCards(cards: CardModel[], sort: SortKey): CardModel[] {
  const copy = [...cards];
  if (sort === "price-asc" || sort === "price-desc") {
    const direction = sort === "price-asc" ? 1 : -1;
    return copy.sort((a, b) => {
      const x = usdValue(a);
      const y = usdValue(b);
      if (x === null || y === null) return x === y ? newestFirst(a, b) : x === null ? 1 : -1;
      return (x - y) * direction || newestFirst(a, b);
    });
  }
  if (sort === "relevant") return copy.sort((a, b) => Number(b.featured) - Number(a.featured) || newestFirst(a, b));
  return copy.sort(newestFirst);
}

export function isCard(card: CardModel | null): card is CardModel {
  return card !== null;
}

/** Splits stored favorite ids: API UUIDs, mock ids of doors still on mock data, and stale ids to
 * forget (mock ids of doors now on the API, or ids the mock data no longer knows). */
export function partitionFavoriteIds(
  ids: string[],
  mockDoors: readonly string[],
): { apiIds: string[]; mockIds: string[]; staleIds: string[] } {
  const apiIds: string[] = [];
  const mockIds: string[] = [];
  const staleIds: string[] = [];
  for (const id of ids) {
    if (isUuid(id)) {
      apiIds.push(id);
      continue;
    }
    const listing = getListing(id);
    if (listing && mockDoors.includes(listing.category)) {
      mockIds.push(id);
    } else {
      staleIds.push(id);
    }
  }
  return { apiIds, mockIds, staleIds };
}

/** Orders cards to match a list of ids (e.g. favorites), dropping ids with no matching card. */
export function orderByIds(ids: string[], cards: CardModel[]): CardModel[] {
  const byId = new Map(cards.map((card) => [card.id, card]));
  return ids.map((id) => byId.get(id)).filter((card): card is CardModel => card !== undefined);
}

/** Home's "recently added": API and mock doors side by side until the last door moves. */
export function newestCards(groups: CardModel[][], limit: number): CardModel[] {
  return sortCards(groups.flat(), "date-desc").slice(0, limit);
}

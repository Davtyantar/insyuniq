import type { Money, PropertyListing, SellerType } from "@/lib/api/types";
import { legacyCard } from "@/lib/card";
import { CATEGORIES } from "@/lib/categories";
import { locationText } from "@/lib/geo";
import { DOOR_BY_DEAL, doorSubcategoryLabel } from "@/lib/property-doors";
import { propertyChips, propertySpecs, propertySummary } from "@/lib/property-format";
import { cardSpecs, detailSpecs, listingSummary, locationLine, type Spec } from "@/lib/specs";
import type { CategorySlug, Listing, Seller } from "@/lib/types";
import { SELLER_TYPES } from "@/mock/taxonomy";

export interface DetailSeller {
  name: string;
  avatarUrl?: string;
  typeLabel: string;
  /** Display form; strip spaces for a tel: link. */
  phone: string;
}

/** Everything the detail page renders, whichever source the listing came from. */
export interface DetailModel {
  id: string;
  door: CategorySlug;
  subcategory: string;
  subcategoryLabel?: string;
  title: string;
  description: string;
  price: Money | null;
  verified: boolean;
  images: string[];
  /** Work and services show one wide photo instead of the gallery. */
  heroImage: boolean;
  headline: string;
  chips: string[];
  specs: Spec[];
  location: string;
  address?: string;
  coords?: { lat: number; lng: number };
  /** Work calls the place "Աշխատավայր" and shows no map. */
  isWorkplace: boolean;
  publishedAt: string;
  /** Short id shown as "№ …" for phone enquiries. */
  reference: string;
  seller: DetailSeller | null;
}

export const SELLER_TYPE_LABEL: Record<SellerType, string> = {
  private: "Ֆիզիկական անձ",
  agency: "Գործակալություն",
  dealer: "Ավտոսրահ",
  company: "Ընկերություն",
};

/** "+37491452218" → "+374 91 45 22 18"; anything else unchanged. */
export function formatPhone(raw: string): string {
  const match = /^\+374(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(raw);
  return match ? `+374 ${match[1]} ${match[2]} ${match[3]} ${match[4]}` : raw;
}

export function propertyDetail(listing: PropertyListing): DetailModel {
  const door = DOOR_BY_DEAL[listing.deal];
  return {
    id: listing.id,
    door,
    subcategory: listing.subcategory,
    subcategoryLabel: doorSubcategoryLabel(door, listing.subcategory),
    title: listing.title,
    description: listing.description,
    price: listing.price,
    verified: listing.verified,
    images: listing.images,
    heroImage: false,
    headline: propertySummary(listing),
    chips: propertyChips(listing),
    specs: propertySpecs(listing),
    location: locationText(listing.city, listing.district),
    address: listing.address,
    coords: listing.coords,
    isWorkplace: false,
    publishedAt: listing.publishedAt,
    reference: listing.id.slice(0, 8).toUpperCase(),
    seller: listing.seller
      ? {
          name: listing.seller.name,
          avatarUrl: listing.seller.avatarUrl,
          typeLabel: SELLER_TYPE_LABEL[listing.seller.type],
          phone: formatPhone(listing.seller.phone),
        }
      : null,
  };
}

export function legacyDetail(listing: Listing, seller: Seller | undefined): DetailModel {
  return {
    id: listing.id,
    door: listing.category,
    subcategory: listing.subcategory,
    subcategoryLabel: CATEGORIES[listing.category].subcategories.find((s) => s.value === listing.subcategory)?.label,
    title: listing.title,
    description: listing.description,
    price: legacyCard(listing).price,
    verified: listing.verified,
    images: listing.images,
    heroImage: listing.category === "work" || listing.category === "services",
    headline: listingSummary(listing),
    chips: cardSpecs(listing),
    specs: detailSpecs(listing),
    location: locationLine(listing),
    address: listing.address,
    coords: listing.coords,
    isWorkplace: listing.category === "work",
    publishedAt: listing.publishedAt,
    reference: listing.id.toUpperCase(),
    seller: seller
      ? { name: seller.name, avatarUrl: seller.avatar, typeLabel: SELLER_TYPES[seller.type], phone: seller.phone }
      : null,
  };
}

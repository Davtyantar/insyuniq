import { Building, DoorOpen, Home, Hotel, type LucideIcon } from "lucide-react";
import type { Deal, PropertySubcategory } from "@/lib/api/types";
import { REAL_ESTATE_SUBCATEGORIES, RENTAL_SUBCATEGORIES, type Option } from "@/mock/taxonomy";

export type PropertyDoor = "real-estate" | "rentals" | "hotels";

export interface SubcategoryOption {
  value: PropertySubcategory;
  label: string;
  icon?: LucideIcon;
}

export interface PropertyDoorConfig {
  door: PropertyDoor;
  /** The fixed query every request from this door carries. One deal per door means a listing
   * lives on exactly one door (spec W4, W5). */
  deal: Deal;
  subcategories: SubcategoryOption[];
}

/** Taxonomy labels are door-specific ("…for sale", "…for rent"); values are contract values,
 * which `property-doors.test.ts` asserts. */
function fromTaxonomy(options: Option[]): SubcategoryOption[] {
  return options.map((option) => ({
    value: option.value as PropertySubcategory,
    label: option.label,
    icon: option.icon,
  }));
}

export const PROPERTY_DOORS: Record<PropertyDoor, PropertyDoorConfig> = {
  "real-estate": { door: "real-estate", deal: "sale", subcategories: fromTaxonomy(REAL_ESTATE_SUBCATEGORIES) },
  rentals: { door: "rentals", deal: "rent", subcategories: fromTaxonomy(RENTAL_SUBCATEGORIES) },
  hotels: {
    door: "hotels",
    deal: "daily",
    subcategories: [
      { value: "hotels", label: "Հյուրանոցներ", icon: Hotel },
      { value: "guesthouses", label: "Հյուրատներ", icon: DoorOpen },
      { value: "houses", label: "Հանգստյան տներ", icon: Home },
      { value: "apartments", label: "Օրավարձով բնակարաններ", icon: Building },
    ],
  },
};

export const DOOR_BY_DEAL: Record<Deal, PropertyDoor> = { sale: "real-estate", rent: "rentals", daily: "hotels" };

export function isPropertyDoor(value: string): value is PropertyDoor {
  return value === "real-estate" || value === "rentals" || value === "hotels";
}

export function propertyHref(listing: { id: string; deal: Deal }): string {
  return `/${DOOR_BY_DEAL[listing.deal]}/${listing.id}`;
}

export function doorSubcategoryLabel(door: PropertyDoor, value: string): string | undefined {
  return PROPERTY_DOORS[door].subcategories.find((option) => option.value === value)?.label;
}

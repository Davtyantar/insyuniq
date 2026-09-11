import {
  BODY_TYPES,
  BUILDING_TYPES,
  CAR_CONDITIONS,
  CAR_SUBCATEGORIES,
  DEAL_TYPES,
  DRIVE_TYPES,
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  FUEL_TYPES,
  HOTEL_SUBCATEGORIES,
  REAL_ESTATE_SUBCATEGORIES,
  RE_CONDITIONS,
  RENTAL_SUBCATEGORIES,
  RENTAL_TERMS,
  STEERING_TYPES,
  TRANSMISSIONS,
  WORK_SUBCATEGORIES,
  type Option,
} from "@/mock/taxonomy";

function toMap(options: Option[]): Record<string, string> {
  return Object.fromEntries(options.map((o) => [o.value, o.label]));
}

const MAPS: Record<string, Record<string, string>> = {
  reSubcategory: toMap(REAL_ESTATE_SUBCATEGORIES),
  carSubcategory: toMap(CAR_SUBCATEGORIES),
  rentalSubcategory: toMap(RENTAL_SUBCATEGORIES),
  hotelSubcategory: toMap(HOTEL_SUBCATEGORIES),
  rentalTerm: toMap(RENTAL_TERMS),
  deal: toMap(DEAL_TYPES),
  reCondition: toMap(RE_CONDITIONS),
  buildingType: toMap(BUILDING_TYPES),
  bodyType: toMap(BODY_TYPES),
  fuel: toMap(FUEL_TYPES),
  transmission: toMap(TRANSMISSIONS),
  drive: toMap(DRIVE_TYPES),
  carCondition: toMap(CAR_CONDITIONS),
  steering: toMap(STEERING_TYPES),
  workSubcategory: toMap(WORK_SUBCATEGORIES),
  employmentType: toMap(EMPLOYMENT_TYPES),
  experience: toMap(EXPERIENCE_LEVELS),
};

/** Resolves an enum value to its Armenian label, falling back to the raw value. */
export function label(map: keyof typeof MAPS, value?: string | null): string {
  if (!value) return "—";
  return MAPS[map][value] ?? value;
}

export function subcategoryLabel(category: string, value: string): string {
  if (category === "cars") return label("carSubcategory", value);
  if (category === "rentals") return label("rentalSubcategory", value);
  if (category === "hotels") return label("hotelSubcategory", value);
  if (category === "work") return label("workSubcategory", value);
  return label("reSubcategory", value);
}

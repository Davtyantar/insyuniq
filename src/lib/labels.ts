import {
  BODY_TYPES,
  BUILDING_TYPES,
  CAR_CONDITIONS,
  CAR_SUBCATEGORIES,
  DEAL_TYPES,
  DRIVE_TYPES,
  FUEL_TYPES,
  REAL_ESTATE_SUBCATEGORIES,
  RE_CONDITIONS,
  STEERING_TYPES,
  TRANSMISSIONS,
  type Option,
} from "@/mock/taxonomy";

function toMap(options: Option[]): Record<string, string> {
  return Object.fromEntries(options.map((o) => [o.value, o.label]));
}

const MAPS: Record<string, Record<string, string>> = {
  reSubcategory: toMap(REAL_ESTATE_SUBCATEGORIES),
  carSubcategory: toMap(CAR_SUBCATEGORIES),
  deal: toMap(DEAL_TYPES),
  reCondition: toMap(RE_CONDITIONS),
  buildingType: toMap(BUILDING_TYPES),
  bodyType: toMap(BODY_TYPES),
  fuel: toMap(FUEL_TYPES),
  transmission: toMap(TRANSMISSIONS),
  drive: toMap(DRIVE_TYPES),
  carCondition: toMap(CAR_CONDITIONS),
  steering: toMap(STEERING_TYPES),
};

/** Resolves an enum value to its Russian label, falling back to the raw value. */
export function label(map: keyof typeof MAPS, value?: string | null): string {
  if (!value) return "—";
  return MAPS[map][value] ?? value;
}

export function subcategoryLabel(category: string, value: string): string {
  return label(category === "cars" ? "carSubcategory" : "reSubcategory", value);
}

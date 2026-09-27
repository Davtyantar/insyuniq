import type { BuildingType, Deal, PropertyListing, PropertySubcategory } from "@/lib/api/types";
import { formatArea, formatNumber, plural, roomsLabel } from "@/lib/format";
import { label } from "@/lib/labels";
import { DOOR_BY_DEAL, doorSubcategoryLabel } from "@/lib/property-doors";
import type { Spec } from "@/lib/specs";

export const DEAL_LABEL: Record<Deal, string> = { sale: "Վաճառք", rent: "Վարձակալություն", daily: "Օրավարձ" };

/** Subcategories whose card leads with the kind of place instead of a room count. */
const KIND: Partial<Record<PropertySubcategory, string>> = {
  land: "Հողատարածք",
  commercial: "Կոմերցիոն տարածք",
  garages: "Ավտոտնակ",
  hotels: "Հյուրանոց",
};

const sotka = (value: number) => `${formatNumber(value)} ${plural(value, "սոտկա", "սոտկա")}`;
const has = (value: boolean | undefined) => (value ? "Կա" : "Չկա");

export function propertySummary(fields: { subcategory: string; rooms?: number; area?: number; landArea?: number }): string {
  const kind = KIND[fields.subcategory as PropertySubcategory];
  const lead = kind ?? (fields.rooms !== undefined ? roomsLabel(fields.rooms) : "");
  const size =
    fields.subcategory === "land"
      ? fields.landArea !== undefined
        ? sotka(fields.landArea)
        : ""
      : fields.area !== undefined
        ? formatArea(fields.area)
        : "";
  return [lead, size].filter(Boolean).join(" · ");
}

export function propertyBadges(fields: { deal: Deal; buildingType?: BuildingType }): string[] {
  const badges: string[] = [];
  if (fields.buildingType === "new") badges.push("Նորակառույց");
  if (fields.deal === "daily") badges.push("Օրավարձով");
  return badges;
}

export function propertyChips(listing: PropertyListing): string[] {
  const chips: string[] = [];
  if (listing.rooms !== undefined && !KIND[listing.subcategory]) chips.push(roomsLabel(listing.rooms));
  if (listing.area !== undefined) chips.push(formatArea(listing.area));
  if (listing.landArea !== undefined) chips.push(sotka(listing.landArea));
  if (listing.floor !== undefined && listing.totalFloors !== undefined) chips.push(`${listing.floor}/${listing.totalFloors} հարկ`);
  if (listing.condition) chips.push(label("reCondition", listing.condition));
  if (listing.landType) chips.push(label("landType", listing.landType));
  return chips;
}

export function propertySpecs(listing: PropertyListing): Spec[] {
  const door = DOOR_BY_DEAL[listing.deal];
  const specs: Spec[] = [
    { label: "Տեսակ", value: doorSubcategoryLabel(door, listing.subcategory) ?? listing.subcategory },
    { label: "Գործարք", value: DEAL_LABEL[listing.deal] },
  ];
  if (listing.rooms !== undefined) specs.push({ label: "Սենյակներ", value: listing.rooms ? String(listing.rooms) : "Ստուդիո" });
  if (listing.area !== undefined) specs.push({ label: "Ընդհանուր մակերես", value: formatArea(listing.area) });
  if (listing.landArea !== undefined) specs.push({ label: "Հողատարածք", value: sotka(listing.landArea) });
  if (listing.landType) specs.push({ label: "Հողի տեսակ", value: label("landType", listing.landType) });
  if (listing.floor !== undefined && listing.totalFloors !== undefined) {
    specs.push({ label: "Հարկ", value: `${listing.floor}-ը ${listing.totalFloors}-ից` });
  } else if (listing.totalFloors !== undefined) {
    specs.push({ label: "Հարկայնություն", value: String(listing.totalFloors) });
  }
  if (listing.bathrooms !== undefined) specs.push({ label: "Սանհանգույցներ", value: String(listing.bathrooms) });
  if (listing.condition) specs.push({ label: "Վիճակ", value: label("reCondition", listing.condition) });
  if (listing.buildingType) specs.push({ label: "Շենքի տեսակ", value: label("buildingType", listing.buildingType) });
  if (listing.buildYear) specs.push({ label: "Կառուցման տարի", value: String(listing.buildYear) });
  if (listing.ceilingHeight) specs.push({ label: "Առաստաղի բարձրություն", value: `${listing.ceilingHeight} մ` });

  if (listing.subcategory === "land" || listing.subcategory === "garages") {
    if (listing.water !== undefined) specs.push({ label: "Ջուր", value: has(listing.water) });
    if (listing.gas !== undefined) specs.push({ label: "Գազ", value: has(listing.gas) });
    if (listing.electricity !== undefined) specs.push({ label: "Էլեկտրաէներգիա", value: has(listing.electricity) });
    if (listing.pit !== undefined) specs.push({ label: "Յամա", value: has(listing.pit) });
    return specs;
  }
  specs.push(
    { label: "Կահույք", value: has(listing.furniture) },
    { label: "Պատշգամբ", value: has(listing.balcony) },
    { label: "Կայանատեղի", value: has(listing.parking) },
  );
  if (listing.deal === "daily" || listing.pool) specs.push({ label: "Լողավազան", value: has(listing.pool) });
  return specs;
}

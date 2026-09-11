import {
  formatArea,
  formatEngine,
  formatMileage,
  formatNumber,
  plural,
  roomsLabel,
} from "./format";
import { label } from "./labels";
import type { Listing } from "./types";

export interface Spec {
  label: string;
  value: string;
}

/** Rent — real estate by the month, a long-term rental/stay, or a salary — is priced per month. */
export function isMonthly(listing: Listing): boolean {
  return (
    listing.category === "work" ||
    (listing.category === "real-estate" && listing.deal === "rent") ||
    ((listing.category === "rentals" || listing.category === "hotels") && listing.term === "long")
  );
}

/** Daily rentals and hotel-style stays are priced per night. */
export function isDaily(listing: Listing): boolean {
  return (listing.category === "rentals" || listing.category === "hotels") && listing.term === "daily";
}

/** One-line summary shown right under the price on a card. */
export function listingSummary(listing: Listing): string {
  if (listing.category === "work") {
    return `${listing.employer} · ${label("workSubcategory", listing.subcategory)}`;
  }
  if (listing.category === "cars") {
    return `${listing.brand} ${listing.model}, ${listing.year}`;
  }
  if (listing.category === "rentals") {
    if (listing.subcategory === "garages") return `Ավտոտնակ · ${formatArea(listing.area)}`;
    if (listing.subcategory === "commercial") {
      return `Կոմերցիոն տարածք · ${formatArea(listing.area)}`;
    }
    return `${roomsLabel(listing.rooms)} · ${formatArea(listing.area)}`;
  }
  if (listing.category === "hotels") {
    if (listing.subcategory === "hotels") return `Հյուրանոց · ${formatArea(listing.area)}`;
    return `${roomsLabel(listing.rooms)} · ${formatArea(listing.area)}`;
  }
  if (listing.subcategory === "land") {
    return `Հողատարածք ${listing.landArea} ${plural(listing.landArea ?? 0, "սոտկա", "սոտկա")}`;
  }
  if (listing.subcategory === "commercial") {
    return `Կոմերցիոն տարածք · ${formatArea(listing.area)}`;
  }
  if (listing.subcategory === "garages") {
    return `Ավտոտնակ · ${formatArea(listing.area)}`;
  }
  return `${roomsLabel(listing.rooms)} · ${formatArea(listing.area)}`;
}

/** Compact chips on a listing card. */
export function cardSpecs(listing: Listing): string[] {
  if (listing.category === "work") {
    const specs = [
      label("workSubcategory", listing.subcategory),
      label("employmentType", listing.employmentType),
      label("experience", listing.experience),
    ];
    if (listing.schedule) specs.push(listing.schedule);
    return specs;
  }

  if (listing.category === "cars") {
    return [
      listing.fuel === "electric" ? `${listing.power} ձ.ու.` : formatEngine(listing.engineVolume),
      label("fuel", listing.fuel),
      label("transmission", listing.transmission),
      formatMileage(listing.mileage),
      label("drive", listing.drive) + " քարշակ",
    ];
  }

  if (listing.category === "rentals") {
    const noRoomCount = listing.subcategory === "garages" || listing.subcategory === "commercial";
    const specs: string[] = [label("rentalTerm", listing.term)];
    if (!noRoomCount) {
      specs.push(`${listing.rooms || "—"} ${plural(listing.rooms, "սենյակ", "սենյակ")}`);
    }
    specs.push(formatArea(listing.area));
    if (listing.floor && listing.totalFloors) {
      specs.push(`${listing.floor}/${listing.totalFloors} հարկ`);
    }
    return specs;
  }

  if (listing.category === "hotels") {
    const noRoomCount = listing.subcategory === "hotels";
    const specs: string[] = [label("rentalTerm", listing.term)];
    if (!noRoomCount) {
      specs.push(`${listing.rooms || "—"} ${plural(listing.rooms, "սենյակ", "սենյակ")}`);
    }
    specs.push(formatArea(listing.area));
    if (listing.floor && listing.totalFloors) {
      specs.push(`${listing.floor}/${listing.totalFloors} հարկ`);
    }
    return specs;
  }

  const specs: string[] = [];
  if (listing.subcategory !== "land") {
    if (listing.subcategory !== "commercial" && listing.subcategory !== "garages") {
      specs.push(`${listing.rooms || "—"} ${plural(listing.rooms, "սենյակ", "սենյակ")}`);
    }
    specs.push(formatArea(listing.area));
    if (listing.floor && listing.totalFloors) {
      specs.push(`${listing.floor}/${listing.totalFloors} հարկ`);
    }
    specs.push(label("buildingType", listing.buildingType));
  } else {
    specs.push(
      `${listing.landArea} ${plural(listing.landArea ?? 0, "սոտկա", "սոտկա")}`,
      "Շինարարության համար",
    );
  }
  return specs;
}

/** Full specification table on the detail page. */
export function detailSpecs(listing: Listing): Spec[] {
  if (listing.category === "work") {
    const specs: Spec[] = [
      { label: "Ոլորտ", value: label("workSubcategory", listing.subcategory) },
      { label: "Գործատու", value: listing.employer },
      { label: "Զբաղվածության տեսակ", value: label("employmentType", listing.employmentType) },
      { label: "Աշխատանքային փորձ", value: label("experience", listing.experience) },
    ];
    if (listing.schedule) specs.push({ label: "Գրաֆիկ", value: listing.schedule });
    return specs;
  }

  if (listing.category === "cars") {
    return [
      { label: "Մակնիշ", value: listing.brand },
      { label: "Մոդել", value: listing.model },
      { label: "Թողարկման տարի", value: String(listing.year) },
      { label: "Վազք", value: formatMileage(listing.mileage) },
      { label: "Թափքի տեսակ", value: label("bodyType", listing.bodyType) },
      { label: "Շարժիչ", value: label("fuel", listing.fuel) },
      {
        label: "Շարժիչի ծավալը",
        value: listing.engineVolume ? formatEngine(listing.engineVolume) : "Էլեկտրական",
      },
      { label: "Հզորություն", value: `${listing.power} ձ.ու.` },
      { label: "Փոխանցումատուփ", value: label("transmission", listing.transmission) },
      { label: "Քարշակ", value: label("drive", listing.drive) },
      { label: "Գույն", value: listing.color },
      { label: "Վիճակ", value: label("carCondition", listing.condition) },
      { label: "Ղեկ", value: label("steering", listing.steering) },
      { label: "Սեփականատերեր", value: String(listing.owners) },
      { label: "ԱՊՊԱ", value: listing.accidentFree ? "Չի մասնակցել" : "Ներկված է եղել տարր" },
      { label: "Մաքսազերծված", value: listing.customsCleared ? "Այո" : "Ոչ" },
    ];
  }

  if (listing.category === "rentals") {
    const noRoomCount = listing.subcategory === "garages" || listing.subcategory === "commercial";
    const specs: Spec[] = [
      { label: "Տեսակ", value: label("rentalSubcategory", listing.subcategory) },
      { label: "Վարձակալության ժամկետ", value: label("rentalTerm", listing.term) },
    ];
    if (!noRoomCount) {
      specs.push({ label: "Սենյակներ", value: listing.rooms ? String(listing.rooms) : "Ստուդիո" });
    }
    specs.push({ label: "Մակերես", value: formatArea(listing.area) });
    if (listing.floor && listing.totalFloors) {
      specs.push({ label: "Հարկ", value: `${listing.floor}-ը ${listing.totalFloors}-ից` });
    }
    specs.push(
      { label: "Սանհանգույցներ", value: String(listing.bathrooms) },
      { label: "Կահույք", value: listing.furniture ? "Կա" : "Չկա" },
      { label: "Պատշգամբ", value: listing.balcony ? "Կա" : "Չկա" },
      { label: "Կայանատեղի", value: listing.parking ? "Կա" : "Չկա" },
    );
    return specs;
  }

  if (listing.category === "hotels") {
    const noRoomCount = listing.subcategory === "hotels";
    const specs: Spec[] = [
      { label: "Տեսակ", value: label("hotelSubcategory", listing.subcategory) },
      { label: "Վարձակալության ժամկետ", value: label("rentalTerm", listing.term) },
    ];
    if (!noRoomCount) {
      specs.push({ label: "Սենյակներ", value: listing.rooms ? String(listing.rooms) : "Ստուդիո" });
    }
    specs.push({ label: "Մակերես", value: formatArea(listing.area) });
    if (listing.floor && listing.totalFloors) {
      specs.push({ label: "Հարկ", value: `${listing.floor}-ը ${listing.totalFloors}-ից` });
    }
    specs.push(
      { label: "Սանհանգույցներ", value: String(listing.bathrooms) },
      { label: "Կահույք", value: listing.furniture ? "Կա" : "Չկա" },
      { label: "Պատշգամբ", value: listing.balcony ? "Կա" : "Չկա" },
      { label: "Կայանատեղի", value: listing.parking ? "Կա" : "Չկա" },
    );
    return specs;
  }

  const specs: Spec[] = [
    { label: "Տեսակ", value: label("reSubcategory", listing.subcategory) },
    { label: "Գործարք", value: label("deal", listing.deal) },
  ];
  if (listing.subcategory !== "land") {
    if (listing.subcategory !== "commercial" && listing.subcategory !== "garages") {
      specs.push({ label: "Սենյակներ", value: listing.rooms ? String(listing.rooms) : "Ստուդիո" });
    }
    specs.push({ label: "Ընդհանուր մակերես", value: formatArea(listing.area) });
    if (listing.floor && listing.totalFloors) {
      specs.push({ label: "Հարկ", value: `${listing.floor}-ը ${listing.totalFloors}-ից` });
    }
    specs.push(
      { label: "Սանհանգույցներ", value: String(listing.bathrooms) },
      { label: "Վիճակ", value: label("reCondition", listing.condition) },
      { label: "Շենքի տեսակ", value: label("buildingType", listing.buildingType) },
    );
    if (listing.buildYear) specs.push({ label: "Կառուցման տարի", value: String(listing.buildYear) });
    if (listing.ceilingHeight) {
      specs.push({ label: "Առաստաղի բարձրություն", value: `${listing.ceilingHeight} մ` });
    }
    specs.push(
      { label: "Կահույք", value: listing.furniture ? "Կա" : "Չկա" },
      { label: "Պատշգամբ", value: listing.balcony ? "Կա" : "Չկա" },
      { label: "Կայանատեղի", value: listing.parking ? "Կա" : "Չկա" },
    );
  }
  if (listing.landArea) {
    specs.push({
      label: "Հողատարածք",
      value: `${listing.landArea} ${plural(listing.landArea, "սոտկա", "սոտկա")}`,
    });
  }
  if (listing.subcategory === "land") {
    specs.push({ label: "Մակերես", value: `${formatNumber(listing.area)} մ²` });
  }
  return specs;
}

export function locationLine(listing: Listing): string {
  return [listing.city, listing.district].filter(Boolean).join(", ");
}

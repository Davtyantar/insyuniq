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

/** Rent is priced per month — the card and detail page both need to say so. */
export function isMonthly(listing: Listing): boolean {
  return listing.category === "real-estate" && listing.deal === "rent";
}

/** One-line summary shown right under the price on a card. */
export function listingSummary(listing: Listing): string {
  if (listing.category === "cars") {
    return `${listing.brand} ${listing.model}, ${listing.year}`;
  }
  if (listing.subcategory === "land") {
    return `Участок ${listing.landArea} ${plural(listing.landArea ?? 0, "сотка", "сотки", "соток")}`;
  }
  if (listing.subcategory === "commercial") {
    return `Коммерческое помещение · ${formatArea(listing.area)}`;
  }
  if (listing.subcategory === "rooms") {
    return `Комната · ${formatArea(listing.area)}`;
  }
  return `${roomsLabel(listing.rooms)} · ${formatArea(listing.area)}`;
}

/** Compact chips on a listing card. */
export function cardSpecs(listing: Listing): string[] {
  if (listing.category === "cars") {
    return [
      listing.fuel === "electric" ? `${listing.power} л.с.` : formatEngine(listing.engineVolume),
      label("fuel", listing.fuel),
      label("transmission", listing.transmission),
      formatMileage(listing.mileage),
      label("drive", listing.drive) + " привод",
    ];
  }
  const specs: string[] = [];
  if (listing.subcategory !== "land") {
    if (listing.subcategory !== "commercial" && listing.subcategory !== "rooms") {
      specs.push(`${listing.rooms || "—"} ${plural(listing.rooms, "комната", "комнаты", "комнат")}`);
    }
    specs.push(formatArea(listing.area));
    if (listing.floor && listing.totalFloors) {
      specs.push(`${listing.floor}/${listing.totalFloors} этаж`);
    }
    specs.push(label("buildingType", listing.buildingType));
  } else {
    specs.push(
      `${listing.landArea} ${plural(listing.landArea ?? 0, "сотка", "сотки", "соток")}`,
      "Под строительство",
    );
  }
  return specs;
}

/** Full specification table on the detail page. */
export function detailSpecs(listing: Listing): Spec[] {
  if (listing.category === "cars") {
    return [
      { label: "Марка", value: listing.brand },
      { label: "Модель", value: listing.model },
      { label: "Год выпуска", value: String(listing.year) },
      { label: "Пробег", value: formatMileage(listing.mileage) },
      { label: "Тип кузова", value: label("bodyType", listing.bodyType) },
      { label: "Двигатель", value: label("fuel", listing.fuel) },
      {
        label: "Объём двигателя",
        value: listing.engineVolume ? formatEngine(listing.engineVolume) : "Электро",
      },
      { label: "Мощность", value: `${listing.power} л.с.` },
      { label: "Коробка передач", value: label("transmission", listing.transmission) },
      { label: "Привод", value: label("drive", listing.drive) },
      { label: "Цвет", value: listing.color },
      { label: "Состояние", value: label("carCondition", listing.condition) },
      { label: "Руль", value: label("steering", listing.steering) },
      { label: "Владельцев", value: String(listing.owners) },
      { label: "ДТП", value: listing.accidentFree ? "Не участвовал" : "Был окрашен элемент" },
      { label: "Растаможен", value: listing.customsCleared ? "Да" : "Нет" },
    ];
  }

  const specs: Spec[] = [
    { label: "Тип", value: label("reSubcategory", listing.subcategory) },
    { label: "Сделка", value: label("deal", listing.deal) },
  ];
  if (listing.subcategory !== "land") {
    specs.push(
      { label: "Комнат", value: listing.rooms ? String(listing.rooms) : "Студия" },
      { label: "Общая площадь", value: formatArea(listing.area) },
    );
    if (listing.floor && listing.totalFloors) {
      specs.push({ label: "Этаж", value: `${listing.floor} из ${listing.totalFloors}` });
    }
    specs.push(
      { label: "Санузлов", value: String(listing.bathrooms) },
      { label: "Состояние", value: label("reCondition", listing.condition) },
      { label: "Тип дома", value: label("buildingType", listing.buildingType) },
    );
    if (listing.buildYear) specs.push({ label: "Год постройки", value: String(listing.buildYear) });
    if (listing.ceilingHeight) {
      specs.push({ label: "Высота потолков", value: `${listing.ceilingHeight} м` });
    }
    specs.push(
      { label: "Мебель", value: listing.furniture ? "Есть" : "Нет" },
      { label: "Балкон", value: listing.balcony ? "Есть" : "Нет" },
      { label: "Парковка", value: listing.parking ? "Есть" : "Нет" },
    );
  }
  if (listing.landArea) {
    specs.push({
      label: "Участок",
      value: `${listing.landArea} ${plural(listing.landArea, "сотка", "сотки", "соток")}`,
    });
  }
  if (listing.subcategory === "land") {
    specs.push({ label: "Площадь", value: `${formatNumber(listing.area)} м²` });
  }
  return specs;
}

export function locationLine(listing: Listing): string {
  return [listing.city, listing.district].filter(Boolean).join(", ");
}

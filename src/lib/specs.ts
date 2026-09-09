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

/** Rent — real estate by the month, or a long-term rental/stay — is priced per month. */
export function isMonthly(listing: Listing): boolean {
  return (
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
  if (listing.category === "cars") {
    return `${listing.brand} ${listing.model}, ${listing.year}`;
  }
  if (listing.category === "rentals") {
    if (listing.subcategory === "garages") return `Гараж · ${formatArea(listing.area)}`;
    if (listing.subcategory === "commercial") {
      return `Коммерческое помещение · ${formatArea(listing.area)}`;
    }
    return `${roomsLabel(listing.rooms)} · ${formatArea(listing.area)}`;
  }
  if (listing.category === "hotels") {
    if (listing.subcategory === "hotels") return `Отель · ${formatArea(listing.area)}`;
    return `${roomsLabel(listing.rooms)} · ${formatArea(listing.area)}`;
  }
  if (listing.subcategory === "land") {
    return `Участок ${listing.landArea} ${plural(listing.landArea ?? 0, "сотка", "сотки", "соток")}`;
  }
  if (listing.subcategory === "commercial") {
    return `Коммерческое помещение · ${formatArea(listing.area)}`;
  }
  if (listing.subcategory === "garages") {
    return `Гараж · ${formatArea(listing.area)}`;
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

  if (listing.category === "rentals") {
    const noRoomCount = listing.subcategory === "garages" || listing.subcategory === "commercial";
    const specs: string[] = [label("rentalTerm", listing.term)];
    if (!noRoomCount) {
      specs.push(`${listing.rooms || "—"} ${plural(listing.rooms, "комната", "комнаты", "комнат")}`);
    }
    specs.push(formatArea(listing.area));
    if (listing.floor && listing.totalFloors) {
      specs.push(`${listing.floor}/${listing.totalFloors} этаж`);
    }
    return specs;
  }

  if (listing.category === "hotels") {
    const noRoomCount = listing.subcategory === "hotels";
    const specs: string[] = [label("rentalTerm", listing.term)];
    if (!noRoomCount) {
      specs.push(`${listing.rooms || "—"} ${plural(listing.rooms, "комната", "комнаты", "комнат")}`);
    }
    specs.push(formatArea(listing.area));
    if (listing.floor && listing.totalFloors) {
      specs.push(`${listing.floor}/${listing.totalFloors} этаж`);
    }
    return specs;
  }

  const specs: string[] = [];
  if (listing.subcategory !== "land") {
    if (listing.subcategory !== "commercial" && listing.subcategory !== "garages") {
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

  if (listing.category === "rentals") {
    const noRoomCount = listing.subcategory === "garages" || listing.subcategory === "commercial";
    const specs: Spec[] = [
      { label: "Тип", value: label("rentalSubcategory", listing.subcategory) },
      { label: "Срок аренды", value: label("rentalTerm", listing.term) },
    ];
    if (!noRoomCount) {
      specs.push({ label: "Комнат", value: listing.rooms ? String(listing.rooms) : "Студия" });
    }
    specs.push({ label: "Площадь", value: formatArea(listing.area) });
    if (listing.floor && listing.totalFloors) {
      specs.push({ label: "Этаж", value: `${listing.floor} из ${listing.totalFloors}` });
    }
    specs.push(
      { label: "Санузлов", value: String(listing.bathrooms) },
      { label: "Мебель", value: listing.furniture ? "Есть" : "Нет" },
      { label: "Балкон", value: listing.balcony ? "Есть" : "Нет" },
      { label: "Парковка", value: listing.parking ? "Есть" : "Нет" },
    );
    return specs;
  }

  if (listing.category === "hotels") {
    const noRoomCount = listing.subcategory === "hotels";
    const specs: Spec[] = [
      { label: "Тип", value: label("hotelSubcategory", listing.subcategory) },
      { label: "Срок аренды", value: label("rentalTerm", listing.term) },
    ];
    if (!noRoomCount) {
      specs.push({ label: "Комнат", value: listing.rooms ? String(listing.rooms) : "Студия" });
    }
    specs.push({ label: "Площадь", value: formatArea(listing.area) });
    if (listing.floor && listing.totalFloors) {
      specs.push({ label: "Этаж", value: `${listing.floor} из ${listing.totalFloors}` });
    }
    specs.push(
      { label: "Санузлов", value: String(listing.bathrooms) },
      { label: "Мебель", value: listing.furniture ? "Есть" : "Нет" },
      { label: "Балкон", value: listing.balcony ? "Есть" : "Нет" },
      { label: "Парковка", value: listing.parking ? "Есть" : "Нет" },
    );
    return specs;
  }

  const specs: Spec[] = [
    { label: "Тип", value: label("reSubcategory", listing.subcategory) },
    { label: "Сделка", value: label("deal", listing.deal) },
  ];
  if (listing.subcategory !== "land") {
    if (listing.subcategory !== "commercial" && listing.subcategory !== "garages") {
      specs.push({ label: "Комнат", value: listing.rooms ? String(listing.rooms) : "Студия" });
    }
    specs.push({ label: "Общая площадь", value: formatArea(listing.area) });
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

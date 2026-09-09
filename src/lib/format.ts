import { MOCK_NOW } from "./constants";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const num = new Intl.NumberFormat("hy-AM", { maximumFractionDigits: 0 });

export function formatPrice(value: number, opts?: { perMonth?: boolean; perDay?: boolean }) {
  const suffix = opts?.perDay ? "/օր" : opts?.perMonth ? "/ամիս" : "";
  return usd.format(value) + suffix;
}

export function formatNumber(value: number) {
  return num.format(value);
}

export function formatMileage(km: number) {
  return `${num.format(km)} կմ`;
}

export function formatArea(m2: number) {
  return `${num.format(m2)} մ²`;
}

export function formatEngine(liters: number) {
  return `${liters.toFixed(1)} լ`;
}

/** "2 ժամ առաջ", "երեկ", "12 մարտի" — deterministic against a fixed "now". */
export function formatRelativeDate(iso: string, now: number = MOCK_NOW) {
  const date = new Date(iso);
  const diffMin = Math.round((now - date.getTime()) / 60000);
  if (diffMin < 1) return "հենց նոր";
  if (diffMin < 60) return `${diffMin} րոպե առաջ`;
  const diffHours = Math.round(diffMin / 60);
  if (diffHours < 24) return `${diffHours} ${plural(diffHours, "ժամ", "ժամ")} առաջ`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return "երեկ";
  if (diffDays < 7) return `${diffDays} ${plural(diffDays, "օր", "օր")} առաջ`;
  return new Intl.DateTimeFormat("hy-AM", { day: "numeric", month: "long" }).format(date);
}

export function formatFullDate(iso: string) {
  return new Intl.DateTimeFormat("hy-AM", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatMonthYear(iso: string) {
  return new Intl.DateTimeFormat("hy-AM", { month: "long", year: "numeric" }).format(
    new Date(iso),
  );
}

export function formatTime(iso: string) {
  return new Intl.DateTimeFormat("hy-AM", { hour: "2-digit", minute: "2-digit" }).format(
    new Date(iso),
  );
}

/** Armenian doesn't inflect the count word by size like Russian does — just singular vs. plural. */
export function plural(n: number, one: string, many: string) {
  return n === 1 ? one : many;
}

export function roomsLabel(rooms: number) {
  if (rooms === 0) return "Ստուդիո";
  return `${rooms}-սենյականոց`;
}

export function maskPhone(phone: string) {
  return phone.slice(0, phone.length - 6) + "•• ••";
}

const CITY_LOCATIVE: Record<string, string> = {
  "Կապան": "Կապանում",
  "Գորիս": "Գորիսում",
  "Սիսիան": "Սիսիանում",
  "Քաջարան": "Քաջարանում",
  "Մեղրի": "Մեղրիում",
  "Ագարակ": "Ագարակում",
  "Դաստակերտ": "Դաստակերտում",
  "Տաթև": "Տաթևում",
  "Խնձորեսկ": "Խնձորեսկում",
  "Շինուհայր": "Շինուհայրում",
};

/** "Կապան" -> "Կապանում", for phrases like "բնակարաններ Կապանում". */
export function cityInPrepositional(city: string): string {
  return CITY_LOCATIVE[city] ?? city;
}

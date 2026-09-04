import { MOCK_NOW } from "./constants";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const num = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });

export function formatPrice(value: number, opts?: { perMonth?: boolean }) {
  return usd.format(value) + (opts?.perMonth ? "/мес" : "");
}

export function formatNumber(value: number) {
  return num.format(value);
}

export function formatMileage(km: number) {
  return `${num.format(km)} км`;
}

export function formatArea(m2: number) {
  return `${num.format(m2)} м²`;
}

export function formatEngine(liters: number) {
  return `${liters.toFixed(1)} л`;
}

/** "2 часа назад", "вчера", "12 марта" — deterministic against a fixed "now". */
export function formatRelativeDate(iso: string, now: number = MOCK_NOW) {
  const date = new Date(iso);
  const diffMin = Math.round((now - date.getTime()) / 60000);
  if (diffMin < 1) return "только что";
  if (diffMin < 60) return `${diffMin} мин назад`;
  const diffHours = Math.round(diffMin / 60);
  if (diffHours < 24) return `${diffHours} ${plural(diffHours, "час", "часа", "часов")} назад`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return "вчера";
  if (diffDays < 7) return `${diffDays} ${plural(diffDays, "день", "дня", "дней")} назад`;
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" }).format(date);
}

export function formatFullDate(iso: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatMonthYear(iso: string) {
  return new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" }).format(
    new Date(iso),
  );
}

export function formatTime(iso: string) {
  return new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit" }).format(
    new Date(iso),
  );
}

export function plural(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

export function roomsLabel(rooms: number) {
  if (rooms === 0) return "Студия";
  return `${rooms}-комнатная`;
}

export function maskPhone(phone: string) {
  return phone.slice(0, phone.length - 6) + "•• ••";
}

import { currencyOption, type Currency } from "./currency";
import { MOCK_NOW } from "./constants";

/**
 * Not every browser ships full hy-AM ICU data — some silently fall back to
 * the default locale, producing English-style output (comma grouping, English
 * month names) client-side while the server (full-ICU Node) renders correctly,
 * causing a hydration mismatch. So hy-AM formatting below is hardcoded instead
 * of relying on Intl locale data.
 */

/** hy-AM groups with a non-breaking space (U+00A0), e.g. "123 456". */
export function groupDigits(value: number): string {
  const [intPart, fracPart] = Math.round(value).toString().split(".");
  const negative = intPart.startsWith("-");
  const digits = negative ? intPart.slice(1) : intPart;
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return (negative ? "-" : "") + grouped + (fracPart ? "," + fracPart : "");
}

const MONTHS_GENITIVE = [
  "հունվարի",
  "փետրվարի",
  "մարտի",
  "ապրիլի",
  "մայիսի",
  "հունիսի",
  "հուլիսի",
  "օգոստոսի",
  "սեպտեմբերի",
  "հոկտեմբերի",
  "նոյեմբերի",
  "դեկտեմբերի",
];

const MONTHS_NOMINATIVE = [
  "հունվար",
  "փետրվար",
  "մարտ",
  "ապրիլ",
  "մայիս",
  "հունիս",
  "հուլիս",
  "օգոստոս",
  "սեպտեմբեր",
  "հոկտեմբեր",
  "նոյեմբեր",
  "դեկտեմբեր",
];

const APP_TIME_ZONE = "Asia/Yerevan";

/** Locale-independent date/time parts in the app's fixed timezone (avoids server/client TZ drift). */
function yerevanParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";
  return {
    year: get("year"),
    month: Number(get("month")) - 1,
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
}

/** Listing prices are stored in USD; pass `currency` to display the user's chosen currency instead. */
export function formatPrice(
  value: number,
  opts?: { perMonth?: boolean; perDay?: boolean; currency?: Currency },
) {
  const period = opts?.perDay ? "/օր" : opts?.perMonth ? "/ամիս" : "";
  const { symbol, rate, suffix } = currencyOption(opts?.currency ?? "USD");
  const amount = groupDigits(value * rate);
  return (suffix ? `${amount} ${symbol}` : `${symbol}${amount}`) + period;
}

export function formatNumber(value: number) {
  return groupDigits(value);
}

export function formatMileage(km: number) {
  return `${groupDigits(km)} կմ`;
}

export function formatArea(m2: number) {
  return `${groupDigits(m2)} մ²`;
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
  const { day, month } = yerevanParts(date);
  return `${MONTHS_GENITIVE[month]} ${day}`;
}

export function formatFullDate(iso: string) {
  const { day, month, year } = yerevanParts(new Date(iso));
  return `${day} ${MONTHS_GENITIVE[month]}, ${year} թ.`;
}

export function formatMonthYear(iso: string) {
  const { month, year } = yerevanParts(new Date(iso));
  return `${year} թ․ ${MONTHS_NOMINATIVE[month]}`;
}

export function formatTime(iso: string) {
  const { hour, minute } = yerevanParts(new Date(iso));
  return `${hour}:${minute}`;
}

/** Armenian doesn't inflect the count word by size like Russian does — just singular vs. plural. */
export function plural(n: number, one: string, many: string) {
  return n === 1 ? one : many;
}

export function roomsLabel(rooms: number) {
  if (rooms === 0) return "Ստուդիո";
  return `${rooms}-սենյականոց`;
}

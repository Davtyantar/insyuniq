export type Locale = "ru" | "am" | "en";

export const LOCALE_OPTIONS: { value: Locale; label: string }[] = [
  { value: "ru", label: "Ռուսերեն" },
  { value: "am", label: "Հայերեն" },
  { value: "en", label: "Անգլերեն" },
];

/** URL path prefix per locale. Armenian is the default and carries no prefix. */
export const LOCALE_PREFIXES: Record<Locale, string> = { am: "", ru: "/ru", en: "/en" };

/** Real ISO code for the <html lang> attribute — "am" is this app's own shorthand, not a language code. */
export const LOCALE_HTML_LANG: Record<Locale, string> = { am: "hy", ru: "ru", en: "en" };

const PREFIX_TO_LOCALE: Record<string, Locale> = { ru: "ru", en: "en" };

/** First path segment, e.g. "ru" from "/ru/cars" — "" for a bare "/cars" or "/". */
function firstSegment(pathname: string): string {
  return pathname.split("/")[1] ?? "";
}

/** Reads the active locale straight from a pathname — the single source of truth for "what language is this page". */
export function localeFromPathname(pathname: string): Locale {
  return PREFIX_TO_LOCALE[firstSegment(pathname)] ?? "am";
}

/** Removes a leading "/ru" or "/en" segment, if present. "/ru/cars" -> "/cars", "/ru" -> "/". */
export function stripLocalePrefix(pathname: string): string {
  const segment = firstSegment(pathname);
  if (segment !== "ru" && segment !== "en") return pathname;
  const rest = pathname.slice(segment.length + 1);
  return rest === "" ? "/" : rest;
}

/** Prepends the given locale's prefix onto an already-unprefixed internal path (may include a query string). */
export function withLocalePrefix(path: string, locale: Locale): string {
  const prefix = LOCALE_PREFIXES[locale];
  if (!prefix) return path;
  return path === "/" ? prefix : `${prefix}${path}`;
}

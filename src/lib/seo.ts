import { formatPrice } from "./format";
import { isDaily, isMonthly, locationLine } from "./specs";
import type { Listing } from "./types";

/**
 * Real production domain. Set NEXT_PUBLIC_SITE_URL in the deploy environment —
 * every canonical URL, sitemap entry, JSON-LD @id, and absolute Open Graph URL
 * is derived from this. Falls back to a placeholder so local dev still works.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://insyunik.am").replace(/\/$/, "");

export function absoluteUrl(path: string): string {
  if (path === "/" || path === "") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Truncates to `max` chars without cutting mid-word, appending an ellipsis if trimmed. */
export function truncateAtWord(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max).replace(/\s+\S*$/, "");
  return `${cut}…`;
}

/**
 * Meta description for a listing detail page: leads with the fields that
 * actually drive click-through in classifieds results — price and city —
 * then fills the remainder with the listing's own description, cut cleanly
 * at a word boundary instead of a blind character slice.
 */
export function buildListingDescription(listing: Listing): string {
  const price = formatPrice(listing.price, {
    perMonth: isMonthly(listing),
    perDay: isDaily(listing),
  });
  const lead = `${listing.title} — ${price}, ${locationLine(listing)}. `;
  const room = Math.max(40, 155 - lead.length);
  return `${lead}${truncateAtWord(listing.description, room)}`;
}

export interface Crumb {
  name: string;
  path: string;
}

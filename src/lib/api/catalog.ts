import { type Api, isUuid, unwrap } from "./client";
import type { CatalogCard, CatalogCardPage, CatalogSearchQuery } from "./types";

/** The contract caps `ids` at 50 per request. */
export const CATALOG_IDS_LIMIT = 50;

export async function searchCatalog(
  api: Api,
  query: CatalogSearchQuery,
  signal?: AbortSignal,
): Promise<CatalogCardPage> {
  return unwrap(await api.GET("/v1/catalog/listings", { params: { query }, signal }));
}

export async function getRecentListings(api: Api, limit = 12): Promise<CatalogCard[]> {
  return unwrap(await api.GET("/v1/catalog/listings/recent", { params: { query: { limit } } }));
}

/** Active listings for the given ids, in API order. Non-UUID ids (mock listings) are skipped;
 * unknown or inactive ids are simply absent from the result. */
export async function getCatalogByIds(api: Api, ids: string[]): Promise<CatalogCard[]> {
  const uuids = ids.filter(isUuid);
  const chunks: string[][] = [];
  for (let i = 0; i < uuids.length; i += CATALOG_IDS_LIMIT) chunks.push(uuids.slice(i, i + CATALOG_IDS_LIMIT));
  const pages = await Promise.all(
    chunks.map((chunk) => searchCatalog(api, { ids: chunk.join(","), pageSize: CATALOG_IDS_LIMIT })),
  );
  return pages.flatMap((page) => page.items);
}

/** Every active listing, for the sitemap. Capped at `maxPages` (500 × 100 = the 50,000-URL
 * limit of one sitemap file) so a malformed response can never loop forever; past that the
 * sitemap becomes an index (SEO_BACKEND_REQUIREMENTS §4). */
export async function getAllActiveCards(api: Api, pageSize = 100, maxPages = 500): Promise<CatalogCard[]> {
  const cards: CatalogCard[] = [];
  for (let page = 1; page <= maxPages; page += 1) {
    const result = await searchCatalog(api, { page, pageSize, sort: "date-desc" });
    cards.push(...result.items);
    if (result.items.length === 0 || cards.length >= result.total) break;
  }
  return cards;
}

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

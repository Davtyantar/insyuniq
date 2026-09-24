import { type Api, isUuid, unwrap } from "./client";
import { toApiError } from "./errors";
import type {
  Facets,
  PropertyFacetQuery,
  PropertyListing,
  PropertyListingPage,
  PropertySearchQuery,
} from "./types";

/** A 404 is only "this listing/id doesn't exist" when the problem code says so; any other 404
 * (a proxy error page, a misrouted request, …) must still surface as an ApiError. */
function isNotFoundProblem(status: number, error: unknown): boolean {
  return status === 404 && toApiError(status, error).code.endsWith(".not-found");
}

export async function searchProperty(
  api: Api,
  query: PropertySearchQuery,
  signal?: AbortSignal,
): Promise<PropertyListingPage> {
  return unwrap(await api.GET("/v1/property/listings", { params: { query }, signal }));
}

export async function getPropertyFacets(api: Api, query: PropertyFacetQuery): Promise<Facets> {
  return unwrap(await api.GET("/v1/property/listings/facets", { params: { query } }));
}

/** Null when the id is not a UUID or the listing is missing or inactive (the API's 404). */
export async function getPropertyListing(api: Api, id: string): Promise<PropertyListing | null> {
  if (!isUuid(id)) return null;
  const result = await api.GET("/v1/property/listings/{id}", { params: { path: { id } } });
  if (isNotFoundProblem(result.response.status, result.error)) return null;
  return unwrap(result);
}

/** Empty when the id is not a UUID (never reaches the API) or the anchor listing is gone. */
export async function getSimilarProperty(api: Api, id: string, limit = 8): Promise<PropertyListing[]> {
  if (!isUuid(id)) return [];
  const result = await api.GET("/v1/property/listings/{id}/similar", {
    params: { path: { id }, query: { limit } },
  });
  if (isNotFoundProblem(result.response.status, result.error)) return [];
  return unwrap(result);
}

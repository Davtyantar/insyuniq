import { type Api, isUuid, unwrap } from "./client";
import type {
  Facets,
  PropertyFacetQuery,
  PropertyListing,
  PropertyListingPage,
  PropertySearchQuery,
} from "./types";

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
  if (result.response.status === 404) return null;
  return unwrap(result);
}

export async function getSimilarProperty(api: Api, id: string, limit = 8): Promise<PropertyListing[]> {
  const result = await api.GET("/v1/property/listings/{id}/similar", {
    params: { path: { id }, query: { limit } },
  });
  if (result.response.status === 404) return [];
  return unwrap(result);
}

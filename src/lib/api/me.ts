import { type Api, unwrap } from "./client";
import { toApiError } from "./errors";
import type { CatalogCardPage, MyListingsQuery, PutMyProfileRequest, SellerProfile } from "./types";

/** Null when the signed-in user has no seller profile yet; any other failure throws. */
export async function getMyProfile(api: Api): Promise<SellerProfile | null> {
  const result = await api.GET("/v1/me/profile", {});
  if (result.response.status === 404 && toApiError(404, result.error).code.endsWith(".not-found")) return null;
  return unwrap(result);
}

/** A full replace: every field, including avatarPath, must be sent (see avatarPathOf). */
export async function putMyProfile(api: Api, body: PutMyProfileRequest): Promise<SellerProfile> {
  return unwrap(await api.PUT("/v1/me/profile", { body }));
}

/** Every status by default (drafts, archived and closed included), newest first. */
export async function getMyListings(api: Api, query: MyListingsQuery = {}): Promise<CatalogCardPage> {
  return unwrap(await api.GET("/v1/me/listings", { params: { query } }));
}

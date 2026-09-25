import { type Api, unwrap } from "./client";
import { toApiError } from "./errors";
import type { CreateUploadUrlRequest, CreateUploadUrlResponse } from "./types";

/** The contract's CreateUploadUrlRequest limits. */
export const UPLOAD_MAX_BYTES = 10_485_760;
const UPLOAD_TYPES: readonly CreateUploadUrlRequest["contentType"][] = ["image/jpeg", "image/png", "image/webp"];

export function isUploadableImage(file: { type: string; size: number }): boolean {
  return (UPLOAD_TYPES as readonly string[]).includes(file.type) && file.size > 0 && file.size <= UPLOAD_MAX_BYTES;
}

export async function createUploadUrl(api: Api, body: CreateUploadUrlRequest): Promise<CreateUploadUrlResponse> {
  return unwrap(await api.POST("/v1/media/upload-url", { body }));
}

/** Sends the bytes straight to Supabase Storage; they never pass through the API (ADR 0001). */
export async function uploadToSignedUrl(uploadUrl: string, file: Blob, fetchImpl: typeof fetch = fetch): Promise<void> {
  const response = await fetchImpl(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
  if (!response.ok) throw toApiError(response.status, await response.json().catch(() => undefined));
}

/** Ticket, then upload. Returns the Storage object path a create or profile request refers to. */
export async function uploadImage(
  api: Api,
  file: File,
  purpose: "listing" | "avatar" = "listing",
  fetchImpl?: typeof fetch,
): Promise<string> {
  const ticket = await createUploadUrl(api, {
    fileName: file.name.slice(-200) || "photo",
    contentType: file.type as CreateUploadUrlRequest["contentType"],
    sizeBytes: file.size,
    purpose,
  });
  await uploadToSignedUrl(ticket.uploadUrl, file, fetchImpl);
  return ticket.objectPath;
}

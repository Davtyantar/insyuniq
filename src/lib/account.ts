import type { SellerProfile } from "@/lib/api/types";
import { formatPhone } from "@/lib/detail";

export { isProtectedPath, safeNextPath } from "@/lib/auth-routes";

/** What the header, menu, profile and wizard show about the signed-in person. */
export interface AuthUser {
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  registeredAt: string;
}

/** "+374 77 10 20 30", "077102030", "37477102030" → "+37477102030" (the contract's
 * PutMyProfileRequest.phone pattern). Anything else → null. */
export function normalizeArmenianPhone(input: string): string | null {
  const match = /^(?:\+?374|0)(\d{8})$/.exec(input.replace(/[\s()-]/g, ""));
  return match ? `+374${match[1]}` : null;
}

export function toAuthUser(
  account: { email?: string; createdAt: string; metadataName?: string },
  profile: SellerProfile | null,
): AuthUser {
  return {
    name: profile?.name ?? account.metadataName ?? account.email?.split("@")[0] ?? "",
    phone: profile ? formatPhone(profile.phone) : "",
    email: account.email,
    avatar: profile?.avatarUrl,
    registeredAt: profile?.memberSince ?? account.createdAt,
  };
}

/** Sign-up stores name and phone in Supabase user metadata until the seller profile exists, so
 * the profile can be created on first sign-in when email confirmation delays the session. */
export interface PendingProfile {
  name: string;
  phone: string;
}

export function pendingProfileOf(metadata: unknown): PendingProfile | null {
  if (typeof metadata !== "object" || metadata === null) return null;
  const { name, phone } = metadata as Record<string, unknown>;
  if (typeof name !== "string" || typeof phone !== "string") return null;
  const trimmed = name.trim();
  const normalized = normalizeArmenianPhone(phone);
  return trimmed.length >= 2 && normalized ? { name: trimmed, phone: normalized } : null;
}

export type AuthErrorCode =
  | "not-configured"
  | "invalid-credentials"
  | "email-taken"
  | "weak-password"
  | "invalid-phone"
  | "rate-limited"
  | "network"
  | "unknown";

export function authErrorOf(error: { code?: string; status?: number } | null | undefined): AuthErrorCode {
  switch (error?.code) {
    case "invalid_credentials":
      return "invalid-credentials";
    case "user_already_exists":
    case "email_exists":
      return "email-taken";
    case "weak_password":
      return "weak-password";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "rate-limited";
    default:
      return !error?.status ? "network" : "unknown";
  }
}

/** PUT /v1/me/profile replaces the profile, so keeping an avatar means sending its Storage
 * path back; the API only returns the public URL. */
export function avatarPathOf(url: string | undefined): string | undefined {
  const tail = url?.split("/storage/v1/object/public/")[1];
  const path = tail?.split("/").slice(1).join("/");
  return path || undefined;
}

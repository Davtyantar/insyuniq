import { describe, expect, it } from "vitest";
import {
  authErrorOf,
  avatarPathOf,
  isProtectedPath,
  normalizeArmenianPhone,
  pendingProfileOf,
  safeNextPath,
  toAuthUser,
} from "./account";
import { PROPERTY_FIXTURE } from "@/test/fixtures";

const profile = { ...PROPERTY_FIXTURE.seller!, avatarUrl: "http://127.0.0.1:55521/storage/v1/object/public/listing-images/u1/a.jpg" };

describe("normalizeArmenianPhone", () => {
  it("accepts the grouped, national and international forms", () => {
    expect(normalizeArmenianPhone("+374 77 10 20 30")).toBe("+37477102030");
    expect(normalizeArmenianPhone("077-10-20-30")).toBe("+37477102030");
    expect(normalizeArmenianPhone("37477102030")).toBe("+37477102030");
  });

  it("rejects anything else", () => {
    expect(normalizeArmenianPhone("+1 555 0100")).toBeNull();
    expect(normalizeArmenianPhone("+374 77 10 20")).toBeNull();
  });
});

describe("routing guards", () => {
  it("protects create and profile, with or without a locale prefix", () => {
    expect(isProtectedPath("/create")).toBe(true);
    expect(isProtectedPath("/ru/profile")).toBe(true);
    expect(isProtectedPath("/profile/extra")).toBe(true);
    expect(isProtectedPath("/profiles")).toBe(false);
    expect(isProtectedPath("/real-estate")).toBe(false);
  });

  it("keeps ?next= on this site", () => {
    expect(safeNextPath("/create?edit=1")).toBe("/create?edit=1");
    expect(safeNextPath("//evil.example")).toBe("/profile");
    expect(safeNextPath("https://evil.example")).toBe("/profile");
    expect(safeNextPath("/\\evil.example")).toBe("/profile");
    expect(safeNextPath(null, "/")).toBe("/");
    expect(safeNextPath("/\t/evil.example")).toBe("/profile");
    expect(safeNextPath("/\n/evil.example")).toBe("/profile");
    expect(safeNextPath("/%2F%2Fevil.example")).toBe("/%2F%2Fevil.example");
    expect(safeNextPath("/ru/create?x=1#top")).toBe("/ru/create?x=1#top");
  });
});

describe("toAuthUser", () => {
  it("prefers the seller profile and formats its phone", () => {
    const user = toAuthUser({ email: "a@b.am", createdAt: "2026-01-01T00:00:00Z" }, profile);
    expect(user).toEqual({
      name: profile.name,
      phone: "+374 91 45 22 18",
      email: "a@b.am",
      avatar: profile.avatarUrl,
      registeredAt: profile.memberSince,
    });
  });

  it("falls back to sign-up metadata, then the email's local part", () => {
    expect(toAuthUser({ email: "anna@b.am", createdAt: "2026-01-01T00:00:00Z", metadataName: "Աննա" }, null).name).toBe("Աննա");
    expect(toAuthUser({ email: "anna@b.am", createdAt: "2026-01-01T00:00:00Z" }, null).name).toBe("anna");
  });
});

describe("pendingProfileOf", () => {
  it("reads name and a valid phone from sign-up metadata", () => {
    expect(pendingProfileOf({ name: " Աննա ", phone: "+37477102030" })).toEqual({ name: "Աննա", phone: "+37477102030" });
    expect(pendingProfileOf({ name: "A", phone: "+37477102030" })).toBeNull();
    expect(pendingProfileOf({ name: "Աննա" })).toBeNull();
    expect(pendingProfileOf(undefined)).toBeNull();
  });
});

describe("authErrorOf", () => {
  it("maps Supabase error codes", () => {
    expect(authErrorOf({ code: "invalid_credentials", status: 400 })).toBe("invalid-credentials");
    expect(authErrorOf({ code: "user_already_exists", status: 422 })).toBe("email-taken");
    expect(authErrorOf({ code: "weak_password", status: 422 })).toBe("weak-password");
    expect(authErrorOf({ code: "over_request_rate_limit", status: 429 })).toBe("rate-limited");
    expect(authErrorOf({ status: 0 })).toBe("network");
    expect(authErrorOf({ code: "something_new", status: 500 })).toBe("unknown");
  });
});

describe("avatarPathOf", () => {
  it("recovers the Storage object path the API needs to keep an avatar", () => {
    expect(avatarPathOf(profile.avatarUrl)).toBe("u1/a.jpg");
    expect(avatarPathOf("https://i.pravatar.cc/150")).toBeUndefined();
    expect(avatarPathOf(undefined)).toBeUndefined();
  });
});

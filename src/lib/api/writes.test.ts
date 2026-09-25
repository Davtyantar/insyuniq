import { describe, expect, it } from "vitest";
import { createApi } from "./client";
import { ApiError } from "./errors";
import { getMyListings, getMyProfile, putMyProfile } from "./me";
import { isUploadableImage, uploadImage, uploadToSignedUrl } from "./media";
import { createPropertyListing } from "./property";
import { PROPERTY_FIXTURE } from "@/test/fixtures";

interface Seen {
  method: string;
  url: URL;
  body: string;
  contentType: string | null;
}

function routeFetch(route: (method: string, url: URL) => { status: number; body: unknown }, seen: Seen[]) {
  return (async (input: Request | string, init?: RequestInit) => {
    const request = typeof input === "string" ? new Request(input, init) : input;
    const url = new URL(request.url);
    seen.push({ method: request.method, url, body: await request.clone().text(), contentType: request.headers.get("content-type") });
    const { status, body } = route(request.method, url);
    return new Response(typeof body === "string" ? body : JSON.stringify(body), {
      status,
      headers: { "content-type": status < 300 ? "application/json" : "application/problem+json" },
    });
  }) as unknown as typeof fetch;
}

const profile = PROPERTY_FIXTURE.seller!;

describe("me", () => {
  it("returns null only when the profile does not exist yet", async () => {
    const missing = { type: "urn:insyunik:error:sellers.not-found", title: "Not found", status: 404 };
    const api = createApi({ token: "t", fetch: routeFetch(() => ({ status: 404, body: missing }), []) });
    expect(await getMyProfile(api)).toBeNull();
    const broken = createApi({ token: "t", fetch: routeFetch(() => ({ status: 404, body: "Not Found" }), []) });
    await expect(getMyProfile(broken)).rejects.toBeInstanceOf(ApiError);
  });

  it("PUTs the whole profile and reads my listings with a status filter", async () => {
    const seen: Seen[] = [];
    const api = createApi({
      token: "t",
      fetch: routeFetch((method) => ({ status: 200, body: method === "PUT" ? profile : { items: [], page: 1, pageSize: 24, total: 0 } }), seen),
    });
    const body = { name: "Աննա", type: "private" as const, phone: "+37477102030", hasWhatsApp: false, hasTelegram: false, hasViber: false };
    await putMyProfile(api, body);
    await getMyListings(api, { status: "active" });
    expect(seen[0].method).toBe("PUT");
    expect(JSON.parse(seen[0].body)).toEqual(body);
    expect(seen[1].url.pathname).toBe("/v1/me/listings");
    expect(seen[1].url.searchParams.get("status")).toBe("active");
  });
});

describe("media", () => {
  it("accepts only the contract's image types up to 10 MiB", () => {
    expect(isUploadableImage({ type: "image/jpeg", size: 1000 })).toBe(true);
    expect(isUploadableImage({ type: "image/heic", size: 1000 })).toBe(false);
    expect(isUploadableImage({ type: "image/png", size: 10_485_761 })).toBe(false);
  });

  it("gets a ticket from the API, then PUTs the bytes to Storage, never to the API", async () => {
    const seen: Seen[] = [];
    const ticket = {
      uploadUrl: "http://storage.test/storage/v1/object/upload/sign/listing-images/u1/x.jpg?token=abc",
      token: "abc",
      objectPath: "u1/x.jpg",
      method: "PUT",
      expiresAt: "2026-09-24T12:00:00Z",
    };
    const fetchImpl = routeFetch((method, url) => ({ status: 200, body: url.host === "storage.test" ? { Key: "x" } : ticket }), seen);
    const api = createApi({ token: "t", fetch: fetchImpl });
    const file = new File([new Uint8Array([255, 216, 255])], "Կապան.jpg", { type: "image/jpeg" });
    expect(await uploadImage(api, file, "listing", fetchImpl)).toBe("u1/x.jpg");
    expect(seen.map((s) => `${s.method} ${s.url.host}${s.url.pathname}`)).toEqual([
      "POST localhost:5080/v1/media/upload-url",
      "PUT storage.test/storage/v1/object/upload/sign/listing-images/u1/x.jpg",
    ]);
    expect(JSON.parse(seen[0].body)).toEqual({ fileName: "Կապան.jpg", contentType: "image/jpeg", sizeBytes: 3, purpose: "listing" });
    expect(seen[1].contentType).toBe("image/jpeg");
  });

  it("turns a failed Storage upload into an ApiError", async () => {
    const fetchImpl = routeFetch(() => ({ status: 400, body: { statusCode: "400", error: "InvalidJWT", message: "exp" } }), []);
    await expect(uploadToSignedUrl("http://storage.test/x", new Blob(["x"]), fetchImpl)).rejects.toBeInstanceOf(ApiError);
  });
});

describe("createPropertyListing", () => {
  it("POSTs the request and returns the created listing", async () => {
    const seen: Seen[] = [];
    const api = createApi({ token: "t", fetch: routeFetch(() => ({ status: 201, body: PROPERTY_FIXTURE }), seen) });
    const created = await createPropertyListing(api, {
      subcategory: "apartments",
      deal: "rent",
      title: "Բնակարան",
      description: "Լուսավոր",
      price: { amount: 300, currency: "USD", period: "month", negotiable: false },
      city: "kapan",
      images: ["u1/x.jpg"],
    });
    expect(created.id).toBe(PROPERTY_FIXTURE.id);
    expect(seen[0].method).toBe("POST");
    expect(seen[0].url.pathname).toBe("/v1/property/listings");
  });
});

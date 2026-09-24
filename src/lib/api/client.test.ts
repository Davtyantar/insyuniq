import { afterEach, describe, expect, it, vi } from "vitest";
import { apiBaseUrl, createApi, isUuid, unwrap } from "./client";
import { ApiError, toApiError } from "./errors";

const ID = "947e6113-f009-5717-a2f7-97b482ec8acf";

function fakeFetch(status: number, body: unknown, seen: Request[] = []) {
  return (async (request: Request) => {
    seen.push(request);
    const type = status < 300 ? "application/json" : "application/problem+json";
    return new Response(JSON.stringify(body), { status, headers: { "content-type": type } });
  }) as unknown as typeof fetch;
}

afterEach(() => vi.unstubAllEnvs());

describe("apiBaseUrl", () => {
  it("defaults to the local API", () => {
    vi.stubEnv("API_URL", "");
    vi.stubEnv("NEXT_PUBLIC_API_URL", "");
    expect(apiBaseUrl()).toBe("http://localhost:5080");
  });

  it("prefers API_URL on the server and trims a trailing slash", () => {
    vi.stubEnv("API_URL", "http://api.internal:8080/");
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.insyunik.am");
    expect(apiBaseUrl()).toBe("http://api.internal:8080");
  });

  it("throws in production instead of silently falling back to localhost", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("API_URL", "");
    vi.stubEnv("NEXT_PUBLIC_API_URL", "");
    expect(() => apiBaseUrl()).toThrow("NEXT_PUBLIC_API_URL is not set");
  });
});

describe("createApi", () => {
  it("sends the bearer token only when one is given", async () => {
    const seen: Request[] = [];
    await createApi({ token: "t0k", fetch: fakeFetch(200, {}, seen) }).GET("/v1/property/listings/{id}", {
      params: { path: { id: ID } },
    });
    await createApi({ fetch: fakeFetch(200, {}, seen) }).GET("/v1/property/listings/{id}", {
      params: { path: { id: ID } },
    });
    expect(seen[0].headers.get("authorization")).toBe("Bearer t0k");
    expect(seen[1].headers.get("authorization")).toBeNull();
  });

  it("serialises the query, dropping undefined values", async () => {
    const seen: Request[] = [];
    await createApi({ fetch: fakeFetch(200, { items: [], page: 2, pageSize: 12, total: 0 }, seen) }).GET(
      "/v1/property/listings",
      { params: { query: { city: "kapan,goris", page: 2, q: undefined } } },
    );
    const url = new URL(seen[0].url);
    expect(url.searchParams.get("city")).toBe("kapan,goris");
    expect(url.searchParams.get("page")).toBe("2");
    expect(url.searchParams.has("q")).toBe(false);
  });
});

describe("unwrap", () => {
  it("returns data on success", async () => {
    const page = { items: [], page: 1, pageSize: 12, total: 0 };
    const result = await createApi({ fetch: fakeFetch(200, page) }).GET("/v1/property/listings", {});
    expect(unwrap(result)).toEqual(page);
  });

  it("throws ApiError with the problem's code and field errors", async () => {
    const problem = { type: "urn:insyunik:error:validation", title: "Invalid", status: 400, errors: { rooms: ["bad"] } };
    const result = await createApi({ fetch: fakeFetch(400, problem) }).GET("/v1/property/listings", {});
    try {
      unwrap(result);
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(400);
      expect((error as ApiError).code).toBe("validation");
      expect((error as ApiError).errors).toEqual({ rooms: ["bad"] });
    }
  });
});

describe("toApiError", () => {
  it("tolerates a body that is not a problem document", () => {
    const error = toApiError(502, "Bad Gateway");
    expect(error.type).toBe("about:blank");
    expect(error.title).toBe("HTTP 502");
    expect(error.errors).toEqual({});
  });
});

describe("isUuid", () => {
  it("accepts UUIDs and rejects mock ids", () => {
    expect(isUuid(ID)).toBe(true);
    expect(isUuid("re-1")).toBe(false);
  });
});

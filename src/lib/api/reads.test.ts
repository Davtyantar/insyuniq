import { describe, expect, it } from "vitest";
import { getCatalogByIds, getAllActiveCards } from "./catalog";
import { createApi } from "./client";
import { getPropertyListing, getSimilarProperty } from "./property";

const ID = "947e6113-f009-5717-a2f7-97b482ec8acf";

function recordingFetch(respond: (url: URL) => { status: number; body: unknown }, seen: URL[]) {
  return (async (request: Request) => {
    const url = new URL(request.url);
    seen.push(url);
    const { status, body } = respond(url);
    return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  }) as unknown as typeof fetch;
}

const notFound = { type: "urn:insyunik:error:property.not-found", title: "Not found", status: 404 };

describe("getPropertyListing", () => {
  it("returns null on 404 and never calls the API for a mock id", async () => {
    const seen: URL[] = [];
    const api = createApi({ fetch: recordingFetch(() => ({ status: 404, body: notFound }), seen) });
    expect(await getPropertyListing(api, ID)).toBeNull();
    expect(await getPropertyListing(api, "re-1")).toBeNull();
    expect(seen).toHaveLength(1);
  });
});

describe("getSimilarProperty", () => {
  it("returns an empty list when the anchor is gone", async () => {
    const api = createApi({ fetch: recordingFetch(() => ({ status: 404, body: notFound }), []) });
    expect(await getSimilarProperty(api, ID)).toEqual([]);
  });
});

describe("getCatalogByIds", () => {
  it("sends only UUIDs, 50 per request, and concatenates the pages", async () => {
    const ids = Array.from({ length: 120 }, (_, i) => `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`);
    const seen: URL[] = [];
    const api = createApi({
      fetch: recordingFetch((url) => {
        const chunk = (url.searchParams.get("ids") ?? "").split(",");
        return { status: 200, body: { items: chunk.map((id) => ({ id })), page: 1, pageSize: 50, total: chunk.length } };
      }, seen),
    });
    const cards = await getCatalogByIds(api, ["car-3", ...ids]);
    expect(seen.map((u) => u.searchParams.get("ids")?.split(",").length)).toEqual([50, 50, 20]);
    expect(seen.every((u) => u.searchParams.get("pageSize") === "50")).toBe(true);
    expect(cards).toHaveLength(120);
  });

  it("makes no request for an empty list", async () => {
    const seen: URL[] = [];
    const api = createApi({ fetch: recordingFetch(() => ({ status: 200, body: {} }), seen) });
    expect(await getCatalogByIds(api, ["re-1"])).toEqual([]);
    expect(seen).toHaveLength(0);
  });
});

describe("getAllActiveCards", () => {
  it("pages until total is reached", async () => {
    const seen: URL[] = [];
    const api = createApi({
      fetch: recordingFetch((url) => {
        const page = Number(url.searchParams.get("page") ?? "1");
        const items = page < 3 ? [{ id: `p${page}a` }, { id: `p${page}b` }] : [{ id: "p3a" }];
        return { status: 200, body: { items, page, pageSize: 2, total: 5 } };
      }, seen),
    });
    const cards = await getAllActiveCards(api, 2);
    expect(cards.map((c) => c.id)).toEqual(["p1a", "p1b", "p2a", "p2b", "p3a"]);
    expect(seen).toHaveLength(3);
  });

  it("stops on an empty first page", async () => {
    const seen: URL[] = [];
    const api = createApi({ fetch: recordingFetch(() => ({ status: 200, body: { items: [], page: 1, pageSize: 2, total: 0 } }), seen) });
    expect(await getAllActiveCards(api, 2)).toEqual([]);
    expect(seen).toHaveLength(1);
  });

  it("stops at maxPages when the API never reaches its total", async () => {
    const seen: URL[] = [];
    const api = createApi({
      fetch: recordingFetch(() => ({ status: 200, body: { items: [{ id: "x" }], page: 1, pageSize: 1, total: 1_000_000 } }), seen),
    });
    expect(await getAllActiveCards(api, 1, 3)).toHaveLength(3);
    expect(seen).toHaveLength(3);
  });
});

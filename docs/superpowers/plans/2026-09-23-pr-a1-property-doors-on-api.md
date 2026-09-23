# PR A1: Property Doors on the API — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The three property doors (`/real-estate`, `/rentals`, `/hotels`), their detail pages, the home page's property sections, search, favorites, header suggestions and the sitemap read listings from InSyunik-Api contract v0.3.0 instead of `src/mock/*`, while `/cars`, `/work` and `/services` keep working on mock data.

**Architecture:** A contract vendored into the repo generates `src/lib/api/schema.ts` (types plus runtime enum arrays). A thin isomorphic client (`openapi-fetch` plus an `ApiError` for RFC 9457 problems) sits under per-tag read functions. Server Components fetch per request and hand typed data to client islands. Two view models, `CardModel` and `DetailModel`, let one card and one detail component render both API listings and the not-yet-ported mock listings.

**Tech Stack:** Next 14.2 App Router, React 18.3, TypeScript 6, Tailwind 3.4, openapi-typescript 7.13 + openapi-fetch 0.17, Vitest 5.

**Spec:** `docs/superpowers/specs/2026-09-23-api-integration-design.md`. Decision record: `docs/superpowers/research/2026-09-23-approaches-and-design-system.md`.

## Global Constraints

- No framework upgrades: Next stays 14.2, React 18.3, Tailwind 3.4, TypeScript 6. `@types/react` and `@types/react-dom` move to `^18` to match React (Task 1).
- No new UI library in this PR (decision D1). Reuse `src/components/ui/*` and `src/components/filters/filter-fields.tsx` primitives.
- The contract is vendored at `contract/openapi.yaml`, version `0.3.0`, copied from `InSyunik-Api` `origin/main`. `src/lib/api/schema.ts` is generated, committed, never hand-edited, and excluded from ESLint.
- Every closed value set (cities, districts, subcategories, deals, conditions, rooms, sorts, currencies) comes from the generated `*Values` arrays or types. Never hand-write a contract enum.
- `src/lib/api/*` is isomorphic: no `server-only`, no `next/headers`, no `window` access at module scope.
- Every route that calls the API declares `export const dynamic = "force-dynamic"`, so `npm run build` succeeds with the API stopped.
- Base URL: `API_URL` (server only), then `NEXT_PUBLIC_API_URL`, then `http://localhost:5080`, trailing slash trimmed.
- `/cars`, `/work`, `/services`, their detail pages, the wizard, sign-in, sign-up and profile behave exactly as before. The AppProvider keeps storing the selected city as its Armenian name.
- UI copy stays Armenian literals in the existing style of each file.
- Gate before every commit: `npm run typecheck && npm run lint && npm test`. Final gate adds `npm run build`.
- Commits are Conventional Commits and end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Deviations from the spec

Each is a refinement found while planning against the code on 2026-09-23. The spec stays the source of intent; these override its letter for this PR.

| Spec | This plan | Reason |
| --- | --- | --- |
| 7: web PR A includes auth and profile; property create is PR B | PR A splits into A1 (this plan, read-only) and A2 (auth, profile, property create) | `createPropertyListing`, `createUploadUrl`, `getMyListings` and `putMyProfile` all exist in v0.3.0; only edit and archive need v0.4.0. Smaller reviewable PRs. |
| 4.1: `src/lib/api/schema.d.ts`, types only | `src/lib/api/schema.ts` generated with `--enum-values` | Runtime arrays for cities, districts and every closed set, so the web hand-writes none of them. |
| 4.2: hand-written `apiFetch<T>` | `openapi-fetch` 0.17 wrapped by `createApi` and `unwrap` | Path- and parameter-typed calls for about 6 kB; behaviour verified in a spike (decision record §4). |
| 4.3: components consume contract shapes directly | Pages and mappers consume contract shapes; the card and detail components render `CardModel` and `DetailModel` | One card and one detail component must render API and mock listings until PR E. The spec already fixed one card shape (4.7); `DetailModel` applies the same rule to the detail page. |
| 4.6: the header location picker stores a slug | The picker keeps storing the Armenian name; `citySlugOf` converts at the API boundary | The picker, promo banner and city accent all key on the Armenian name; converting them is a separate cleanup. |
| 4.7: sitemap cached for one hour | Sitemap is `force-dynamic` | A cached route is prerendered at build time, which would make `npm run build` need a running API. |
| 5: `error.tsx` per route group | One `src/app/error.tsx` | App Router applies the nearest boundary; no route group needs different copy yet. |

## Preconditions

1. `InSyunik-Api` PR 1 (`feat/prototype-gaps`, contract v0.3.0) is merged to `origin/main`. Check: `git -C ../InSyunik-Api fetch origin && git -C ../InSyunik-Api show origin/main:contract/openapi.yaml | grep -m1 'version: 0.3.0'` prints a line.
2. A local API with seed data, for Tasks 7 to 12 only:

```bash
cd ../InSyunik-Api && docker compose up -d
```

```bash
cd ../InSyunik-Api && dotnet run --project src/InSyunik.Api -- migrate && dotnet run --project src/InSyunik.Api -- seed
```

```bash
cd ../InSyunik-Api && Cors__AllowedOrigins=http://localhost:3000 dotnet run --project src/InSyunik.Api
```

Check: `curl -s 'http://localhost:5080/v1/property/listings?deal=sale&pageSize=1' | head -c 200` shows JSON with `"total":15`.

3. Work on branch `feat/api-client` (it already holds the spec and this plan). `npm ci` has been run.

## File Map

| File | Status | Responsibility |
| --- | --- | --- |
| `contract/openapi.yaml` | create | Vendored contract v0.3.0 |
| `scripts/contract-check.mjs` | create | Fails when the YAML version or generated schema drifts |
| `vitest.config.mts` | create | Node-environment unit tests with the `@/` alias |
| `src/lib/api/schema.ts` | generated | Contract types and `*Values` enum arrays |
| `src/lib/api/types.ts` | create | Named re-exports of contract types used by the app |
| `src/lib/api/errors.ts` | create | `ApiError`, `toApiError` |
| `src/lib/api/client.ts` | create | `apiBaseUrl`, `createApi`, `unwrap`, `isUuid` |
| `src/lib/api/property.ts` | create | Property read functions |
| `src/lib/api/catalog.ts` | create | Catalog read functions |
| `src/lib/money.ts` | create | `Money` display: conversion, amount, period |
| `src/lib/geo.ts` | create | City and district labels, `districtsOf`, slug helpers |
| `src/lib/property-doors.ts` | create | Door → deal preset, subcategory tabs, `propertyHref` |
| `src/lib/property-filters.ts` | create | URL ⇄ filter state ⇄ API query for property doors |
| `src/lib/property-format.ts` | create | Property summary line, badges, chips, spec rows |
| `src/lib/card.ts` | create | `CardModel` and its three mappers, `sortCards` |
| `src/lib/detail.ts` | create | `DetailModel` and its two mappers |
| `src/lib/seo.ts` | modify | `buildDescription` shared by legacy and property |
| `src/lib/structured-data.ts` | modify | `categoryItemListJsonLd` takes cards; `propertyListingJsonLd` |
| `src/lib/currency.ts` | modify | `DISPLAY_CURRENCIES` (USD, AMD) |
| `src/lib/categories.ts` | modify | `source: "api" \| "mock"` per door |
| `src/components/listings/listing-card.tsx`, `listing-grid.tsx` | modify | Render `CardModel` |
| `src/components/listing/listing-details.tsx`, `price-tag.tsx`, `seller-card.tsx`, `mobile-contact-bar.tsx` | modify | Render `DetailModel` |
| `src/components/listing/property-detail-page.tsx` | create | Server loader, metadata and page for property detail routes |
| `src/components/category/property-category-page.tsx` | create | Client island for property doors |
| `src/components/filters/property-filters.tsx` | create | Filter fields for the three property doors |
| `src/components/filters/filter-panel.tsx`, `filter-drawer.tsx` | modify | Accept a `renderFields` source |
| `src/components/listings/use-favorite-cards.ts` | create | Favorites → cards across API and mock |
| `src/app/{real-estate,rentals,hotels}/page.tsx`, `[id]/page.tsx` | modify | Server fetch per request |
| `src/app/page.tsx`, `src/app/sitemap.ts`, `src/app/error.tsx` | modify / create | Home, sitemap, error boundary |
| `src/components/search/search-results.tsx`, `search-bar.tsx`, `src/components/account/favorites-view.tsx`, `profile-view.tsx`, `src/components/home/*` | modify | Consume cards |
| `scripts/smoke-api.mjs` | create | Hits every migrated route against a running app |

---

### Task 1: Toolchain — React 18 types, Vitest, vendored contract, generated schema

**Files:**
- Modify: `package.json`, `package-lock.json`, `.eslintrc.json`, `.env.example`
- Create: `vitest.config.mts`, `scripts/contract-check.mjs`, `contract/openapi.yaml`, `src/lib/api/schema.ts` (generated)
- Test: `src/lib/api/schema.test.ts`

**Interfaces:**
- Produces: npm scripts `test`, `api:types`, `contract:check`, and `typecheck` (now runs `contract:check` first); `package.json` field `contractVersion: "0.3.0"`; module `@/lib/api/schema` exporting `paths`, `components`, `operations` and arrays such as `cityValues`, `districtValues`, `propertySubcategoryValues`, `dealValues`, `propertyConditionValues`, `roomsOptionValues`, `buildingTypeValues`, `propertySortKeyValues`, `currencyValues`.

- [ ] **Step 1: Add the override and scripts to `package.json`**

The override must exist before installing, or npm refuses `openapi-typescript` (it declares a TypeScript 5 peer; the repo is on 6, verified to work). Add these top-level keys and scripts, leaving every other entry untouched:

```json
{
  "contractVersion": "0.3.0",
  "scripts": {
    "typecheck": "npm run contract:check && tsc --noEmit",
    "test": "vitest run",
    "api:types": "openapi-typescript contract/openapi.yaml -o src/lib/api/schema.ts --enum-values",
    "contract:check": "node scripts/contract-check.mjs"
  },
  "overrides": {
    "openapi-typescript": { "typescript": "$typescript" }
  }
}
```

- [ ] **Step 2: Install**

```bash
npm i openapi-fetch@0.17.0 && npm i -D openapi-typescript@7.13.0 vitest@^5.0.1 vite@^7 @types/react@^18.3.12 @types/react-dom@^18.3.1
```

Expected: `added … packages`, no `ERESOLVE`.

- [ ] **Step 3: Configure Vitest, ESLint and env docs**

`vitest.config.mts`:

```ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { environment: "node", include: ["src/**/*.test.ts"] },
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
});
```

`.eslintrc.json`:

```json
{ "extends": "next/core-web-vitals", "ignorePatterns": ["src/lib/api/schema.ts"] }
```

Append to `.env.example`:

```bash
# InSyunik-Api as the browser sees it. Local default: http://localhost:5080
NEXT_PUBLIC_API_URL=http://localhost:5080
# Optional: the API as the Next server sees it (an internal address). Falls back to NEXT_PUBLIC_API_URL.
# API_URL=
```

- [ ] **Step 4: Write the failing test** — `src/lib/api/schema.test.ts`

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { cityValues, districtValues } from "./schema";

describe("vendored contract", () => {
  it("pins the version package.json declares", () => {
    const yaml = readFileSync("contract/openapi.yaml", "utf8");
    const pkg = JSON.parse(readFileSync("package.json", "utf8")) as { contractVersion: string };
    expect(/^ {2}version: (\S+)$/m.exec(yaml)?.[1]).toBe(pkg.contractVersion);
  });

  it("exposes contract enums at runtime, districts prefixed by their city", () => {
    expect(cityValues).toContain("kapan");
    expect(districtValues.every((d) => cityValues.some((c) => d.startsWith(`${c}-`)))).toBe(true);
  });
});
```

- [ ] **Step 5: Run it to see it fail**

Run: `npm test -- src/lib/api/schema.test.ts`
Expected: FAIL, `Failed to resolve import "./schema"`.

- [ ] **Step 6: Vendor the contract and generate**

```bash
mkdir -p contract && git -C ../InSyunik-Api fetch origin && git -C ../InSyunik-Api show origin/main:contract/openapi.yaml > contract/openapi.yaml && npm run api:types
```

- [ ] **Step 7: Write `scripts/contract-check.mjs`**

```js
// Fails when contract/openapi.yaml and package.json disagree on the version, or when
// src/lib/api/schema.ts no longer matches what the vendored YAML generates.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const yaml = readFileSync("contract/openapi.yaml", "utf8");
const version = /^ {2}version: (\S+)$/m.exec(yaml)?.[1];
if (version !== pkg.contractVersion) {
  console.error(`contract/openapi.yaml is ${version}; package.json pins ${pkg.contractVersion}.`);
  process.exit(1);
}
const out = join(mkdtempSync(join(tmpdir(), "contract-")), "schema.ts");
execFileSync("npx", ["openapi-typescript", "contract/openapi.yaml", "-o", out, "--enum-values"], { stdio: "ignore" });
if (readFileSync(out, "utf8") !== readFileSync("src/lib/api/schema.ts", "utf8")) {
  console.error("src/lib/api/schema.ts is stale. Run: npm run api:types");
  process.exit(1);
}
console.log(`contract ${version} OK`);
```

- [ ] **Step 8: Run the gate**

Run: `npm test && npm run typecheck && npm run lint`
Expected: 2 tests pass; `contract 0.3.0 OK`; `tsc` exits 0; `No ESLint warnings or errors`.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json .eslintrc.json .env.example vitest.config.mts scripts/contract-check.mjs contract/openapi.yaml src/lib/api/schema.ts src/lib/api/schema.test.ts
git commit -m "build: vendor contract v0.3.0, generate types, add vitest

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Typed client and RFC 9457 errors

**Files:**
- Create: `src/lib/api/types.ts`, `src/lib/api/errors.ts`, `src/lib/api/client.ts`
- Test: `src/lib/api/client.test.ts`

**Interfaces:**
- Consumes: `paths`, `components`, `operations` from `@/lib/api/schema` (Task 1).
- Produces:
  - `class ApiError extends Error { status: number; type: string; title: string; detail?: string; errors: Record<string, string[]>; get code(): string }`
  - `toApiError(status: number, body: unknown): ApiError`
  - `apiBaseUrl(): string`
  - `createApi(options?: { token?: string; fetch?: typeof fetch }): Api` where `Api` is the openapi-fetch client over `paths`
  - `unwrap<R extends { data?: unknown; error?: unknown; response: Response }>(result: R): NonNullable<R["data"]>`
  - `isUuid(value: string): boolean`
  - Type aliases in `@/lib/api/types`: `Money`, `Currency`, `PricePeriod`, `City`, `District`, `Deal`, `PropertySubcategory`, `PropertyCondition`, `BuildingType`, `PropertySortKey`, `RoomsOption`, `SellerType`, `SellerSummary`, `PropertyListing`, `PropertyListingPage`, `CatalogCard`, `CatalogCardPage`, `Facets`, `LaunchCategory`, `PropertySearchQuery`, `PropertyFacetQuery`, `CatalogSearchQuery`.

- [ ] **Step 1: Write `src/lib/api/types.ts`** (types only; nothing to test on its own)

```ts
import type { components, operations } from "./schema";

type S = components["schemas"];

export type Money = S["Money"];
export type Currency = S["Currency"];
export type PricePeriod = S["PricePeriod"];
export type City = S["City"];
export type District = S["District"];
export type LaunchCategory = S["LaunchCategory"];
export type Deal = S["Deal"];
export type PropertySubcategory = S["PropertySubcategory"];
export type PropertyCondition = S["PropertyCondition"];
export type BuildingType = S["BuildingType"];
export type PropertySortKey = S["PropertySortKey"];
export type RoomsOption = S["RoomsOption"];
export type SellerType = S["SellerType"];
export type SellerSummary = S["SellerSummary"];
export type PropertyListing = S["PropertyListing"];
export type PropertyListingPage = S["PropertyListingPage"];
export type CatalogCard = S["CatalogCard"];
export type CatalogCardPage = S["CatalogCardPage"];
export type Facets = S["Facets"];

export type PropertySearchQuery = NonNullable<operations["searchPropertyListings"]["parameters"]["query"]>;
export type PropertyFacetQuery = NonNullable<operations["getPropertyFacets"]["parameters"]["query"]>;
export type CatalogSearchQuery = NonNullable<operations["searchCatalog"]["parameters"]["query"]>;
```

- [ ] **Step 2: Write the failing test** — `src/lib/api/client.test.ts`

```ts
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
```

- [ ] **Step 3: Run it to see it fail**

Run: `npm test -- src/lib/api/client.test.ts`
Expected: FAIL, `Failed to resolve import "./client"`.

- [ ] **Step 4: Write `src/lib/api/errors.ts`**

```ts
const CODE_PREFIX = "urn:insyunik:error:";

/** An RFC 9457 problem returned by InSyunik-Api. Switch on `code`, never on `status` alone. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly type: string,
    readonly title: string,
    readonly detail?: string,
    readonly errors: Record<string, string[]> = {},
  ) {
    super(`${status} ${type}: ${title}`);
    this.name = "ApiError";
  }

  /** `property.not-found` for `urn:insyunik:error:property.not-found`; the raw type otherwise. */
  get code(): string {
    return this.type.startsWith(CODE_PREFIX) ? this.type.slice(CODE_PREFIX.length) : this.type;
  }
}

export function toApiError(status: number, body: unknown): ApiError {
  const problem = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  const errors =
    typeof problem.errors === "object" && problem.errors !== null
      ? (problem.errors as Record<string, string[]>)
      : {};
  return new ApiError(
    status,
    typeof problem.type === "string" ? problem.type : "about:blank",
    typeof problem.title === "string" ? problem.title : `HTTP ${status}`,
    typeof problem.detail === "string" ? problem.detail : undefined,
    errors,
  );
}
```

- [ ] **Step 5: Write `src/lib/api/client.ts`**

```ts
import createClient from "openapi-fetch";
import { toApiError } from "./errors";
import type { paths } from "./schema";

const LOCAL_API = "http://localhost:5080";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Server: API_URL, then NEXT_PUBLIC_API_URL. Browser: NEXT_PUBLIC_API_URL (inlined at build). */
export function apiBaseUrl(): string {
  const serverUrl = typeof window === "undefined" ? process.env.API_URL : undefined;
  return (serverUrl || process.env.NEXT_PUBLIC_API_URL || LOCAL_API).replace(/\/$/, "");
}

export interface ApiOptions {
  /** A Supabase access token; sent as `Authorization: Bearer`. */
  token?: string;
  /** Injected in tests; defaults to the global fetch (Next's patched fetch on the server). */
  fetch?: typeof fetch;
}

/** Stateless and isomorphic: create one per request on the server, per call in the browser. */
export function createApi(options: ApiOptions = {}) {
  const client = createClient<paths>({
    baseUrl: apiBaseUrl(),
    fetch: options.fetch,
    headers: { Accept: "application/json" },
  });
  const { token } = options;
  if (token) {
    client.use({
      onRequest({ request }) {
        request.headers.set("Authorization", `Bearer ${token}`);
        return request;
      },
    });
  }
  return client;
}

export type Api = ReturnType<typeof createApi>;

/** The response data, or an `ApiError` built from the problem body. */
export function unwrap<R extends { data?: unknown; error?: unknown; response: Response }>(
  result: R,
): NonNullable<R["data"]> {
  if (result.error !== undefined || result.data === undefined || result.data === null) {
    throw toApiError(result.response.status, result.error);
  }
  return result.data as NonNullable<R["data"]>;
}

/** Listing ids are UUIDs; mock ids such as `re-1` never reach the API. */
export function isUuid(value: string): boolean {
  return UUID.test(value);
}
```

- [ ] **Step 6: Run the tests**

Run: `npm test -- src/lib/api/client.test.ts`
Expected: 8 tests pass.

- [ ] **Step 7: Gate and commit**

Run: `npm run typecheck && npm run lint && npm test`

```bash
git add src/lib/api/types.ts src/lib/api/errors.ts src/lib/api/client.ts src/lib/api/client.test.ts
git commit -m "feat(api): typed client with problem-details errors

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Property and catalog read functions

**Files:**
- Create: `src/lib/api/property.ts`, `src/lib/api/catalog.ts`
- Test: `src/lib/api/reads.test.ts`

**Interfaces:**
- Consumes: `Api`, `createApi`, `unwrap` (Task 2); types from `@/lib/api/types`.
- Produces:
  - `searchProperty(api: Api, query: PropertySearchQuery, signal?: AbortSignal): Promise<PropertyListingPage>`
  - `getPropertyFacets(api: Api, query: PropertyFacetQuery): Promise<Facets>`
  - `getPropertyListing(api: Api, id: string): Promise<PropertyListing | null>` (null on 404 or a non-UUID id)
  - `getSimilarProperty(api: Api, id: string, limit?: number): Promise<PropertyListing[]>` (empty on 404)
  - `searchCatalog(api: Api, query: CatalogSearchQuery, signal?: AbortSignal): Promise<CatalogCardPage>`
  - `getRecentListings(api: Api, limit?: number): Promise<CatalogCard[]>`
  - `getCatalogByIds(api: Api, ids: string[]): Promise<CatalogCard[]>` (chunks of 50; only UUIDs are sent)
  - `CATALOG_IDS_LIMIT = 50`

- [ ] **Step 1: Write the failing test** — `src/lib/api/reads.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { getCatalogByIds } from "./catalog";
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
```

- [ ] **Step 2: Run it to see it fail**

Run: `npm test -- src/lib/api/reads.test.ts`
Expected: FAIL, `Failed to resolve import "./catalog"`.

- [ ] **Step 3: Write `src/lib/api/property.ts`**

```ts
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
```

- [ ] **Step 4: Write `src/lib/api/catalog.ts`**

```ts
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
```

- [ ] **Step 5: Run the tests**

Run: `npm test -- src/lib/api/reads.test.ts`
Expected: 4 tests pass.

- [ ] **Step 6: Gate and commit**

Run: `npm run typecheck && npm run lint && npm test`

```bash
git add src/lib/api/property.ts src/lib/api/catalog.ts src/lib/api/reads.test.ts
git commit -m "feat(api): property and catalog read functions

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Money and geography

**Files:**
- Create: `src/lib/money.ts`, `src/lib/geo.ts`
- Modify: `src/lib/currency.ts`, `src/components/filters/filter-fields.tsx:209`, `src/components/layout/language-picker.tsx:227`, `src/components/providers/app-provider.tsx` (currency hydration)
- Test: `src/lib/money.test.ts`, `src/lib/geo.test.ts`

**Interfaces:**
- Consumes: `Money`, `Currency`, `PricePeriod`, `City`, `District` (Task 2); `cityValues`, `districtValues` (Task 1); `groupDigits` from `@/lib/format`; `currencyOption` and `CITY_SLUG` from existing files.
- Produces:
  - `AMD_PER_USD = 400`, `toDisplayCurrency(value: string): Currency`, `convertAmount(amount: number, from: Currency, to: Currency): number`
  - `periodLabel(period: PricePeriod): string`, `formatAmount(money: Money, display: Currency): string`, `formatMoney(money: Money, display: Currency): string`, `NEGOTIABLE_LABEL`
  - `CITY_LABEL: Record<City, string>`, `DISTRICT_LABEL: Record<District, string>`, `isCity(value: string): value is City`, `isDistrict(value: string): value is District`, `citySlugOf(armenianName: string): City | undefined`, `districtsOf(cities: readonly City[]): District[]`, `locationText(city: City, district?: District): string`
  - `DISPLAY_CURRENCIES` in `@/lib/currency` (the USD and AMD options only)

- [ ] **Step 1: Write the failing tests**

`src/lib/money.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import type { Money } from "@/lib/api/types";
import { groupDigits } from "@/lib/format";
import { NEGOTIABLE_LABEL, convertAmount, formatAmount, formatMoney, toDisplayCurrency } from "./money";

const usd = (amount: number | null, period: Money["period"] = "total"): Money => ({
  amount,
  currency: "USD",
  period,
  negotiable: amount === null,
});

describe("money", () => {
  it("converts both ways at the display rate", () => {
    expect(convertAmount(100, "USD", "AMD")).toBe(40000);
    expect(convertAmount(40000, "AMD", "USD")).toBe(100);
    expect(convertAmount(5, "AMD", "AMD")).toBe(5);
  });

  it("formats USD with a leading symbol and AMD with a trailing one", () => {
    expect(formatAmount(usd(42000), "USD").startsWith("$")).toBe(true);
    expect(formatAmount(usd(42000), "USD")).toContain(groupDigits(42000));
    expect(formatAmount(usd(100), "AMD").endsWith("֏")).toBe(true);
    expect(formatAmount(usd(100), "AMD")).toContain(groupDigits(40000));
  });

  it("appends the period, and shows negotiable when there is no amount", () => {
    expect(formatMoney(usd(300, "month"), "USD").endsWith("/ամիս")).toBe(true);
    expect(formatMoney(usd(40, "night"), "USD").endsWith("/գիշեր")).toBe(true);
    expect(formatMoney(usd(42000), "USD").includes("/")).toBe(false);
    expect(formatMoney(usd(null, "month"), "USD")).toBe(NEGOTIABLE_LABEL);
  });

  it("maps any stored display preference onto a contract currency", () => {
    expect(toDisplayCurrency("AMD")).toBe("AMD");
    expect(toDisplayCurrency("EUR")).toBe("USD");
  });
});
```

`src/lib/geo.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { cityValues, districtValues } from "@/lib/api/schema";
import { CITY_LABEL, DISTRICT_LABEL, citySlugOf, districtsOf, isCity, locationText } from "./geo";

describe("geo", () => {
  it("labels every contract city and district", () => {
    for (const city of cityValues) expect(CITY_LABEL[city]).toBeTruthy();
    for (const district of districtValues) expect(DISTRICT_LABEL[district]).toBeTruthy();
  });

  it("lists a city's districts by slug prefix", () => {
    expect(districtsOf(["kajaran"])).toEqual(["kajaran-center", "kajaran-norashen", "kajaran-lernayin"]);
    expect(districtsOf([])).toEqual([]);
  });

  it("round-trips the Armenian city names the app stores", () => {
    expect(citySlugOf("Կապան")).toBe("kapan");
    expect(citySlugOf("Paris")).toBeUndefined();
    expect(isCity("goris")).toBe(true);
    expect(isCity("Գորիս")).toBe(false);
  });

  it("renders city and district as one line", () => {
    expect(locationText("kapan", "kapan-center")).toBe("Կապան, Կենտրոն");
    expect(locationText("tatev")).toBe("Տաթև");
  });
});
```

- [ ] **Step 2: Run them to see them fail**

Run: `npm test -- src/lib/money.test.ts src/lib/geo.test.ts`
Expected: FAIL, `Failed to resolve import "./money"` and `"./geo"`.

- [ ] **Step 3: Write `src/lib/money.ts`**

```ts
import type { Currency, Money, PricePeriod } from "@/lib/api/types";
import { currencyOption } from "@/lib/currency";
import { groupDigits } from "@/lib/format";

/** Illustrative display rate, the same one `CURRENCY_OPTIONS` uses. Not a quote. */
export const AMD_PER_USD = 400;

export const NEGOTIABLE_LABEL = "Պայմանագրային";

const PERIOD_LABEL: Record<PricePeriod, string> = { total: "", month: "ամիս", night: "գիշեր", hour: "ժամ" };

/** The viewer's stored preference may be a legacy EUR or RUB; the contract knows USD and AMD. */
export function toDisplayCurrency(value: string): Currency {
  return value === "AMD" ? "AMD" : "USD";
}

export function convertAmount(amount: number, from: Currency, to: Currency): number {
  if (from === to) return amount;
  return from === "USD" ? amount * AMD_PER_USD : amount / AMD_PER_USD;
}

export function periodLabel(period: PricePeriod): string {
  return PERIOD_LABEL[period];
}

/** Amount with its currency symbol, without the period. */
export function formatAmount(money: Money, display: Currency): string {
  if (money.amount === null) return NEGOTIABLE_LABEL;
  const value = groupDigits(convertAmount(money.amount, money.currency, display));
  const { symbol, suffix } = currencyOption(display);
  return suffix ? `${value} ${symbol}` : `${symbol} ${value}`;
}

/** Amount plus "/ամիս", "/գիշեր" or "/ժամ" when the price is periodic. */
export function formatMoney(money: Money, display: Currency): string {
  const period = periodLabel(money.period);
  if (money.amount === null || !period) return formatAmount(money, display);
  return `${formatAmount(money, display)}/${period}`;
}
```

- [ ] **Step 4: Write `src/lib/geo.ts`**

```ts
import { cityValues, districtValues } from "@/lib/api/schema";
import type { City, District } from "@/lib/api/types";
import { CITY_SLUG } from "@/lib/cities";

export const CITY_LABEL: Record<City, string> = {
  kapan: "Կապան",
  goris: "Գորիս",
  sisian: "Սիսիան",
  kajaran: "Քաջարան",
  meghri: "Մեղրի",
  agarak: "Ագարակ",
  dastakert: "Դաստակերտ",
  tatev: "Տաթև",
  khndzoresk: "Խնձորեսկ",
  shinuhayr: "Շինուհայր",
};

export const DISTRICT_LABEL: Record<District, string> = {
  "kapan-center": "Կենտրոն",
  "kapan-vachagan": "Վաչագան",
  "kapan-achanan": "Աճանան",
  "kapan-shahumyan": "Շահումյան",
  "kapan-dzork": "Ձորք",
  "kapan-kavart": "Կավարտ",
  "kapan-aghbyur": "Աղբյուր",
  "goris-center": "Կենտրոն",
  "goris-verin-goris": "Վերին Գորիս",
  "goris-aghbyur": "Աղբյուր",
  "goris-davit-bek": "Դավիթ Բեկ",
  "goris-syunik": "Սյունիք",
  "sisian-center": "Կենտրոն",
  "sisian-arevik": "Արևիկ",
  "sisian-norashen": "Նորաշեն",
  "sisian-sisakan": "Սիսական",
  "kajaran-center": "Կենտրոն",
  "kajaran-norashen": "Նորաշեն",
  "kajaran-lernayin": "Լեռնային",
  "meghri-center": "Կենտրոն",
  "meghri-prkashen": "Պրկաշեն",
  "meghri-mets-tagh": "Մեծ Թաղ",
  "agarak-center": "Կենտրոն",
  "agarak-gortsaranayin": "Գործարանային",
  "dastakert-center": "Կենտրոն",
  "tatev-center": "Կենտրոն",
  "tatev-vorotan-gorge": "Որոտանի կիրճ",
  "khndzoresk-center": "Կենտրոն",
  "khndzoresk-hin-khndzoresk": "Հին Խնձորեսկ",
  "shinuhayr-center": "Կենտրոն",
};

export function isCity(value: string): value is City {
  return (cityValues as readonly string[]).includes(value);
}

export function isDistrict(value: string): value is District {
  return (districtValues as readonly string[]).includes(value);
}

/** The AppProvider still stores the header city by its Armenian name; this is the bridge. */
export function citySlugOf(armenianName: string): City | undefined {
  const slug = CITY_SLUG[armenianName];
  return slug && isCity(slug) ? slug : undefined;
}

/** A district slug carries its city as a prefix, so no separate table is needed. */
export function districtsOf(cities: readonly City[]): District[] {
  return districtValues.filter((district) => cities.some((city) => district.startsWith(`${city}-`)));
}

export function locationText(city: City, district?: District): string {
  return district ? `${CITY_LABEL[city]}, ${DISTRICT_LABEL[district]}` : CITY_LABEL[city];
}
```

- [ ] **Step 5: Run the tests**

Run: `npm test -- src/lib/money.test.ts src/lib/geo.test.ts`
Expected: 8 tests pass.

- [ ] **Step 6: Limit display currencies to USD and AMD**

In `src/lib/currency.ts`, after `CURRENCY_OPTIONS`, add:

```ts
/** What a viewer can pick for display and price filters. EUR and RUB stay in `CURRENCY_OPTIONS`
 * only for the legacy wizard's optional price fields; the contract carries USD and AMD. */
export const DISPLAY_CURRENCIES = CURRENCY_OPTIONS.filter((option) => option.value === "USD" || option.value === "AMD");
```

In `src/components/filters/filter-fields.tsx` line 209 and `src/components/layout/language-picker.tsx` line 227, replace `CURRENCY_OPTIONS.map(` with `DISPLAY_CURRENCIES.map(` and add `DISPLAY_CURRENCIES` to each file's `@/lib/currency` import. Remove `CURRENCY_OPTIONS` from an import only if the file no longer uses it (`language-picker.tsx` still does, on line 128).

In `src/components/providers/app-provider.tsx`, change the stored-currency check to:

```ts
if (savedCurrency === "USD" || savedCurrency === "AMD") {
```

- [ ] **Step 7: Gate and commit**

Run: `npm run typecheck && npm run lint && npm test`

```bash
git add src/lib/money.ts src/lib/money.test.ts src/lib/geo.ts src/lib/geo.test.ts src/lib/currency.ts src/components/filters/filter-fields.tsx src/components/layout/language-picker.tsx src/components/providers/app-provider.tsx
git commit -m "feat(format): contract money and geography helpers; USD and AMD display only

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Property doors and URL filter state

**Files:**
- Create: `src/lib/property-doors.ts`, `src/lib/property-filters.ts`
- Test: `src/lib/property-doors.test.ts`, `src/lib/property-filters.test.ts`

**Interfaces:**
- Consumes: enum arrays (Task 1), contract types (Task 2), `PAGE_SIZE` from `@/lib/constants`, `REAL_ESTATE_SUBCATEGORIES` and `RENTAL_SUBCATEGORIES` from `@/mock/taxonomy`.
- Produces:
  - `type PropertyDoor = "real-estate" | "rentals" | "hotels"`
  - `interface SubcategoryOption { value: PropertySubcategory; label: string; icon?: LucideIcon }`
  - `PROPERTY_DOORS: Record<PropertyDoor, { door: PropertyDoor; deal: Deal; subcategories: SubcategoryOption[] }>`
  - `DOOR_BY_DEAL: Record<Deal, PropertyDoor>`, `isPropertyDoor(value: string): value is PropertyDoor`, `propertyHref(listing: { id: string; deal: Deal }): string`, `doorSubcategoryLabel(door: PropertyDoor, value: string): string | undefined`
  - `interface PropertyFilters` (fields below), `DEFAULT_PROPERTY_FILTERS`, `interface PropertyPageState { filters: PropertyFilters; sort: PropertySortKey; page: number }`
  - `parsePropertyState(door: PropertyDoor, params: URLSearchParams): PropertyPageState`
  - `propertyStateToSearch(state: PropertyPageState): string` (`""` or `"?…"`)
  - `toPropertyFacetQuery(door: PropertyDoor, filters: PropertyFilters): PropertyFacetQuery`
  - `toPropertyQuery(door: PropertyDoor, state: PropertyPageState, pageSize?: number): PropertySearchQuery`
  - `countActivePropertyFilters(filters: PropertyFilters): number`
  - `stripRejectedParams(params: URLSearchParams, errors: Record<string, string[]>): string`

- [ ] **Step 1: Write the failing tests**

`src/lib/property-doors.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { dealValues, propertySubcategoryValues } from "@/lib/api/schema";
import { DOOR_BY_DEAL, PROPERTY_DOORS, doorSubcategoryLabel, isPropertyDoor, propertyHref } from "./property-doors";

describe("property doors", () => {
  it("only offers subcategories the contract knows", () => {
    for (const config of Object.values(PROPERTY_DOORS)) {
      for (const option of config.subcategories) expect(propertySubcategoryValues).toContain(option.value);
    }
  });

  it("gives every deal exactly one door, so a listing appears on one door only", () => {
    for (const deal of dealValues) expect(PROPERTY_DOORS[DOOR_BY_DEAL[deal]].deal).toBe(deal);
  });

  it("links a listing to its deal's door", () => {
    expect(propertyHref({ id: "abc", deal: "daily" })).toBe("/hotels/abc");
    expect(isPropertyDoor("rentals")).toBe(true);
    expect(isPropertyDoor("cars")).toBe(false);
    expect(doorSubcategoryLabel("hotels", "guesthouses")).toBe("Հյուրատներ");
  });
});
```

`src/lib/property-filters.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  DEFAULT_PROPERTY_FILTERS,
  countActivePropertyFilters,
  parsePropertyState,
  propertyStateToSearch,
  stripRejectedParams,
  toPropertyQuery,
} from "./property-filters";

const parse = (door: Parameters<typeof parsePropertyState>[0], query: string) =>
  parsePropertyState(door, new URLSearchParams(query));

describe("parsePropertyState", () => {
  it("reads lists, flags, sort and page", () => {
    const state = parse("real-estate", "city=kapan,goris&rooms=1,2&furniture=1&sort=price-asc&page=2");
    expect(state.filters.city).toEqual(["kapan", "goris"]);
    expect(state.filters.rooms).toEqual(["1", "2"]);
    expect(state.filters.furniture).toBe(true);
    expect(state.sort).toBe("price-asc");
    expect(state.page).toBe(2);
  });

  it("drops values the contract would reject instead of letting the API 400", () => {
    const state = parse("real-estate", "city=paris&condition=euro,bogus&sort=nope&page=-3&areaMin=abc&priceMax=1e9");
    expect(state.filters.city).toEqual([]);
    expect(state.filters.condition).toEqual(["euro"]);
    expect(state.sort).toBe("relevant");
    expect(state.page).toBe(1);
    expect(state.filters.areaMin).toBe("");
    expect(state.filters.priceMax).toBe("");
  });

  it("drops a subcategory the door does not offer and a district outside the chosen cities", () => {
    expect(parse("hotels", "subcategory=land").filters.subcategory).toBe("");
    expect(parse("hotels", "subcategory=guesthouses").filters.subcategory).toBe("guesthouses");
    expect(parse("rentals", "city=goris&district=kapan-center").filters.district).toBe("");
    expect(parse("rentals", "city=kapan&district=kapan-center").filters.district).toBe("kapan-center");
    expect(parse("rentals", "district=kapan-center").filters.district).toBe("kapan-center");
  });
});

describe("propertyStateToSearch", () => {
  it("round-trips a canonical query", () => {
    const query = "city=kapan%2Cgoris&rooms=1%2C2&areaMin=40&condition=euro&furniture=1&sort=price-asc&page=3";
    expect(propertyStateToSearch(parse("real-estate", query))).toBe(`?${query}`);
  });

  it("leaves defaults out of the URL", () => {
    expect(propertyStateToSearch({ filters: DEFAULT_PROPERTY_FILTERS, sort: "relevant", page: 1 })).toBe("");
  });
});

describe("toPropertyQuery", () => {
  it("adds the door's deal preset, which never appears in the URL", () => {
    const state = parse("rentals", "city=kapan,goris&rooms=1,2&furniture=1&page=2");
    expect(toPropertyQuery("rentals", state)).toEqual({
      deal: "rent",
      city: "kapan,goris",
      rooms: "1,2",
      furniture: "1",
      page: 2,
      pageSize: 12,
    });
    expect(propertyStateToSearch(state)).not.toContain("deal");
  });

  it("scopes price bounds to one currency, USD unless the viewer chose AMD", () => {
    expect(toPropertyQuery("real-estate", parse("real-estate", "priceMax=50000")).cur).toBe("USD");
    expect(toPropertyQuery("real-estate", parse("real-estate", "priceMax=50000&cur=AMD")).cur).toBe("AMD");
    expect(toPropertyQuery("real-estate", parse("real-estate", "")).cur).toBeUndefined();
  });
});

describe("countActivePropertyFilters", () => {
  it("counts every non-default filter except the text query", () => {
    expect(countActivePropertyFilters(parse("real-estate", "q=բնակարան&city=kapan&furniture=1&areaMin=40").filters)).toBe(3);
  });
});

describe("stripRejectedParams", () => {
  it("removes exactly the parameters the API rejected", () => {
    const params = new URLSearchParams("city=kapan&areaMin=5&page=2");
    expect(stripRejectedParams(params, { areaMin: ["too small"] })).toBe("?city=kapan&page=2");
  });
});
```

- [ ] **Step 2: Run them to see them fail**

Run: `npm test -- src/lib/property-doors.test.ts src/lib/property-filters.test.ts`
Expected: FAIL, unresolved imports.

- [ ] **Step 3: Write `src/lib/property-doors.ts`**

```ts
import { Building, DoorOpen, Home, Hotel, type LucideIcon } from "lucide-react";
import type { Deal, PropertySubcategory } from "@/lib/api/types";
import { REAL_ESTATE_SUBCATEGORIES, RENTAL_SUBCATEGORIES, type Option } from "@/mock/taxonomy";

export type PropertyDoor = "real-estate" | "rentals" | "hotels";

export interface SubcategoryOption {
  value: PropertySubcategory;
  label: string;
  icon?: LucideIcon;
}

export interface PropertyDoorConfig {
  door: PropertyDoor;
  /** The fixed query every request from this door carries. One deal per door means a listing
   * lives on exactly one door (spec W4, W5). */
  deal: Deal;
  subcategories: SubcategoryOption[];
}

/** Taxonomy labels are door-specific ("…for sale", "…for rent"); values are contract values,
 * which `property-doors.test.ts` asserts. */
function fromTaxonomy(options: Option[]): SubcategoryOption[] {
  return options.map((option) => ({
    value: option.value as PropertySubcategory,
    label: option.label,
    icon: option.icon,
  }));
}

export const PROPERTY_DOORS: Record<PropertyDoor, PropertyDoorConfig> = {
  "real-estate": { door: "real-estate", deal: "sale", subcategories: fromTaxonomy(REAL_ESTATE_SUBCATEGORIES) },
  rentals: { door: "rentals", deal: "rent", subcategories: fromTaxonomy(RENTAL_SUBCATEGORIES) },
  hotels: {
    door: "hotels",
    deal: "daily",
    subcategories: [
      { value: "hotels", label: "Հյուրանոցներ", icon: Hotel },
      { value: "guesthouses", label: "Հյուրատներ", icon: DoorOpen },
      { value: "houses", label: "Հանգստյան տներ", icon: Home },
      { value: "apartments", label: "Օրավարձով բնակարաններ", icon: Building },
    ],
  },
};

export const DOOR_BY_DEAL: Record<Deal, PropertyDoor> = { sale: "real-estate", rent: "rentals", daily: "hotels" };

export function isPropertyDoor(value: string): value is PropertyDoor {
  return value === "real-estate" || value === "rentals" || value === "hotels";
}

export function propertyHref(listing: { id: string; deal: Deal }): string {
  return `/${DOOR_BY_DEAL[listing.deal]}/${listing.id}`;
}

export function doorSubcategoryLabel(door: PropertyDoor, value: string): string | undefined {
  return PROPERTY_DOORS[door].subcategories.find((option) => option.value === value)?.label;
}
```

- [ ] **Step 4: Write `src/lib/property-filters.ts`**

```ts
import {
  buildingTypeValues,
  cityValues,
  currencyValues,
  districtValues,
  propertyConditionValues,
  propertySortKeyValues,
  roomsOptionValues,
} from "@/lib/api/schema";
import type {
  BuildingType,
  City,
  Currency,
  District,
  PropertyCondition,
  PropertyFacetQuery,
  PropertySearchQuery,
  PropertySortKey,
  PropertySubcategory,
  RoomsOption,
} from "@/lib/api/types";
import { PAGE_SIZE } from "@/lib/constants";
import { PROPERTY_DOORS, type PropertyDoor } from "@/lib/property-doors";

/** Filter state of a property door. Field names are the contract's query parameter names, so the
 * page URL is the API query minus the door's deal preset. Numbers stay strings, as inputs hold them. */
export interface PropertyFilters {
  q: string;
  city: City[];
  district: District | "";
  priceMin: string;
  priceMax: string;
  cur: Currency | "";
  withPhoto: boolean;
  verifiedOnly: boolean;
  subcategory: PropertySubcategory | "";
  rooms: RoomsOption[];
  areaMin: string;
  areaMax: string;
  floorMin: string;
  floorMax: string;
  totalFloorsMin: string;
  totalFloorsMax: string;
  condition: PropertyCondition[];
  buildingType: BuildingType | "";
  furniture: boolean;
  balcony: boolean;
  parking: boolean;
  pool: boolean;
}

export const DEFAULT_PROPERTY_FILTERS: PropertyFilters = {
  q: "",
  city: [],
  district: "",
  priceMin: "",
  priceMax: "",
  cur: "",
  withPhoto: false,
  verifiedOnly: false,
  subcategory: "",
  rooms: [],
  areaMin: "",
  areaMax: "",
  floorMin: "",
  floorMax: "",
  totalFloorsMin: "",
  totalFloorsMax: "",
  condition: [],
  buildingType: "",
  furniture: false,
  balcony: false,
  parking: false,
  pool: false,
};

export interface PropertyPageState {
  filters: PropertyFilters;
  sort: PropertySortKey;
  page: number;
}

const MAX_WHOLE = 1_000_000_000;

function oneOf<T extends string>(values: readonly T[], raw: string | null): T | "" {
  return raw !== null && (values as readonly string[]).includes(raw) ? (raw as T) : "";
}

function listOf<T extends string>(values: readonly T[], raw: string | null): T[] {
  if (!raw) return [];
  return [...new Set(raw.split(","))].filter((value): value is T => (values as readonly string[]).includes(value));
}

const flag = (raw: string | null) => raw === "1" || raw === "true";
/** Non-negative integers below a billion; anything else is dropped rather than sent. */
const whole = (raw: string | null) => (raw !== null && /^\d{1,9}$/.test(raw) && Number(raw) < MAX_WHOLE ? raw : "");
const decimal = (raw: string | null) => (raw !== null && /^\d{1,6}(\.\d{1,2})?$/.test(raw) ? raw : "");

export function parsePropertyState(door: PropertyDoor, params: URLSearchParams): PropertyPageState {
  const allowedSubcategories = PROPERTY_DOORS[door].subcategories.map((option) => option.value);
  const city = listOf(cityValues, params.get("city"));
  const district = oneOf(districtValues, params.get("district"));
  const filters: PropertyFilters = {
    q: (params.get("q") ?? "").trim().slice(0, 200),
    city,
    district: district && (city.length === 0 || city.some((c) => district.startsWith(`${c}-`))) ? district : "",
    priceMin: whole(params.get("priceMin")),
    priceMax: whole(params.get("priceMax")),
    cur: oneOf(currencyValues, params.get("cur")),
    withPhoto: flag(params.get("withPhoto")),
    verifiedOnly: flag(params.get("verifiedOnly")),
    subcategory: oneOf(allowedSubcategories, params.get("subcategory")),
    rooms: listOf(roomsOptionValues, params.get("rooms")),
    areaMin: decimal(params.get("areaMin")),
    areaMax: decimal(params.get("areaMax")),
    floorMin: whole(params.get("floorMin")),
    floorMax: whole(params.get("floorMax")),
    totalFloorsMin: whole(params.get("totalFloorsMin")),
    totalFloorsMax: whole(params.get("totalFloorsMax")),
    condition: listOf(propertyConditionValues, params.get("condition")),
    buildingType: oneOf(buildingTypeValues, params.get("buildingType")),
    furniture: flag(params.get("furniture")),
    balcony: flag(params.get("balcony")),
    parking: flag(params.get("parking")),
    pool: flag(params.get("pool")),
  };
  const page = Number(whole(params.get("page")) || "1");
  return {
    filters,
    sort: oneOf(propertySortKeyValues, params.get("sort")) || "relevant",
    page: page >= 1 ? page : 1,
  };
}

export function propertyStateToSearch(state: PropertyPageState): string {
  const params = new URLSearchParams();
  for (const key of Object.keys(DEFAULT_PROPERTY_FILTERS) as (keyof PropertyFilters)[]) {
    const value = state.filters[key];
    if (Array.isArray(value)) {
      if (value.length) params.set(key, value.join(","));
    } else if (typeof value === "boolean") {
      if (value) params.set(key, "1");
    } else if (value) {
      params.set(key, value);
    }
  }
  if (state.sort !== "relevant") params.set("sort", state.sort);
  if (state.page > 1) params.set("page", String(state.page));
  const query = params.toString();
  return query ? `?${query}` : "";
}

const num = (value: string) => (value === "" ? undefined : Number(value));
const csv = (values: readonly string[]) => (values.length ? values.join(",") : undefined);
const yes = (value: boolean) => (value ? ("1" as const) : undefined);

export function toPropertyFacetQuery(door: PropertyDoor, filters: PropertyFilters): PropertyFacetQuery {
  const priced = filters.priceMin !== "" || filters.priceMax !== "";
  return {
    deal: PROPERTY_DOORS[door].deal,
    q: filters.q || undefined,
    city: csv(filters.city),
    district: filters.district || undefined,
    priceMin: num(filters.priceMin),
    priceMax: num(filters.priceMax),
    // The API compares amounts in the listing's own currency, so bounds need one (spec 4.5).
    cur: filters.cur || (priced ? "USD" : undefined),
    withPhoto: yes(filters.withPhoto),
    verifiedOnly: yes(filters.verifiedOnly),
    subcategory: filters.subcategory || undefined,
    rooms: csv(filters.rooms),
    areaMin: num(filters.areaMin),
    areaMax: num(filters.areaMax),
    floorMin: num(filters.floorMin),
    floorMax: num(filters.floorMax),
    totalFloorsMin: num(filters.totalFloorsMin),
    totalFloorsMax: num(filters.totalFloorsMax),
    condition: csv(filters.condition),
    buildingType: filters.buildingType || undefined,
    furniture: yes(filters.furniture),
    balcony: yes(filters.balcony),
    parking: yes(filters.parking),
    pool: yes(filters.pool),
  };
}

export function toPropertyQuery(door: PropertyDoor, state: PropertyPageState, pageSize = PAGE_SIZE): PropertySearchQuery {
  return {
    ...toPropertyFacetQuery(door, state.filters),
    sort: state.sort === "relevant" ? undefined : state.sort,
    page: state.page > 1 ? state.page : undefined,
    pageSize,
  };
}

export function countActivePropertyFilters(filters: PropertyFilters): number {
  let count = 0;
  for (const key of Object.keys(DEFAULT_PROPERTY_FILTERS) as (keyof PropertyFilters)[]) {
    if (key === "q") continue;
    const value = filters[key];
    if (Array.isArray(value) ? value.length > 0 : Boolean(value)) count += 1;
  }
  return count;
}

/** After a 400, the door page drops the rejected parameters and reloads once (spec 5). */
export function stripRejectedParams(params: URLSearchParams, errors: Record<string, string[]>): string {
  const next = new URLSearchParams(params);
  for (const key of Object.keys(errors)) next.delete(key);
  const query = next.toString();
  return query ? `?${query}` : "";
}
```

- [ ] **Step 5: Run the tests**

Run: `npm test -- src/lib/property-doors.test.ts src/lib/property-filters.test.ts`
Expected: 12 tests pass. `toEqual` ignores the `undefined` keys in `toPropertyQuery`'s result, so the expected object lists only the defined ones.

- [ ] **Step 6: Gate and commit**

Run: `npm run typecheck && npm run lint && npm test`

```bash
git add src/lib/property-doors.ts src/lib/property-doors.test.ts src/lib/property-filters.ts src/lib/property-filters.test.ts
git commit -m "feat(property): door presets and URL filter state mapped to the contract

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Card model, property formatting, and one card for both sources

**Files:**
- Create: `src/lib/property-format.ts`, `src/lib/card.ts`, `src/test/fixtures.ts`
- Modify: `src/lib/format.ts` (`formatRelativeDate` default), `src/components/listings/listing-card.tsx`, `src/components/listings/listing-grid.tsx`, `src/components/home/hits-section.tsx`, `src/components/home/new-arrivals.tsx`, `src/components/category/category-page.tsx`, `src/components/search/search-results.tsx`, `src/components/account/favorites-view.tsx`, `src/components/listing/listing-details.tsx` (similar row only), `src/app/page.tsx`
- Test: `src/lib/property-format.test.ts`, `src/lib/card.test.ts`, `src/lib/format.test.ts`

**Interfaces:**
- Consumes: Tasks 2, 4 and 5; legacy `listingHref`, `isDaily`, `isMonthly`, `listingSummary`, `locationLine`, `label`.
- Produces:
  - `propertySummary(fields: { subcategory: string; rooms?: number; area?: number; landArea?: number }): string`
  - `propertyBadges(fields: { deal: Deal; buildingType?: BuildingType }): string[]`
  - `propertyChips(listing: PropertyListing): string[]`, `propertySpecs(listing: PropertyListing): Spec[]`, `DEAL_LABEL: Record<Deal, string>`
  - `interface CardModel { id; door: CategorySlug; href; title; price: Money | null; location; images: string[]; imageCount; featured; verified; publishedAt; badges: string[]; headline; description?: string }`
  - `propertyCard(listing: PropertyListing): CardModel`, `catalogCard(card: CatalogCard): CardModel | null`, `legacyCard(listing: Listing): CardModel`, `sortCards(cards: CardModel[], sort: SortKey): CardModel[]`
  - `<ListingCard card={…} />`, `<ListingGrid cards={…} />`, `<HitsSection cards={…} />`, `<NewArrivals cards={…} />`
  - Test fixtures `PROPERTY_FIXTURE: PropertyListing`, `catalogFixture(overrides?: Partial<CatalogCard>): CatalogCard`

- [ ] **Step 1: Write the fixtures** — `src/test/fixtures.ts`

```ts
import type { CatalogCard, PropertyListing } from "@/lib/api/types";

export const PROPERTY_FIXTURE: PropertyListing = {
  id: "947e6113-f009-5717-a2f7-97b482ec8acf",
  category: "property",
  subcategory: "apartments",
  deal: "rent",
  title: "2-սենյականոց բնակարան Կապանի կենտրոնում",
  description: "Լուսավոր բնակարան կենտրոնում։",
  price: { amount: 300, currency: "USD", period: "month", negotiable: false },
  city: "kapan",
  district: "kapan-center",
  address: "Շահումյան փող., 8",
  coords: { lat: 39.2076, lng: 46.4057 },
  images: ["https://images.unsplash.com/photo-1.jpg", "https://images.unsplash.com/photo-2.jpg"],
  featured: false,
  verified: true,
  status: "active",
  publishedAt: "2026-09-01T10:00:00Z",
  seller: {
    id: "95a6aab5-87ff-57e9-a8ac-71b8f63283f3",
    name: "Արթուր Մկրտչյան",
    type: "private",
    phone: "+37491452218",
    hasWhatsApp: true,
    hasTelegram: false,
    hasViber: true,
    memberSince: "2021-04-12T10:00:00Z",
  },
  rooms: 2,
  area: 60,
  floor: 3,
  totalFloors: 5,
  bathrooms: 1,
  condition: "good",
  buildingType: "secondary",
  furniture: true,
  balcony: false,
  parking: true,
  pool: false,
};

export function catalogFixture(overrides: Partial<CatalogCard> = {}): CatalogCard {
  return {
    id: PROPERTY_FIXTURE.id,
    sellerId: PROPERTY_FIXTURE.seller!.id,
    category: "property",
    subcategory: "apartments",
    title: PROPERTY_FIXTURE.title,
    price: PROPERTY_FIXTURE.price,
    city: "kapan",
    district: "kapan-center",
    coverImage: PROPERTY_FIXTURE.images[0],
    imageCount: 2,
    featured: false,
    verified: true,
    status: "active",
    publishedAt: PROPERTY_FIXTURE.publishedAt,
    card: { deal: "rent", rooms: 2, area: 60 },
    ...overrides,
  };
}
```

- [ ] **Step 2: Write the failing tests**

`src/lib/format.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { formatRelativeDate } from "./format";

describe("formatRelativeDate", () => {
  it("measures against the real clock by default, not the mock one", () => {
    expect(formatRelativeDate(new Date(Date.now() - 5 * 60_000).toISOString())).toBe("5 րոպե առաջ");
  });

  it("stays deterministic when now is passed", () => {
    const now = Date.parse("2026-09-10T12:00:00Z");
    expect(formatRelativeDate("2026-09-09T12:00:00Z", now)).toBe("երեկ");
  });
});
```

`src/lib/property-format.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { PROPERTY_FIXTURE } from "@/test/fixtures";
import { formatArea } from "./format";
import { propertyBadges, propertyChips, propertySpecs, propertySummary } from "./property-format";

const labels = (specs: { label: string }[]) => specs.map((spec) => spec.label);

describe("propertySummary", () => {
  it("leads with rooms for dwellings and with the kind otherwise", () => {
    expect(propertySummary({ subcategory: "apartments", rooms: 3, area: 82 })).toBe(`3-սենյականոց · ${formatArea(82)}`);
    expect(propertySummary({ subcategory: "apartments", rooms: 0, area: 30 })).toBe(`Ստուդիո · ${formatArea(30)}`);
    expect(propertySummary({ subcategory: "garages", area: 24 })).toBe(`Ավտոտնակ · ${formatArea(24)}`);
    expect(propertySummary({ subcategory: "land", landArea: 10 })).toBe("Հողատարածք · 10 սոտկա");
  });
});

describe("propertyBadges", () => {
  it("marks new buildings and nightly stays", () => {
    expect(propertyBadges({ deal: "sale", buildingType: "new" })).toEqual(["Նորակառույց"]);
    expect(propertyBadges({ deal: "daily" })).toEqual(["Օրավարձով"]);
    expect(propertyBadges({ deal: "rent" })).toEqual([]);
  });
});

describe("propertySpecs", () => {
  it("shows amenities for dwellings and utilities for garages and land", () => {
    expect(labels(propertySpecs(PROPERTY_FIXTURE))).toEqual(
      expect.arrayContaining(["Տեսակ", "Գործարք", "Սենյակներ", "Հարկ", "Կահույք", "Կայանատեղի"]),
    );
    const garage = { ...PROPERTY_FIXTURE, subcategory: "garages" as const, rooms: undefined, water: true, pit: false };
    const garageLabels = labels(propertySpecs(garage));
    expect(garageLabels).toEqual(expect.arrayContaining(["Ջուր", "Յամա"]));
    expect(garageLabels).not.toContain("Կահույք");
  });

  it("names the pool only for nightly stays or when present", () => {
    expect(labels(propertySpecs(PROPERTY_FIXTURE))).not.toContain("Լողավազան");
    expect(labels(propertySpecs({ ...PROPERTY_FIXTURE, deal: "daily" }))).toContain("Լողավազան");
  });
});

describe("propertyChips", () => {
  it("lists the compact facts under the title", () => {
    expect(propertyChips(PROPERTY_FIXTURE)).toEqual(["2-սենյականոց", formatArea(60), "3/5 հարկ", "Լավ վիճակում"]);
  });
});
```

`src/lib/card.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { catalogFixture, PROPERTY_FIXTURE } from "@/test/fixtures";
import { CAR_LISTINGS } from "@/mock/cars";
import { SERVICE_LISTINGS } from "@/mock/services";
import { WORK_LISTINGS } from "@/mock/work";
import { type CardModel, catalogCard, legacyCard, propertyCard, sortCards } from "./card";

describe("propertyCard", () => {
  it("links to the deal's door and summarises size", () => {
    const card = propertyCard(PROPERTY_FIXTURE);
    expect(card.door).toBe("rentals");
    expect(card.href).toBe(`/rentals/${PROPERTY_FIXTURE.id}`);
    expect(card.location).toBe("Կապան, Կենտրոն");
    expect(card.headline.startsWith("2-սենյականոց")).toBe(true);
    expect(card.imageCount).toBe(2);
  });
});

describe("catalogCard", () => {
  it("maps property cards from the card bag, cover only", () => {
    const card = catalogCard(catalogFixture({ card: { deal: "daily", rooms: 1, area: 40 } }));
    expect(card?.door).toBe("hotels");
    expect(card?.images).toEqual([PROPERTY_FIXTURE.images[0]]);
    expect(card?.badges).toEqual(["Օրավարձով"]);
  });

  it("returns null for categories not yet on the API, and for a card without a deal", () => {
    expect(catalogCard(catalogFixture({ category: "jobs" }))).toBeNull();
    expect(catalogCard(catalogFixture({ card: {} }))).toBeNull();
  });
});

describe("legacyCard", () => {
  it("keeps mock doors rendering as before", () => {
    expect(legacyCard(SERVICE_LISTINGS[0]).price).toBeNull();
    expect(legacyCard(WORK_LISTINGS[0]).headline).toBe(WORK_LISTINGS[0].title);
    const car = legacyCard(CAR_LISTINGS[0]);
    expect(car.door).toBe("cars");
    expect(car.price?.currency).toBe("USD");
    expect(car.href).toBe(`/cars/${CAR_LISTINGS[0].id}`);
  });
});

describe("sortCards", () => {
  const base = propertyCard(PROPERTY_FIXTURE);
  const card = (id: string, amount: number | null, currency: "USD" | "AMD", publishedAt: string): CardModel => ({
    ...base,
    id,
    publishedAt,
    price: { amount, currency, period: "total", negotiable: amount === null },
  });

  it("orders prices across currencies, negotiable last", () => {
    const cards = [
      card("a", 80_000, "AMD", "2026-09-01T00:00:00Z"),
      card("b", null, "USD", "2026-09-02T00:00:00Z"),
      card("c", 150, "USD", "2026-09-03T00:00:00Z"),
    ];
    expect(sortCards(cards, "price-asc").map((c) => c.id)).toEqual(["c", "a", "b"]);
    expect(sortCards(cards, "date-desc").map((c) => c.id)).toEqual(["c", "b", "a"]);
  });
});
```

- [ ] **Step 3: Run them to see them fail**

Run: `npm test -- src/lib/format.test.ts src/lib/property-format.test.ts src/lib/card.test.ts`
Expected: FAIL. `format.test.ts` fails its first case (the mock clock of 2026-09-04 makes it "հենց նոր"); the other two fail on unresolved imports.

- [ ] **Step 4: Use the real clock** — `src/lib/format.ts`

Change the signature of `formatRelativeDate` to `export function formatRelativeDate(iso: string, now: number = Date.now())`. Remove the `MOCK_NOW` import from `format.ts` if nothing else in the file uses it. Every element that renders `formatRelativeDate(...)` gets `suppressHydrationWarning`, because server and browser clocks can differ by a minute: the spans in `listing-card.tsx`, `new-arrivals.tsx`, `listing-details.tsx` and `my-listing-card.tsx` (the grep on `formatRelativeDate` in `src/components` lists all four).

- [ ] **Step 5: Write `src/lib/property-format.ts`**

```ts
import type { BuildingType, Deal, PropertyListing, PropertySubcategory } from "@/lib/api/types";
import { formatArea, formatNumber, plural, roomsLabel } from "@/lib/format";
import { label } from "@/lib/labels";
import { DOOR_BY_DEAL, doorSubcategoryLabel } from "@/lib/property-doors";
import type { Spec } from "@/lib/specs";

export const DEAL_LABEL: Record<Deal, string> = { sale: "Վաճառք", rent: "Վարձակալություն", daily: "Օրավարձ" };

/** Subcategories whose card leads with the kind of place instead of a room count. */
const KIND: Partial<Record<PropertySubcategory, string>> = {
  land: "Հողատարածք",
  commercial: "Կոմերցիոն տարածք",
  garages: "Ավտոտնակ",
  hotels: "Հյուրանոց",
};

const sotka = (value: number) => `${formatNumber(value)} ${plural(value, "սոտկա", "սոտկա")}`;
const has = (value: boolean | undefined) => (value ? "Կա" : "Չկա");

export function propertySummary(fields: { subcategory: string; rooms?: number; area?: number; landArea?: number }): string {
  const kind = KIND[fields.subcategory as PropertySubcategory];
  const lead = kind ?? (fields.rooms !== undefined ? roomsLabel(fields.rooms) : "");
  const size =
    fields.subcategory === "land"
      ? fields.landArea !== undefined
        ? sotka(fields.landArea)
        : ""
      : fields.area !== undefined
        ? formatArea(fields.area)
        : "";
  return [lead, size].filter(Boolean).join(" · ");
}

export function propertyBadges(fields: { deal: Deal; buildingType?: BuildingType }): string[] {
  const badges: string[] = [];
  if (fields.buildingType === "new") badges.push("Նորակառույց");
  if (fields.deal === "daily") badges.push("Օրավարձով");
  return badges;
}

export function propertyChips(listing: PropertyListing): string[] {
  const chips: string[] = [];
  if (listing.rooms !== undefined && !KIND[listing.subcategory]) chips.push(roomsLabel(listing.rooms));
  if (listing.area !== undefined) chips.push(formatArea(listing.area));
  if (listing.landArea !== undefined) chips.push(sotka(listing.landArea));
  if (listing.floor !== undefined && listing.totalFloors !== undefined) chips.push(`${listing.floor}/${listing.totalFloors} հարկ`);
  if (listing.condition) chips.push(label("reCondition", listing.condition));
  if (listing.landType) chips.push(label("landType", listing.landType));
  return chips;
}

export function propertySpecs(listing: PropertyListing): Spec[] {
  const door = DOOR_BY_DEAL[listing.deal];
  const specs: Spec[] = [
    { label: "Տեսակ", value: doorSubcategoryLabel(door, listing.subcategory) ?? listing.subcategory },
    { label: "Գործարք", value: DEAL_LABEL[listing.deal] },
  ];
  if (listing.rooms !== undefined) specs.push({ label: "Սենյակներ", value: listing.rooms ? String(listing.rooms) : "Ստուդիո" });
  if (listing.area !== undefined) specs.push({ label: "Ընդհանուր մակերես", value: formatArea(listing.area) });
  if (listing.landArea !== undefined) specs.push({ label: "Հողատարածք", value: sotka(listing.landArea) });
  if (listing.landType) specs.push({ label: "Հողի տեսակ", value: label("landType", listing.landType) });
  if (listing.floor !== undefined && listing.totalFloors !== undefined) {
    specs.push({ label: "Հարկ", value: `${listing.floor}-ը ${listing.totalFloors}-ից` });
  } else if (listing.totalFloors !== undefined) {
    specs.push({ label: "Հարկայնություն", value: String(listing.totalFloors) });
  }
  if (listing.bathrooms !== undefined) specs.push({ label: "Սանհանգույցներ", value: String(listing.bathrooms) });
  if (listing.condition) specs.push({ label: "Վիճակ", value: label("reCondition", listing.condition) });
  if (listing.buildingType) specs.push({ label: "Շենքի տեսակ", value: label("buildingType", listing.buildingType) });
  if (listing.buildYear) specs.push({ label: "Կառուցման տարի", value: String(listing.buildYear) });
  if (listing.ceilingHeight) specs.push({ label: "Առաստաղի բարձրություն", value: `${listing.ceilingHeight} մ` });

  if (listing.subcategory === "land" || listing.subcategory === "garages") {
    if (listing.water !== undefined) specs.push({ label: "Ջուր", value: has(listing.water) });
    if (listing.gas !== undefined) specs.push({ label: "Գազ", value: has(listing.gas) });
    if (listing.electricity !== undefined) specs.push({ label: "Էլեկտրաէներգիա", value: has(listing.electricity) });
    if (listing.pit !== undefined) specs.push({ label: "Յամա", value: has(listing.pit) });
    return specs;
  }
  specs.push(
    { label: "Կահույք", value: has(listing.furniture) },
    { label: "Պատշգամբ", value: has(listing.balcony) },
    { label: "Կայանատեղի", value: has(listing.parking) },
  );
  if (listing.deal === "daily" || listing.pool) specs.push({ label: "Լողավազան", value: has(listing.pool) });
  return specs;
}
```

- [ ] **Step 6: Write `src/lib/card.ts`**

```ts
import type { CatalogCard, Money, PropertyListing } from "@/lib/api/types";
import { listingHref } from "@/lib/categories";
import { locationText } from "@/lib/geo";
import { label } from "@/lib/labels";
import { convertAmount } from "@/lib/money";
import { DOOR_BY_DEAL, propertyHref } from "@/lib/property-doors";
import { propertyBadges, propertySummary } from "@/lib/property-format";
import { isDaily, isMonthly, listingSummary, locationLine } from "@/lib/specs";
import type { CategorySlug, Listing, SortKey } from "@/lib/types";

/** Everything a listing card renders, whichever source the listing came from. The approved spec
 * (4.7) fixes one card shape so the card has one implementation across API and mock doors. */
export interface CardModel {
  id: string;
  door: CategorySlug;
  href: string;
  title: string;
  /** Null hides the price row (services). */
  price: Money | null;
  location: string;
  /** Cover first. Catalog cards carry only the cover, so hover-scrub shows one image. */
  images: string[];
  imageCount: number;
  featured: boolean;
  verified: boolean;
  publishedAt: string;
  badges: string[];
  /** The card's title line: a size summary for property and cars, the job title for work. */
  headline: string;
  description?: string;
}

export function propertyCard(listing: PropertyListing): CardModel {
  return {
    id: listing.id,
    door: DOOR_BY_DEAL[listing.deal],
    href: propertyHref(listing),
    title: listing.title,
    price: listing.price,
    location: locationText(listing.city, listing.district),
    images: listing.images,
    imageCount: listing.images.length,
    featured: listing.featured,
    verified: listing.verified,
    publishedAt: listing.publishedAt,
    badges: propertyBadges(listing),
    headline: propertySummary(listing),
    description: listing.description,
  };
}

const num = (value: unknown) => (typeof value === "number" ? value : undefined);

/** Null for categories whose door is still on mock data (jobs, vehicles, services before their PRs). */
export function catalogCard(card: CatalogCard): CardModel | null {
  if (card.category !== "property") return null;
  const deal = card.card.deal;
  if (deal !== "sale" && deal !== "rent" && deal !== "daily") return null;
  return {
    id: card.id,
    door: DOOR_BY_DEAL[deal],
    href: propertyHref({ id: card.id, deal }),
    title: card.title,
    price: card.price,
    location: locationText(card.city, card.district),
    images: card.coverImage ? [card.coverImage] : [],
    imageCount: card.imageCount,
    featured: card.featured,
    verified: card.verified,
    publishedAt: card.publishedAt,
    badges: propertyBadges({ deal }),
    headline: propertySummary({
      subcategory: card.subcategory,
      rooms: num(card.card.rooms),
      area: num(card.card.area),
      landArea: num(card.card.landArea),
    }),
  };
}

/** Moved verbatim from listing-card.tsx; deleted with the last mock door. */
function legacyBadges(listing: Listing): string[] {
  const badges: string[] = [];
  if (listing.category === "real-estate") {
    if (listing.buildingType === "new") badges.push("Նորակառույց");
    if (listing.deal === "rent") badges.push("Վարձակալություն");
  } else if (listing.category === "rentals" || listing.category === "hotels") {
    badges.push(listing.term === "daily" ? "Օրավարձով" : "Երկարաժամկետ");
  } else if (listing.category === "work") {
    badges.push(label("employmentType", listing.employmentType));
  } else if (listing.category === "cars") {
    if (listing.fuel === "electric") badges.push("Էլեկտրական");
    if (listing.condition === "new") badges.push("Նոր");
    else if (listing.accidentFree) badges.push("Առանց ավարիայի");
  }
  return badges;
}

export function legacyCard(listing: Listing): CardModel {
  const period: Money["period"] = isDaily(listing) ? "night" : isMonthly(listing) ? "month" : "total";
  return {
    id: listing.id,
    door: listing.category,
    href: listingHref(listing),
    title: listing.title,
    price:
      listing.category === "services"
        ? null
        : { amount: listing.prices?.USD ?? listing.price, currency: "USD", period, negotiable: Boolean(listing.negotiable) },
    location: locationLine(listing),
    images: listing.images,
    imageCount: listing.images.length,
    featured: listing.urgent,
    verified: listing.verified,
    publishedAt: listing.publishedAt,
    badges: legacyBadges(listing),
    headline: listing.category === "work" ? listing.title : listingSummary(listing),
    description: listing.description,
  };
}

const usdValue = (card: CardModel) =>
  card.price?.amount == null ? null : convertAmount(card.price.amount, card.price.currency, "USD");
const newestFirst = (a: CardModel, b: CardModel) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt);

/** For lists merged in the browser (search). Server-paged lists keep the API's order. */
export function sortCards(cards: CardModel[], sort: SortKey): CardModel[] {
  const copy = [...cards];
  if (sort === "price-asc" || sort === "price-desc") {
    const direction = sort === "price-asc" ? 1 : -1;
    return copy.sort((a, b) => {
      const x = usdValue(a);
      const y = usdValue(b);
      if (x === null || y === null) return x === y ? newestFirst(a, b) : x === null ? 1 : -1;
      return (x - y) * direction || newestFirst(a, b);
    });
  }
  if (sort === "relevant") return copy.sort((a, b) => Number(b.featured) - Number(a.featured) || newestFirst(a, b));
  return copy.sort(newestFirst);
}
```

- [ ] **Step 7: Run the tests**

Run: `npm test -- src/lib/format.test.ts src/lib/property-format.test.ts src/lib/card.test.ts`
Expected: 12 tests pass.

- [ ] **Step 8: Render `CardModel` in `ListingCard` and `ListingGrid`**

`listing-card.tsx`: the prop `listing: Listing` becomes `card: CardModel`; delete `accentBadges` (now `legacyBadges` in `card.ts`). Replace each read as follows and nothing else:

| Before | After |
| --- | --- |
| `accentBadges(listing)` | `card.badges` |
| `listing.images` (array uses) | `card.images` |
| `{listing.images.length}` in the count badges | `{card.imageCount}` |
| `listingHref(listing)` | `card.href` |
| `listing.title`, `listing.id` | `card.title`, `card.id` |
| `listing.urgent && <Badge variant="destructive">Հրատապ</Badge>` | `card.featured && <Badge variant="destructive">Առանձնացված</Badge>` |
| `listing.verified` | `card.verified` |
| `const showPrice = listing.category !== "services"` | `const price = card.price` |
| `{listing.category === "work" ? listing.title : listingSummary(listing)}` | `{card.headline}` |
| `{locationLine(listing)}` | `{card.location}` |
| `{listing.description}` | `{card.description}`, rendered only when `!hideDescription && card.description` |
| `{formatRelativeDate(listing.publishedAt)}` | `{formatRelativeDate(card.publishedAt)}` |

Guard the photo: render the `<Image>` only when `card.images.length > 0` (catalog cards may have no cover), and compute `unoptimized` from `card.images[activeIndex]?.startsWith("blob:")`. Replace the whole price row with:

```tsx
const display = toDisplayCurrency(currency);
// …
{price ? (
  <div className="flex items-center justify-between gap-2">
    <span className="text-[15px] font-semibold tracking-tight text-foreground sm:text-[22px]">
      {formatAmount(price, display)}
      {price.amount !== null && periodLabel(price.period) && (
        <span className="ml-1 text-[11px] font-normal text-accent sm:text-[13px]">{periodLabel(price.period)}</span>
      )}
    </span>
    {verifiedBadge}
  </div>
) : null}
```

and the `{!showPrice && verifiedBadge}` beside the title becomes `{!price && verifiedBadge}`. Imports: drop `listingHref`, `formatPrice`, `label`, `isDaily`, `isMonthly`, `listingSummary`, `locationLine`, `Listing`; add `formatAmount`, `periodLabel`, `toDisplayCurrency` from `@/lib/money` and `type CardModel` from `@/lib/card`.

`listing-grid.tsx`: prop `listings: Listing[]` becomes `cards: CardModel[]`; the map renders `<ListingCard key={card.id} card={card} … />`.

- [ ] **Step 9: Move every caller to cards**

Run: `npm run typecheck`. It now fails at each caller. Fix each one:

| File | Change |
| --- | --- |
| `category-page.tsx` | `listings={pageItems}` → `cards={pageItems.map(legacyCard)}` |
| `search-results.tsx` | `listings={visible}` → `cards={visible.map(legacyCard)}` (Task 10 replaces this) |
| `favorites-view.tsx` | `listings={[]}` → `cards={[]}`; `listings={visible}` → `cards={visible.map(legacyCard)}` (Task 10 replaces this) |
| `listing-details.tsx` | `<ListingCard listing={item}` → `<ListingCard card={legacyCard(item)}` (Task 8 replaces this) |
| `hits-section.tsx` | prop `listings: Listing[]` → `cards: CardModel[]`; render `<ListingCard card={card} …>` |
| `new-arrivals.tsx` | prop `listings` → `cards: CardModel[]`; see below |
| `src/app/page.tsx` | each `listings={X}` → `cards={X.map(legacyCard)}` (Task 9 replaces the property ones) |

In `new-arrivals.tsx`, inside the map: `const category = CATEGORIES[card.door]`; `listingHref(listing)` → `card.href`; `listing.images[0]` → `card.images[0]`, rendering the `<Image>` only when it exists; `listingSummary(listing)` → `card.headline`; `locationLine(listing)` → `card.location`; `listing.id` → `card.id`; `listing.title` → `card.title`. Replace the price span's contents with:

```tsx
{card.price && (
  <>
    {formatAmount(card.price, toDisplayCurrency(currency))}
    {card.price.amount !== null && periodLabel(card.price.period) && (
      <span className="ml-0.5 text-[11px] font-normal text-white/80">{periodLabel(card.price.period)}</span>
    )}
  </>
)}
```

- [ ] **Step 10: Check nothing changed on screen**

Run: `npm run typecheck && npm run lint && npm test && npm run dev`. Open `http://localhost:3000/`, `/cars`, `/real-estate`, `/favorites` (after hearting two listings) and `/search?q=Կապան`. Expected: the same cards as before this task, with relative dates now measured from today, and the "urgent" badge reading "Առանձնացված".

- [ ] **Step 11: Commit**

```bash
git add src/lib/property-format.ts src/lib/property-format.test.ts src/lib/card.ts src/lib/card.test.ts src/lib/format.ts src/lib/format.test.ts src/test/fixtures.ts src/components src/app/page.tsx
git commit -m "refactor(listings): one card model for API and mock listings; real clock for dates

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Property door pages on the API

**Files:**
- Create: `src/components/category/property-door-page.tsx` (server), `src/components/category/property-category-page.tsx` (client), `src/components/filters/property-filters.tsx`, `src/app/error.tsx`
- Modify: `src/lib/property-filters.ts` (`toSearchParams`), `src/components/filters/filter-panel.tsx`, `src/components/filters/filter-drawer.tsx`, `src/lib/structured-data.ts` (`categoryItemListJsonLd`), `src/lib/categories.ts` (`source`), `src/app/{real-estate,rentals,hotels,cars,work,services}/page.tsx`
- Test: `src/lib/property-filters.test.ts` (one new case)

**Interfaces:**
- Consumes: Tasks 2 to 6.
- Produces:
  - `toSearchParams(record: Record<string, string | string[] | undefined>): URLSearchParams`
  - `type DistributiveOmit<T, K extends PropertyKey>`; `FilterPanelProps` now accepts either `{ category, filters, onChange }` or `{ renderFields: (mobile: boolean) => React.ReactNode }`
  - `<PropertyDoorPage door searchParams />` (async server component)
  - `<PropertyCategoryPage door state cards total facets />`
  - `<PropertyFilterFields door filters onChange facets mobile? />`
  - `categoryItemListJsonLd(name: string, path: string, items: { href: string }[])`
  - `CategoryConfig.source: "api" | "mock"` and `API_DOORS`, `MOCK_DOORS: CategorySlug[]` in `@/lib/categories`

- [ ] **Step 1: Write the failing test** — append to `src/lib/property-filters.test.ts`

```ts
import { toSearchParams } from "./property-filters";

describe("toSearchParams", () => {
  it("takes the first value of repeated params and skips undefined", () => {
    const params = toSearchParams({ city: ["kapan", "goris"], page: "2", q: undefined });
    expect(params.toString()).toBe("city=kapan&page=2");
  });
});
```

(Merge the new import into the file's existing `./property-filters` import.)

- [ ] **Step 2: Run it to see it fail**

Run: `npm test -- src/lib/property-filters.test.ts`
Expected: FAIL, `toSearchParams is not a function`.

- [ ] **Step 3: Add `toSearchParams`** to `src/lib/property-filters.ts`

```ts
/** Next passes page `searchParams` as a record; repeated keys arrive as arrays. */
export function toSearchParams(record: Record<string, string | string[] | undefined>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(record)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first !== undefined) params.set(key, first);
  }
  return params;
}
```

Run: `npm test -- src/lib/property-filters.test.ts`
Expected: 10 tests pass.

- [ ] **Step 4: Mark door sources** — `src/lib/categories.ts`

Add to `CategoryConfig`:

```ts
  /** "api" once the door reads InSyunik-Api; "mock" until its module PR lands (spec W11). */
  source: "api" | "mock";
```

Set `source: "api"` on `real-estate`, `rentals` and `hotels`, and `source: "mock"` on `cars`, `work` and `services`. After `CATEGORY_LIST`, add:

```ts
export const API_DOORS = CATEGORY_LIST.filter((c) => c.source === "api").map((c) => c.slug);
export const MOCK_DOORS = CATEGORY_LIST.filter((c) => c.source === "mock").map((c) => c.slug);
```

- [ ] **Step 5: Let the filter panel take any field set**

In `src/components/filters/filter-panel.tsx`, replace the `FilterPanelProps` interface with:

```ts
export type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

type FieldSource =
  | {
      category: CategorySlug;
      filters: AnyFilters;
      onChange: (patch: Partial<AnyFilters>) => void;
      renderFields?: never;
    }
  | {
      /** Doors on the API render their own fields; `mobile` is true inside the drawer. */
      renderFields: (mobile: boolean) => React.ReactNode;
      category?: never;
      filters?: never;
      onChange?: never;
    };

export type FilterPanelProps = FieldSource & {
  onApply: () => void;
  onReset: () => void;
  activeCount: number;
  resultCount: number;
  className?: string;
  /** Drawer mode gets a sticky action bar pinned to the bottom of the sheet. */
  variant?: "sidebar" | "drawer";
};
```

Change `export function FilterPanel({ category, filters, onChange, onApply, … }: FilterPanelProps)` to take `props: FilterPanelProps`, destructure `const { onApply, onReset, activeCount, resultCount, className, variant = "sidebar" } = props;`, and replace the `<FilterFields … />` line with:

```tsx
{props.renderFields ? (
  isDrawer ? <SingleOpenAccordion>{props.renderFields(true)}</SingleOpenAccordion> : props.renderFields(false)
) : (
  <FilterFields category={props.category} filters={props.filters} onChange={props.onChange} mobile={isDrawer} />
)}
```

Add `import type * as React from "react";` if the file has no React import. `FilterFields` itself (`Pick<FilterPanelProps, "category" | "filters" | "onChange">`) now picks from a union; give it its own explicit props type instead:

```ts
export function FilterFields({
  category,
  filters,
  onChange,
  mobile = false,
}: {
  category: CategorySlug;
  filters: AnyFilters;
  onChange: (patch: Partial<AnyFilters>) => void;
  mobile?: boolean;
}) {
```

In `src/components/filters/filter-drawer.tsx`:

```tsx
"use client";

import { FilterPanel, type DistributiveOmit, type FilterPanelProps } from "@/components/filters/filter-panel";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type FilterDrawerProps = DistributiveOmit<FilterPanelProps, "variant"> & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Bottom sheet on phones, centred dialog on tablets and up. */
export function FilterDrawer(props: FilterDrawerProps) {
  const { open, onOpenChange, onApply } = props;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="sheet" className="flex max-h-[92vh] flex-col overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b border-border px-4 py-4">
          <DialogTitle>Ֆիլտրեր</DialogTitle>
        </DialogHeader>
        <FilterPanel
          {...props}
          variant="drawer"
          onApply={() => {
            onApply();
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
```

Run: `npm run typecheck`. Expected: exits 0; the mock doors' `CategoryPage` still passes `category`, `filters` and `onChange` and matches the first union member.

- [ ] **Step 6: Write the property filter fields** — `src/components/filters/property-filters.tsx`

```tsx
"use client";

import {
  ChipGroup,
  FilterSection,
  MultiSelectField,
  PriceRangeField,
  RangeFields,
  SelectField,
  ToggleRow,
  type PriceBounds,
} from "@/components/filters/filter-fields";
import { cityValues } from "@/lib/api/schema";
import type { City, Facets } from "@/lib/api/types";
import { CITY_LABEL, DISTRICT_LABEL, districtsOf } from "@/lib/geo";
import { PROPERTY_DOORS, type PropertyDoor } from "@/lib/property-doors";
import type { PropertyFilters } from "@/lib/property-filters";
import { BUILDING_TYPES, RE_CONDITIONS, ROOMS_OPTIONS } from "@/mock/taxonomy";

/** Slider range in USD per door; the typed inputs accept any value. */
const PRICE_BOUNDS: Record<PropertyDoor, PriceBounds> = {
  "real-estate": { min: 0, max: 300000, step: 1000 },
  rentals: { min: 0, max: 3000, step: 50 },
  hotels: { min: 0, max: 500, step: 10 },
};

/** Subcategories that have no room count in the contract (rooms is forbidden or meaningless). */
const NO_ROOMS = new Set(["land", "garages", "commercial", "hotels"]);
const WITH_FLOORS = new Set(["", "apartments", "new-buildings", "commercial"]);

const withCount = (text: string, count: number | undefined) => (count === undefined ? text : `${text} (${count})`);

interface Props {
  door: PropertyDoor;
  filters: PropertyFilters;
  onChange: (patch: Partial<PropertyFilters>) => void;
  facets: Facets;
  mobile?: boolean;
}

export function PropertyFilterFields({ door, filters, onChange, facets, mobile = false }: Props) {
  const open = !mobile;
  const subcategoryOptions = PROPERTY_DOORS[door].subcategories.map((option) => ({
    value: option.value,
    label: withCount(option.label, facets.subcategory?.[option.value]),
    icon: option.icon,
  }));
  const cityOptions = cityValues.map((city) => ({ value: city, label: withCount(CITY_LABEL[city], facets.city?.[city]) }));
  const districtOptions = districtsOf(filters.city).map((district) => ({ value: district, label: DISTRICT_LABEL[district] }));
  const conditionOptions = RE_CONDITIONS.map((option) => ({
    ...option,
    label: withCount(option.label, facets.condition?.[option.value]),
  }));

  return (
    <>
      <FilterSection title="Տեսակ" defaultOpen={open}>
        <SelectField
          value={filters.subcategory}
          onChange={(value) => onChange({ subcategory: value as PropertyFilters["subcategory"] })}
          options={subcategoryOptions}
          placeholder="Ցանկացած տեսակ"
          anyLabel="Ցանկացած տեսակ"
        />
      </FilterSection>

      <FilterSection title="Տեղադրություն" defaultOpen={open}>
        <MultiSelectField
          values={filters.city}
          onChange={(city) => onChange({ city: city as City[], district: "" })}
          options={cityOptions}
          placeholder="Ողջ Սյունիք"
          anyLabel="Ողջ Սյունիք"
        />
        {districtOptions.length > 0 && (
          <div className="mt-3">
            <SelectField
              value={filters.district}
              onChange={(value) => onChange({ district: value as PropertyFilters["district"] })}
              options={districtOptions}
              placeholder="Բոլոր թաղամասերը"
              anyLabel="Բոլոր թաղամասերը"
            />
          </div>
        )}
      </FilterSection>

      <FilterSection title="Գին" defaultOpen={open}>
        <PriceRangeField
          currency={filters.cur || "USD"}
          onCurrencyChange={(currency) => onChange({ cur: currency === "AMD" ? "AMD" : "USD" })}
          from={filters.priceMin}
          to={filters.priceMax}
          onFrom={(priceMin) => onChange({ priceMin })}
          onTo={(priceMax) => onChange({ priceMax })}
          bounds={PRICE_BOUNDS[door]}
        />
      </FilterSection>

      {!NO_ROOMS.has(filters.subcategory) && (
        <FilterSection title="Սենյակներ" defaultOpen={open}>
          <ChipGroup
            options={ROOMS_OPTIONS}
            values={filters.rooms}
            onChange={(rooms) => onChange({ rooms: rooms as PropertyFilters["rooms"] })}
            multiple
            fullWidth
          />
        </FilterSection>
      )}

      <FilterSection title="Մակերես" defaultOpen={open}>
        <RangeFields
          from={filters.areaMin}
          to={filters.areaMax}
          onFrom={(areaMin) => onChange({ areaMin })}
          onTo={(areaMax) => onChange({ areaMax })}
          suffix="մ²"
        />
      </FilterSection>

      {WITH_FLOORS.has(filters.subcategory) && (
        <FilterSection title="Հարկ" defaultOpen={open}>
          <RangeFields
            from={filters.floorMin}
            to={filters.floorMax}
            onFrom={(floorMin) => onChange({ floorMin })}
            onTo={(floorMax) => onChange({ floorMax })}
          />
        </FilterSection>
      )}

      {door === "real-estate" && (
        <FilterSection title="Վիճակ" defaultOpen={open}>
          <ChipGroup
            options={conditionOptions}
            values={filters.condition}
            onChange={(condition) => onChange({ condition: condition as PropertyFilters["condition"] })}
            multiple
          />
          <div className="mt-3">
            <ChipGroup
              options={BUILDING_TYPES}
              values={filters.buildingType ? [filters.buildingType] : []}
              onChange={(values) => onChange({ buildingType: (values[0] ?? "") as PropertyFilters["buildingType"] })}
              fullWidth
            />
          </div>
        </FilterSection>
      )}

      <FilterSection title="Հարմարություններ" defaultOpen={open}>
        <div className="space-y-1">
          <ToggleRow label="Կահույք" checked={filters.furniture} onChange={(furniture) => onChange({ furniture })} />
          <ToggleRow label="Պատշգամբ" checked={filters.balcony} onChange={(balcony) => onChange({ balcony })} />
          <ToggleRow label="Կայանատեղի" checked={filters.parking} onChange={(parking) => onChange({ parking })} />
          {door === "hotels" && (
            <ToggleRow label="Լողավազան" checked={filters.pool} onChange={(pool) => onChange({ pool })} />
          )}
          <ToggleRow label="Միայն լուսանկարով" checked={filters.withPhoto} onChange={(withPhoto) => onChange({ withPhoto })} />
          <ToggleRow
            label="Միայն ստուգվածները"
            checked={filters.verifiedOnly}
            onChange={(verifiedOnly) => onChange({ verifiedOnly })}
          />
        </div>
      </FilterSection>
    </>
  );
}
```

- [ ] **Step 7: Write the client island** — `src/components/category/property-category-page.tsx`

```tsx
"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { CityAccent } from "@/components/city-accent";
import { FilterDrawer } from "@/components/filters/filter-drawer";
import { FilterPanel } from "@/components/filters/filter-panel";
import { PropertyFilterFields } from "@/components/filters/property-filters";
import { Link } from "@/components/i18n/locale-link";
import { EmptyState } from "@/components/listings/empty-state";
import { ListingGrid } from "@/components/listings/listing-grid";
import { Pagination } from "@/components/listings/pagination";
import { ResultsToolbar } from "@/components/listings/results-toolbar";
import { FloatingTabs } from "@/components/ui/floating-tabs";
import { createApi } from "@/lib/api/client";
import { searchProperty } from "@/lib/api/property";
import { propertySortKeyValues } from "@/lib/api/schema";
import type { Facets, PropertySortKey } from "@/lib/api/types";
import type { CardModel } from "@/lib/card";
import { CATEGORIES } from "@/lib/categories";
import { PAGE_SIZE } from "@/lib/constants";
import { PROPERTY_DOORS, doorSubcategoryLabel, type PropertyDoor } from "@/lib/property-doors";
import {
  DEFAULT_PROPERTY_FILTERS,
  countActivePropertyFilters,
  propertyStateToSearch,
  toPropertyQuery,
  type PropertyFilters,
  type PropertyPageState,
} from "@/lib/property-filters";
import type { SortKey, ViewMode } from "@/lib/types";

interface Props {
  door: PropertyDoor;
  state: PropertyPageState;
  cards: CardModel[];
  total: number;
  facets: Facets;
}

const COUNT_DEBOUNCE_MS = 300;

export function PropertyCategoryPage({ door, state, cards, total, facets }: Props) {
  const config = CATEGORIES[door];
  const router = useRouter();
  const pathname = usePathname();
  const [draft, setDraft] = React.useState<PropertyFilters>(state.filters);
  const [draftCount, setDraftCount] = React.useState(total);
  const [view, setView] = React.useState<ViewMode>("grid");
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  // The server sends fresh state on every navigation; the draft follows it.
  React.useEffect(() => {
    setDraft(state.filters);
    setDraftCount(total);
  }, [state.filters, total]);

  // Live count for the apply button: one pageSize=1 request per settled draft, stale ones aborted.
  React.useEffect(() => {
    if (draft === state.filters) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      searchProperty(createApi(), { ...toPropertyQuery(door, { ...state, filters: draft, page: 1 }), pageSize: 1 }, controller.signal)
        .then((page) => setDraftCount(page.total))
        .catch((error: unknown) => {
          if (!controller.signal.aborted) console.warn("Filter count request failed", error);
        });
    }, COUNT_DEBOUNCE_MS);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [door, draft, state]);

  const navigate = React.useCallback(
    (next: PropertyPageState) => {
      startTransition(() => router.push(`${pathname}${propertyStateToSearch(next)}`, { scroll: false }));
    },
    [pathname, router],
  );

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const subcategory = state.filters.subcategory;
  const subcategoryLabel = subcategory ? doorSubcategoryLabel(door, subcategory) : undefined;

  function applyDraft() {
    navigate({ ...state, filters: draft, page: 1 });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetFilters() {
    setDraft(DEFAULT_PROPERTY_FILTERS);
    navigate({ filters: DEFAULT_PROPERTY_FILTERS, sort: state.sort, page: 1 });
  }

  function changeSort(next: SortKey) {
    const sort = (propertySortKeyValues as readonly string[]).includes(next) ? (next as PropertySortKey) : "relevant";
    navigate({ ...state, sort, page: 1 });
  }

  function changePage(page: number) {
    navigate({ ...state, page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function selectSubcategory(value: string) {
    navigate({ ...state, filters: { ...state.filters, subcategory: value as PropertyFilters["subcategory"] }, page: 1 });
  }

  const renderFields = (mobile: boolean) => (
    <PropertyFilterFields
      door={door}
      filters={draft}
      onChange={(patch) => setDraft((prev) => ({ ...prev, ...patch }))}
      facets={facets}
      mobile={mobile}
    />
  );
  const activeCount = countActivePropertyFilters(state.filters);

  return (
    <div className="container py-5 lg:py-8">
      <nav className="flex flex-wrap items-center gap-1 text-xs text-foreground/70 sm:gap-1.5 sm:text-[13px]">
        <span className={subcategoryLabel ? "hidden sm:contents" : "contents"}>
          <Link href="/" className="transition-colors hover:text-foreground">
            Գլխավոր
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
        </span>
        <span className="font-medium text-foreground">
          {config.mobileLabel && <span className="sm:hidden">{config.mobileLabel}</span>}
          <span className={config.mobileLabel ? "hidden sm:inline" : undefined}>{config.label}</span>
        </span>
        {subcategoryLabel && (
          <>
            <ChevronRight className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
            <span className="font-medium text-foreground">{subcategoryLabel}</span>
          </>
        )}
      </nav>

      <h1 className="mt-3 text-base font-semibold tracking-tight sm:text-2xl lg:text-[28px]">
        {subcategoryLabel ?? config.label}
        <CityAccent />
      </h1>

      <FloatingTabs
        className="mt-4 hidden sm:flex"
        items={[{ value: "", label: "Բոլորը" }, ...PROPERTY_DOORS[door].subcategories]}
        value={subcategory}
        onChange={selectSubcategory}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-[124px] rounded-lg border border-border bg-card p-4">
            <FilterPanel
              renderFields={renderFields}
              onApply={applyDraft}
              onReset={resetFilters}
              activeCount={activeCount}
              resultCount={draftCount}
            />
          </div>
        </aside>

        <section className="space-y-4">
          <ResultsToolbar
            category={door}
            total={total}
            sort={state.sort}
            onSortChange={changeSort}
            view={view}
            onViewChange={setView}
            onOpenFilters={() => setDrawerOpen(true)}
            activeFilters={activeCount}
          />

          {cards.length === 0 && !isPending ? (
            <EmptyState
              title="Ոչինչ չի գտնվել"
              description="Փորձեք փոխել ֆիլտրերը կամ ընդլայնել գնի միջակայքը — այս ընտրանքում համապատասխան հայտարարություններ չկան։"
              action={{ label: "Զրոյացնել ֆիլտրերը", onClick: resetFilters }}
              secondaryAction={{ label: "Հրապարակել հայտարարություն", href: "/create" }}
            />
          ) : (
            <ListingGrid
              cards={cards}
              view={view}
              loading={isPending}
              skeletonCount={Math.min(PAGE_SIZE, Math.max(cards.length, 6))}
              columns={3}
              dense
            />
          )}

          <Pagination page={Math.min(state.page, totalPages)} totalPages={totalPages} onPageChange={changePage} className="pt-2" />
        </section>
      </div>

      <FilterDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        renderFields={renderFields}
        onApply={applyDraft}
        onReset={resetFilters}
        activeCount={activeCount}
        resultCount={draftCount}
      />
    </div>
  );
}
```

`FloatingTabs` takes `FloatingTabItem[]`; if its type rejects the `icon` field of `SubcategoryOption`, map to `{ value, label }` instead.

- [ ] **Step 8: Write the server loader** — `src/components/category/property-door-page.tsx`

```tsx
import { redirect } from "next/navigation";
import { PropertyCategoryPage } from "@/components/category/property-category-page";
import { JsonLd } from "@/components/seo/json-ld";
import { createApi } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { getPropertyFacets, searchProperty } from "@/lib/api/property";
import { propertyCard } from "@/lib/card";
import { CATEGORIES } from "@/lib/categories";
import type { PropertyDoor } from "@/lib/property-doors";
import {
  parsePropertyState,
  stripRejectedParams,
  toPropertyFacetQuery,
  toPropertyQuery,
  toSearchParams,
} from "@/lib/property-filters";
import { breadcrumbJsonLd, categoryItemListJsonLd } from "@/lib/structured-data";

interface Props {
  door: PropertyDoor;
  searchParams: Record<string, string | string[] | undefined>;
}

export async function PropertyDoorPage({ door, searchParams }: Props) {
  const params = toSearchParams(searchParams);
  const state = parsePropertyState(door, params);
  const api = createApi();

  let result;
  try {
    const [page, facets] = await Promise.all([
      searchProperty(api, toPropertyQuery(door, state)),
      getPropertyFacets(api, toPropertyFacetQuery(door, state.filters)),
    ]);
    result = { page, facets };
  } catch (error) {
    // Parsing already drops unknown values; a 400 here means a value passed our checks but not the
    // API's. Drop exactly the rejected parameters and reload once. Anything else reaches error.tsx.
    if (error instanceof ApiError && error.status === 400) {
      const current = params.toString() ? `?${params}` : "";
      const next = stripRejectedParams(params, error.errors);
      if (next !== current) redirect(`/${door}${next}`);
    }
    throw error;
  }

  const config = CATEGORIES[door];
  const cards = result.page.items.map(propertyCard);
  return (
    <>
      <JsonLd
        data={[
          categoryItemListJsonLd(config.label, config.href, cards),
          breadcrumbJsonLd([
            { name: "Գլխավոր", path: "/" },
            { name: config.label, path: config.href },
          ]),
        ]}
      />
      <PropertyCategoryPage door={door} state={state} cards={cards} total={result.page.total} facets={result.facets} />
    </>
  );
}
```

- [ ] **Step 9: Point the routes at it**

`src/app/real-estate/page.tsx` (keep its existing `metadata` export unchanged):

```tsx
import type { Metadata } from "next";
import { PropertyDoorPage } from "@/components/category/property-door-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Անշարժ գույքի վաճառք",
  description: "Բնակարաններ, տներ, նորակառույցներ, կոմերցիոն անշարժ գույք և հողատարածքներ։",
  alternates: { canonical: "/real-estate" },
};

export default function RealEstatePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return <PropertyDoorPage door="real-estate" searchParams={searchParams} />;
}
```

Do the same in `src/app/rentals/page.tsx` (`door="rentals"`) and `src/app/hotels/page.tsx` (`door="hotels"`), each keeping its own `metadata` object exactly as it is today and dropping the imports it no longer uses.

- [ ] **Step 10: Item lists take cards** — `src/lib/structured-data.ts`

```ts
export function categoryItemListJsonLd(name: string, path: string, items: { href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    url: absoluteUrl(path),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.slice(0, 24).map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(item.href),
      })),
    },
  };
}
```

In `src/app/cars/page.tsx`, `src/app/work/page.tsx` and `src/app/services/page.tsx`, pass `category.listings.map(legacyCard)` instead of `category.listings`, importing `legacyCard` from `@/lib/card`.

- [ ] **Step 11: Error boundary** — `src/app/error.tsx`

```tsx
"use client";

import { Button } from "@/components/ui/button";

/** Shown when a page's API call fails for any reason other than a 404. */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container flex flex-col items-center py-20 text-center">
      <h1 className="text-xl font-semibold tracking-tight">Չհաջողվեց բեռնել էջը</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Կապը սերվերի հետ ընդհատվեց։ Ստուգեք ինտերնետը և փորձեք կրկին։
      </p>
      <Button variant="accent" className="mt-6" onClick={reset}>
        Կրկին փորձել
      </Button>
    </div>
  );
}
```

- [ ] **Step 12: Verify against the running API**

Run: `npm run typecheck && npm run lint && npm test`, then `npm run dev` with the API from the preconditions running.

| Visit | Expected |
| --- | --- |
| `/real-estate` | 15 results, 2 pages; the filter panel lists cities with counts |
| `/rentals` | 13 results |
| `/hotels` | 16 results; tabs hotels, guesthouses, houses, apartments |
| `/rentals?city=kapan` | 4 results |
| `/real-estate?sort=price-asc` | first card is the cheapest sale, $ 6 500 |
| `/real-estate?rooms=9&city=paris` | loads with no filters applied (values dropped) |
| Change a filter in the sidebar without applying | the apply button's count updates within about half a second |
| `/real-estate` with the API stopped | the error page with "Կրկին փորձել" |
| `/cars` | unchanged, mock data |

- [ ] **Step 13: Commit**

```bash
git add src/components/category src/components/filters src/lib/property-filters.ts src/lib/property-filters.test.ts src/lib/structured-data.ts src/lib/categories.ts src/app
git commit -m "feat(property): real-estate, rentals and hotels doors read the API

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Property detail pages on the API

**Files:**
- Create: `src/lib/detail.ts`, `src/components/listing/property-detail-page.tsx`
- Modify: `src/lib/seo.ts`, `src/lib/structured-data.ts`, `src/components/listing/listing-details.tsx`, `price-tag.tsx`, `seller-card.tsx`, `mobile-contact-bar.tsx`, `src/app/{real-estate,rentals,hotels,cars,work,services}/[id]/page.tsx`
- Test: `src/lib/detail.test.ts`, `src/lib/seo.test.ts`, `src/lib/structured-data.test.ts`

**Interfaces:**
- Consumes: Tasks 2 to 6.
- Produces:
  - `interface DetailSeller { name: string; avatarUrl?: string; typeLabel: string; phone: string }`
  - `interface DetailModel { id; door: CategorySlug; subcategory; subcategoryLabel?; title; description; price: Money | null; verified; images: string[]; heroImage: boolean; headline; chips: string[]; specs: Spec[]; location; address?; coords?: { lat: number; lng: number }; isWorkplace: boolean; publishedAt; reference; seller: DetailSeller | null }`
  - `propertyDetail(listing: PropertyListing): DetailModel`, `legacyDetail(listing: Listing, seller: Seller | undefined): DetailModel`, `formatPhone(raw: string): string`, `SELLER_TYPE_LABEL: Record<SellerType, string>`
  - `buildDescription(parts: { title: string; price?: string; location: string; description: string }): string`
  - `propertyListingJsonLd(listing: PropertyListing): object`
  - `<ListingDetails detail similar />` with `similar: CardModel[]`; `<PriceTag money className? />`; `<SellerCard seller: DetailSeller />`
  - `propertyDetailMetadata(door: PropertyDoor, id: string): Promise<Metadata>`, `<PropertyDetailPage door id />`

- [ ] **Step 1: Write the failing tests**

`src/lib/detail.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { PROPERTY_FIXTURE } from "@/test/fixtures";
import { getSeller } from "@/mock/sellers";
import { WORK_LISTINGS } from "@/mock/work";
import { formatPhone, legacyDetail, propertyDetail } from "./detail";

describe("propertyDetail", () => {
  it("maps the contract listing, seller included", () => {
    const detail = propertyDetail(PROPERTY_FIXTURE);
    expect(detail.door).toBe("rentals");
    expect(detail.reference).toBe("947E6113");
    expect(detail.heroImage).toBe(false);
    expect(detail.location).toBe("Կապան, Կենտրոն");
    expect(detail.seller).toEqual({
      name: "Արթուր Մկրտչյան",
      avatarUrl: undefined,
      typeLabel: "Ֆիզիկական անձ",
      phone: "+374 91 45 22 18",
    });
  });

  it("tolerates a listing without its seller", () => {
    expect(propertyDetail({ ...PROPERTY_FIXTURE, seller: undefined }).seller).toBeNull();
  });
});

describe("legacyDetail", () => {
  it("keeps the work layout: hero photo, workplace heading", () => {
    const job = WORK_LISTINGS[0];
    const detail = legacyDetail(job, getSeller(job.sellerId));
    expect(detail.heroImage).toBe(true);
    expect(detail.isWorkplace).toBe(true);
    expect(detail.reference).toBe(job.id.toUpperCase());
  });
});

describe("formatPhone", () => {
  it("groups Armenian numbers and leaves others alone", () => {
    expect(formatPhone("+37491452218")).toBe("+374 91 45 22 18");
    expect(formatPhone("+1 555 0100")).toBe("+1 555 0100");
  });
});
```

`src/lib/seo.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildDescription } from "./seo";

describe("buildDescription", () => {
  it("leads with price and place, then a word-bounded excerpt", () => {
    const text = buildDescription({
      title: "Բնակարան",
      price: "$ 300/ամիս",
      location: "Կապան",
      description: "բառ ".repeat(100),
    });
    expect(text.startsWith("Բնակարան — $ 300/ամիս, Կապան. ")).toBe(true);
    expect(text.length).toBeLessThanOrEqual(160);
    expect(text.endsWith(" ")).toBe(false);
  });

  it("omits the price clause when there is none", () => {
    expect(buildDescription({ title: "Ծառայություն", location: "Գորիս", description: "Կարճ" })).toBe(
      "Ծառայություն, Գորիս. Կարճ",
    );
  });
});
```

`src/lib/structured-data.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { PROPERTY_FIXTURE } from "@/test/fixtures";
import { propertyListingJsonLd } from "./structured-data";

describe("propertyListingJsonLd", () => {
  it("takes the currency from the listing and leases out rentals", () => {
    const data = propertyListingJsonLd({ ...PROPERTY_FIXTURE, price: { ...PROPERTY_FIXTURE.price, currency: "AMD" } });
    expect(data.offers.priceCurrency).toBe("AMD");
    expect(data.offers.businessFunction).toBe("http://purl.org/goodrelations/v1#LeaseOut");
    expect(data.url.endsWith(`/rentals/${PROPERTY_FIXTURE.id}`)).toBe(true);
  });

  it("claims no price for a negotiable listing without an amount", () => {
    const data = propertyListingJsonLd({
      ...PROPERTY_FIXTURE,
      price: { amount: null, currency: "USD", period: "month", negotiable: true },
    });
    expect("price" in data.offers).toBe(false);
  });
});
```

- [ ] **Step 2: Run them to see them fail**

Run: `npm test -- src/lib/detail.test.ts src/lib/seo.test.ts src/lib/structured-data.test.ts`
Expected: FAIL, unresolved `./detail`, and `buildDescription` / `propertyListingJsonLd` not exported.

- [ ] **Step 3: Write `src/lib/detail.ts`**

```ts
import type { Money, PropertyListing, SellerType } from "@/lib/api/types";
import { legacyCard } from "@/lib/card";
import { CATEGORIES } from "@/lib/categories";
import { locationText } from "@/lib/geo";
import { DOOR_BY_DEAL, doorSubcategoryLabel } from "@/lib/property-doors";
import { propertyChips, propertySpecs, propertySummary } from "@/lib/property-format";
import { cardSpecs, detailSpecs, listingSummary, locationLine, type Spec } from "@/lib/specs";
import type { CategorySlug, Listing, Seller } from "@/lib/types";
import { SELLER_TYPES } from "@/mock/taxonomy";

export interface DetailSeller {
  name: string;
  avatarUrl?: string;
  typeLabel: string;
  /** Display form; strip spaces for a tel: link. */
  phone: string;
}

/** Everything the detail page renders, whichever source the listing came from. */
export interface DetailModel {
  id: string;
  door: CategorySlug;
  subcategory: string;
  subcategoryLabel?: string;
  title: string;
  description: string;
  price: Money | null;
  verified: boolean;
  images: string[];
  /** Work and services show one wide photo instead of the gallery. */
  heroImage: boolean;
  headline: string;
  chips: string[];
  specs: Spec[];
  location: string;
  address?: string;
  coords?: { lat: number; lng: number };
  /** Work calls the place "Աշխատավայր" and shows no map. */
  isWorkplace: boolean;
  publishedAt: string;
  /** Short id shown as "№ …" for phone enquiries. */
  reference: string;
  seller: DetailSeller | null;
}

export const SELLER_TYPE_LABEL: Record<SellerType, string> = {
  private: "Ֆիզիկական անձ",
  agency: "Գործակալություն",
  dealer: "Ավտոսրահ",
  company: "Ընկերություն",
};

/** "+37491452218" → "+374 91 45 22 18"; anything else unchanged. */
export function formatPhone(raw: string): string {
  const match = /^\+374(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(raw);
  return match ? `+374 ${match[1]} ${match[2]} ${match[3]} ${match[4]}` : raw;
}

export function propertyDetail(listing: PropertyListing): DetailModel {
  const door = DOOR_BY_DEAL[listing.deal];
  return {
    id: listing.id,
    door,
    subcategory: listing.subcategory,
    subcategoryLabel: doorSubcategoryLabel(door, listing.subcategory),
    title: listing.title,
    description: listing.description,
    price: listing.price,
    verified: listing.verified,
    images: listing.images,
    heroImage: false,
    headline: propertySummary(listing),
    chips: propertyChips(listing),
    specs: propertySpecs(listing),
    location: locationText(listing.city, listing.district),
    address: listing.address,
    coords: listing.coords,
    isWorkplace: false,
    publishedAt: listing.publishedAt,
    reference: listing.id.slice(0, 8).toUpperCase(),
    seller: listing.seller
      ? {
          name: listing.seller.name,
          avatarUrl: listing.seller.avatarUrl,
          typeLabel: SELLER_TYPE_LABEL[listing.seller.type],
          phone: formatPhone(listing.seller.phone),
        }
      : null,
  };
}

export function legacyDetail(listing: Listing, seller: Seller | undefined): DetailModel {
  return {
    id: listing.id,
    door: listing.category,
    subcategory: listing.subcategory,
    subcategoryLabel: CATEGORIES[listing.category].subcategories.find((s) => s.value === listing.subcategory)?.label,
    title: listing.title,
    description: listing.description,
    price: legacyCard(listing).price,
    verified: listing.verified,
    images: listing.images,
    heroImage: listing.category === "work" || listing.category === "services",
    headline: listingSummary(listing),
    chips: cardSpecs(listing),
    specs: detailSpecs(listing),
    location: locationLine(listing),
    address: listing.address,
    coords: listing.coords,
    isWorkplace: listing.category === "work",
    publishedAt: listing.publishedAt,
    reference: listing.id.toUpperCase(),
    seller: seller
      ? { name: seller.name, avatarUrl: seller.avatar, typeLabel: SELLER_TYPES[seller.type], phone: seller.phone }
      : null,
  };
}
```

- [ ] **Step 4: Add `buildDescription`** — `src/lib/seo.ts`

```ts
/** Meta description: price and place first (they drive clicks), then the description cut at a
 * word boundary so the whole thing stays near 155 characters. */
export function buildDescription(parts: { title: string; price?: string; location: string; description: string }): string {
  const lead = parts.price
    ? `${parts.title} — ${parts.price}, ${parts.location}. `
    : `${parts.title}, ${parts.location}. `;
  const room = Math.max(40, 155 - lead.length);
  return `${lead}${truncateAtWord(parts.description, room)}`.trimEnd();
}
```

Rewrite the body of `buildListingDescription` to delegate, keeping its output identical:

```ts
export function buildListingDescription(listing: Listing): string {
  const price = formatPrice(listing.price, { perMonth: isMonthly(listing), perDay: isDaily(listing) });
  return buildDescription({ title: listing.title, price, location: locationLine(listing), description: listing.description });
}
```

- [ ] **Step 5: Add `propertyListingJsonLd`** — `src/lib/structured-data.ts`

```ts
export function propertyListingJsonLd(listing: PropertyListing) {
  const kind = accommodationType(listing.subcategory);
  const address = {
    "@type": "PostalAddress",
    ...(listing.address && { streetAddress: listing.address }),
    addressLocality: CITY_LABEL[listing.city],
    addressRegion: ADDRESS_REGION,
    addressCountry: ADDRESS_COUNTRY,
  };
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: listing.title,
    description: listing.description,
    url: absoluteUrl(propertyHref(listing)),
    image: listing.images,
    datePosted: listing.publishedAt,
    ...(kind && {
      about: {
        "@type": kind,
        name: listing.title,
        numberOfRooms: listing.rooms || undefined,
        ...(listing.area !== undefined && {
          floorSize: { "@type": "QuantitativeValue", value: listing.area, unitCode: "MTK" },
        }),
        address,
        // Only a seller-set point is claimed as precise (SEO_BACKEND_REQUIREMENTS §1).
        ...(listing.coords && {
          geo: { "@type": "GeoCoordinates", latitude: listing.coords.lat, longitude: listing.coords.lng },
        }),
      },
    }),
    offers: {
      "@type": "Offer",
      ...(listing.price.amount !== null && { price: listing.price.amount }),
      // Read from the listing, not hardcoded: the API stores USD or AMD per listing.
      priceCurrency: listing.price.currency,
      availability: "https://schema.org/InStock",
      businessFunction:
        listing.deal === "sale" ? "http://purl.org/goodrelations/v1#Sell" : "http://purl.org/goodrelations/v1#LeaseOut",
    },
  };
}
```

Add imports: `type PropertyListing` from `@/lib/api/types`, `CITY_LABEL` from `@/lib/geo`, `propertyHref` from `@/lib/property-doors`. `ADDRESS_REGION` and `ADDRESS_COUNTRY` already exist in the file.

- [ ] **Step 6: Run the tests**

Run: `npm test -- src/lib/detail.test.ts src/lib/seo.test.ts src/lib/structured-data.test.ts`
Expected: 8 tests pass.

- [ ] **Step 7: Render `DetailModel`**

`price-tag.tsx`:

```tsx
"use client";

import { useApp } from "@/components/providers/app-provider";
import type { Money } from "@/lib/api/types";
import { formatAmount, periodLabel, toDisplayCurrency } from "@/lib/money";

/** Renders a price in the viewer's display currency — needs the client-only app context. */
export function PriceTag({ money, className }: { money: Money; className?: string }) {
  const { currency } = useApp();
  const period = money.amount !== null ? periodLabel(money.period) : "";
  return (
    <p className={className}>
      {formatAmount(money, toDisplayCurrency(currency))}
      {period && <span className="ml-1 text-[13px] font-normal text-accent">{period}</span>}
    </p>
  );
}
```

`seller-card.tsx`: the prop becomes `seller: DetailSeller` (from `@/lib/detail`); `seller.avatar` → `seller.avatarUrl`; `{SELLER_TYPES[seller.type]}` → `{seller.typeLabel}`; the `href` becomes `` `tel:${seller.phone.replace(/\s+/g, "")}` ``; drop the `SELLER_TYPES` and `Seller` imports.

`mobile-contact-bar.tsx`: change `href={`tel:${phone}`}` to `` href={`tel:${phone.replace(/\s+/g, "")}`} ``.

`listing-details.tsx`: props become `{ detail: DetailModel; similar: CardModel[] }`. At the top of the component:

```tsx
const category = CATEGORIES[detail.door];
const { seller, specs, subcategoryLabel } = detail;
const place = [detail.location, detail.address].filter(Boolean).join(", ");
```

Then replace each read, and nothing else:

| Before | After |
| --- | --- |
| `listing.category === "work" \|\| listing.category === "services"` | `detail.heroImage` |
| `listing.images`, `listing.title`, `listing.id`, `listing.description`, `listing.verified`, `listing.publishedAt`, `listing.subcategory` | the same field on `detail` |
| `<PriceTag price={listing.price} prices={listing.prices} perMonth={…} perDay={…} className="X" />` (both places) | `{detail.price && <PriceTag money={detail.price} className="X" />}` |
| `listingSummary(listing)` | `detail.headline` |
| `cardSpecs(listing)` | `detail.chips` |
| `{locationLine(listing)}, {listing.address}` (three places) and the `address` prop of `MapPlaceholder` | `{place}` |
| The two `<span …><Eye …/>{formatNumber(listing.views)} դիտում</span>` blocks | delete (the contract has no views) |
| The lightbox seller block (`mt-auto pt-5` div) | wrap in `{seller && (…)}`; `seller.avatar` → `seller.avatarUrl` and render its `<Image>` only when set; replace the rating `<p>` (Star, `rating`, `reviews`) with `<p className="text-[12px] text-muted-foreground">{seller.typeLabel}</p>` |
| `listing.category === "work" ? "Աշխատավայր" : "Գտնվելու վայրը"` | `detail.isWorkplace ? "Աշխատավայր" : "Գտնվելու վայրը"` |
| `{listing.category !== "work" && (<div className="mt-3"><MapPlaceholder … coords={listing.coords} /></div>)}` | `{!detail.isWorkplace && detail.coords && (<div className="mt-3"><MapPlaceholder address={place} coords={detail.coords} /></div>)}` |
| `№ {listing.id.toUpperCase()}` | `№ {detail.reference}` |
| `<SellerCard seller={seller} />` | `{seller && <SellerCard seller={seller} />}` |
| `similar.map((item, index) => … <ListingCard card={legacyCard(item)} …` | `similar.map((card, index) => … key={card.id} … <ListingCard card={card} …` |
| `<MobileContactBar phone={seller.phone} />` | `{seller && <MobileContactBar phone={seller.phone} />}` |

Remove the now-unused imports (`Eye`, `Star`, `formatNumber`, `cardSpecs`, `detailSpecs`, `isDaily`, `isMonthly`, `listingSummary`, `locationLine`, `Listing`, `getSeller`, `legacyCard`) and add `type DetailModel` from `@/lib/detail` and `type CardModel` from `@/lib/card`.

- [ ] **Step 8: Mock detail routes build a `DetailModel`**

In `src/app/cars/[id]/page.tsx`, `src/app/work/[id]/page.tsx` and `src/app/services/[id]/page.tsx`, the render becomes:

```tsx
<ListingDetails
  detail={legacyDetail(listing, getSeller(listing.sellerId))}
  similar={getSimilar(listing).map(legacyCard)}
/>
```

with `legacyDetail` from `@/lib/detail`, `legacyCard` from `@/lib/card`, and `getSeller` from `@/mock/sellers`. Everything else in those files stays.

- [ ] **Step 9: Write the property detail loader** — `src/components/listing/property-detail-page.tsx`

```tsx
import { cache } from "react";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ListingDetails } from "@/components/listing/listing-details";
import { JsonLd } from "@/components/seo/json-ld";
import { createApi } from "@/lib/api/client";
import { getPropertyListing, getSimilarProperty } from "@/lib/api/property";
import { propertyCard } from "@/lib/card";
import { CATEGORIES } from "@/lib/categories";
import { propertyDetail } from "@/lib/detail";
import { locationText } from "@/lib/geo";
import { formatMoney } from "@/lib/money";
import { DOOR_BY_DEAL, propertyHref, type PropertyDoor } from "@/lib/property-doors";
import { buildDescription } from "@/lib/seo";
import { breadcrumbJsonLd, propertyListingJsonLd } from "@/lib/structured-data";

/** One API call per request, shared by generateMetadata and the page. */
const loadListing = cache((id: string) => getPropertyListing(createApi(), id));

export async function propertyDetailMetadata(door: PropertyDoor, id: string): Promise<Metadata> {
  const listing = await loadListing(id);
  if (!listing) return { title: "Հայտարարությունը չի գտնվել" };
  const description = buildDescription({
    title: listing.title,
    price: formatMoney(listing.price, listing.price.currency),
    location: locationText(listing.city, listing.district),
    description: listing.description,
  });
  const canonical = propertyHref(listing);
  return {
    title: listing.title,
    description,
    alternates: { canonical },
    openGraph: { title: listing.title, description, images: listing.images.slice(0, 4) },
    twitter: { card: "summary_large_image", title: listing.title, description, images: listing.images.slice(0, 1) },
  };
}

export async function PropertyDetailPage({ door, id }: { door: PropertyDoor; id: string }) {
  const listing = await loadListing(id);
  if (!listing) notFound();
  // A listing lives on its deal's door; an old or hand-typed URL on another door moves for good.
  if (DOOR_BY_DEAL[listing.deal] !== door) permanentRedirect(propertyHref(listing));

  const similar = await getSimilarProperty(createApi(), id, 8);
  const category = CATEGORIES[door];
  return (
    <>
      <JsonLd
        data={[
          propertyListingJsonLd(listing),
          breadcrumbJsonLd([
            { name: "Գլխավոր", path: "/" },
            { name: category.label, path: category.href },
            { name: listing.title, path: propertyHref(listing) },
          ]),
        ]}
      />
      <ListingDetails detail={propertyDetail(listing)} similar={similar.map(propertyCard)} />
    </>
  );
}
```

- [ ] **Step 10: Point the three detail routes at it**

`src/app/real-estate/[id]/page.tsx` (replace the whole file):

```tsx
import type { Metadata } from "next";
import { PropertyDetailPage, propertyDetailMetadata } from "@/components/listing/property-detail-page";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return propertyDetailMetadata("real-estate", params.id);
}

export default function RealEstateListingPage({ params }: PageProps) {
  return <PropertyDetailPage door="real-estate" id={params.id} />;
}
```

Same for `rentals/[id]` (`"rentals"`, `RentalListingPage`) and `hotels/[id]` (`"hotels"`, `HotelListingPage`). `generateStaticParams` goes away with the old file contents.

- [ ] **Step 11: Verify against the running API**

Run: `npm run typecheck && npm run lint && npm test`, then `npm run dev`.

| Visit | Expected |
| --- | --- |
| `/real-estate/947e6113-f009-5717-a2f7-97b482ec8acf` (seed `re-1`) | Title, gallery, specs, seller name and grouped phone, one similar listing |
| `/hotels/947e6113-f009-5717-a2f7-97b482ec8acf` | 308 redirect to `/real-estate/947e…` |
| `/real-estate/re-1` and `/real-estate/00000000-0000-4000-8000-000000000000` | the not-found page, HTTP 404 (check with `curl -o /dev/null -w '%{http_code}'`) |
| View source of the detail page | one `RealEstateListing` JSON-LD with `"priceCurrency":"USD"` |
| `/cars/car-1` | unchanged, mock data |

- [ ] **Step 12: Commit**

```bash
git add src/lib/detail.ts src/lib/detail.test.ts src/lib/seo.ts src/lib/seo.test.ts src/lib/structured-data.ts src/lib/structured-data.test.ts src/components/listing src/app
git commit -m "feat(property): detail pages read the API; one detail model for API and mock

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Home page reads property sections from the API

**Files:**
- Modify: `src/app/page.tsx`, `src/lib/card.ts` (`isCard`, `newestCards`)
- Test: `src/lib/card.test.ts` (new cases)

**Interfaces:**
- Consumes: `searchProperty`, `getRecentListings` (Task 3); `propertyCard`, `catalogCard`, `legacyCard`, `sortCards` (Task 6); `MOCK_DOORS` (Task 7).
- Produces: `isCard(card: CardModel | null): card is CardModel`; `newestCards(groups: CardModel[][], limit: number): CardModel[]`.

- [ ] **Step 1: Write the failing test** — append to `src/lib/card.test.ts`

```ts
import { isCard, newestCards } from "./card";

describe("newestCards", () => {
  it("merges sources newest first and caps the count", () => {
    const base = propertyCard(PROPERTY_FIXTURE);
    const at = (id: string, day: number) => ({ ...base, id, publishedAt: `2026-09-${String(day).padStart(2, "0")}T00:00:00Z` });
    expect(newestCards([[at("a", 3), at("b", 1)], [at("c", 2)]], 2).map((c) => c.id)).toEqual(["a", "c"]);
    expect([base, null].filter(isCard)).toHaveLength(1);
  });
});
```

(Merge the import into the file's existing `./card` import.)

- [ ] **Step 2: Run it to see it fail**

Run: `npm test -- src/lib/card.test.ts`
Expected: FAIL, `newestCards is not a function`.

- [ ] **Step 3: Add the helpers** to `src/lib/card.ts`

```ts
export function isCard(card: CardModel | null): card is CardModel {
  return card !== null;
}

/** Home's "recently added": API and mock doors side by side until the last door moves. */
export function newestCards(groups: CardModel[][], limit: number): CardModel[] {
  return sortCards(groups.flat(), "date-desc").slice(0, limit);
}
```

Run: `npm test -- src/lib/card.test.ts`
Expected: 6 tests pass.

- [ ] **Step 4: Rewrite `src/app/page.tsx`**

```tsx
import { BenefitsSection } from "@/components/home/benefits-section";
import { Categories } from "@/components/home/categories";
import { HitsSection } from "@/components/home/hits-section";
import { NewArrivals } from "@/components/home/new-arrivals";
import { PromoBanner } from "@/components/home/promo-banner";
import { PublishCta } from "@/components/home/publish-cta";
import { getRecentListings } from "@/lib/api/catalog";
import { createApi } from "@/lib/api/client";
import { searchProperty } from "@/lib/api/property";
import { catalogCard, isCard, legacyCard, newestCards, propertyCard } from "@/lib/card";
import { MOCK_DOORS } from "@/lib/categories";
import { RECENT_LISTINGS, TOP_CARS, TOP_SERVICES } from "@/mock/listings";

export const dynamic = "force-dynamic";

const SECTION_SIZE = 8;

export default async function HomePage() {
  const api = createApi();
  const [sale, rent, daily, dailyHouses, recent] = await Promise.all([
    searchProperty(api, { deal: "sale", pageSize: SECTION_SIZE }),
    searchProperty(api, { deal: "rent", pageSize: SECTION_SIZE }),
    searchProperty(api, { deal: "daily", pageSize: SECTION_SIZE }),
    searchProperty(api, { deal: "daily", subcategory: "houses", pageSize: SECTION_SIZE }),
    getRecentListings(api, 12),
  ]);

  const arrivals = newestCards(
    [
      recent.map(catalogCard).filter(isCard),
      RECENT_LISTINGS.filter((listing) => MOCK_DOORS.includes(listing.category)).map(legacyCard),
    ],
    12,
  );

  return (
    <>
      <PromoBanner />

      <Categories />

      <HitsSection titleKey="realEstate" href="/real-estate" cards={sale.items.map(propertyCard)} />

      <NewArrivals cards={arrivals} />

      <HitsSection titleKey="cars" href="/cars" cards={TOP_CARS.map(legacyCard)} />

      <HitsSection titleKey="rentals" href="/rentals" cards={rent.items.map(propertyCard)} />

      <HitsSection titleKey="hotels" href="/hotels" cards={daily.items.map(propertyCard)} />

      <HitsSection titleKey="dailyHouses" href="/hotels?subcategory=houses" cards={dailyHouses.items.map(propertyCard)} />

      <HitsSection titleKey="services" href="/services" cards={TOP_SERVICES.map(legacyCard)} />

      <BenefitsSection />

      <PublishCta />
    </>
  );
}
```

The "daily houses" link moves from `subcategory=daily-houses` to `subcategory=houses`, because the prototype's `daily-houses`, `houses` and `cottages` all became property `houses` with `deal=daily` (spec W4).

- [ ] **Step 5: Verify**

Run: `npm run typecheck && npm run lint && npm test`, then `npm run dev` with the API running. Open `/`. Expected: the real-estate, rentals, hotels and daily-houses rows show seed listings whose links open UUID detail pages; the cars and services rows are unchanged; "recently added" mixes both sources, newest first.

- [ ] **Step 6: Commit**

```bash
git add src/app/page.tsx src/lib/card.ts src/lib/card.test.ts
git commit -m "feat(home): property sections and recent listings from the API

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Search, header suggestions and favorites across both sources

**Files:**
- Create: `src/components/listings/use-favorite-cards.ts`
- Modify: `src/components/providers/app-provider.tsx` (`removeFavorites`), `src/components/search/search-results.tsx`, `src/components/search/search-bar.tsx`, `src/components/account/favorites-view.tsx`, `src/lib/card.ts` (`orderByIds`)
- Test: `src/lib/card.test.ts` (new case)

**Interfaces:**
- Consumes: `searchCatalog`, `getCatalogByIds` (Task 3); `isUuid`, `createApi` (Task 2); `citySlugOf` (Task 4); card helpers (Tasks 6, 9); `MOCK_DOORS` (Task 7).
- Produces:
  - `removeFavorites(ids: string[]): void` on `useApp()`
  - `useFavoriteCards(): { cards: CardModel[]; loading: boolean }`
  - `orderByIds(ids: string[], cards: CardModel[]): CardModel[]`
  - `SEARCH_API_LIMIT = 100` in `search-results.tsx`

- [ ] **Step 1: Write the failing test** — append to `src/lib/card.test.ts`

```ts
import { orderByIds } from "./card";

describe("orderByIds", () => {
  it("follows the favorites order and drops ids with no card", () => {
    const base = propertyCard(PROPERTY_FIXTURE);
    const cards = [{ ...base, id: "a" }, { ...base, id: "b" }];
    expect(orderByIds(["b", "gone", "a"], cards).map((c) => c.id)).toEqual(["b", "a"]);
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npm test -- src/lib/card.test.ts`
Expected: FAIL, `orderByIds is not a function`.

- [ ] **Step 3: Add `orderByIds`** to `src/lib/card.ts`

```ts
export function orderByIds(ids: string[], cards: CardModel[]): CardModel[] {
  const byId = new Map(cards.map((card) => [card.id, card]));
  return ids.map((id) => byId.get(id)).filter((card): card is CardModel => card !== undefined);
}
```

Run: `npm test -- src/lib/card.test.ts`
Expected: 7 tests pass.

- [ ] **Step 4: `removeFavorites`** — `src/components/providers/app-provider.tsx`

Add to `AppState`:

```ts
  /** Drops ids the API no longer knows (deleted or archived listings). */
  removeFavorites: (ids: string[]) => void;
```

Add next to `clearFavorites`:

```ts
const removeFavorites = React.useCallback((ids: string[]) => {
  setFavorites((prev) => prev.filter((id) => !ids.includes(id)));
}, []);
```

Add `removeFavorites` to the `value` object and to its `useMemo` dependency list.

- [ ] **Step 5: Write the favorites hook** — `src/components/listings/use-favorite-cards.ts`

```ts
"use client";

import * as React from "react";
import { useApp } from "@/components/providers/app-provider";
import { getCatalogByIds } from "@/lib/api/catalog";
import { createApi, isUuid } from "@/lib/api/client";
import { type CardModel, catalogCard, isCard, legacyCard, orderByIds } from "@/lib/card";
import { getListings } from "@/mock/listings";

/** Favorites are ids in localStorage. UUIDs are API listings, hydrated in chunks of 50; the rest
 * are mock listings of doors not yet on the API. Ids the API omits are forgotten (spec 4.7). */
export function useFavoriteCards(): { cards: CardModel[]; loading: boolean } {
  const { favorites, hydrated, removeFavorites } = useApp();
  const apiIds = React.useMemo(() => favorites.filter(isUuid), [favorites]);
  const [apiCards, setApiCards] = React.useState<CardModel[] | null>(null);

  React.useEffect(() => {
    if (!hydrated) return;
    if (apiIds.length === 0) {
      setApiCards([]);
      return;
    }
    let cancelled = false;
    getCatalogByIds(createApi(), apiIds)
      .then((items) => {
        if (cancelled) return;
        setApiCards(items.map(catalogCard).filter(isCard));
        const found = new Set(items.map((item) => item.id));
        const gone = apiIds.filter((id) => !found.has(id));
        if (gone.length > 0) removeFavorites(gone);
      })
      .catch((error: unknown) => {
        // Keep the ids: a network failure must not erase someone's favorites.
        if (!cancelled) {
          console.warn("Could not load favorites", error);
          setApiCards([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [hydrated, apiIds, removeFavorites]);

  const cards = React.useMemo(() => {
    const mockCards = getListings(favorites.filter((id) => !isUuid(id))).map(legacyCard);
    return orderByIds(favorites, [...(apiCards ?? []), ...mockCards]);
  }, [favorites, apiCards]);

  return { cards, loading: !hydrated || apiCards === null };
}
```

- [ ] **Step 6: Favorites page uses it** — `src/components/account/favorites-view.tsx`

Replace `const listings = getListings(favorites);` and the `visible` line with:

```ts
const { cards, loading } = useFavoriteCards();
const visible = tab === "all" ? cards : cards.filter((card) => card.door === tab);
```

Then: every `listings.length` → `cards.length`; the skeleton branch condition `!hydrated` → `loading`; the count line's `hydrated ? … : …` → `!loading ? … : …`; `cards={visible.map(legacyCard)}` → `cards={visible}`. Drop the `getListings` and `legacyCard` imports and `favorites`/`hydrated` from the `useApp()` destructure if unused.

- [ ] **Step 7: Search page reads the catalog** — `src/components/search/search-results.tsx`

Replace the `results` memo with the block below; leave the header, tabs, sort select and grid markup as they are:

```tsx
/** The catalog page cap. Search is not paginated yet; see "Known gaps" in the plan. */
const SEARCH_API_LIMIT = 100;

// inside SearchResults, after the existing state:
const [apiCards, setApiCards] = React.useState<CardModel[] | null>(null);

React.useEffect(() => {
  const citySlug = city ? citySlugOf(city) : undefined;
  if (city && !citySlug) {
    setApiCards([]);
    return;
  }
  const controller = new AbortController();
  setApiCards(null);
  searchCatalog(
    createApi(),
    { q: q || undefined, city: citySlug, priceMax, cur: priceMax ? "USD" : undefined, pageSize: SEARCH_API_LIMIT },
    controller.signal,
  )
    .then((page) => setApiCards(page.items.map(catalogCard).filter(isCard)))
    .catch((error: unknown) => {
      if (!controller.signal.aborted) {
        console.warn("Search request failed", error);
        setApiCards([]);
      }
    });
  return () => controller.abort();
}, [q, city, priceMax]);

const mockCards = React.useMemo(() => {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  return ALL_LISTINGS.filter((listing) => {
    if (!MOCK_DOORS.includes(listing.category)) return false;
    if (city && listing.city !== city) return false;
    if (priceMax && listing.price > priceMax) return false;
    if (!terms.length) return true;
    const haystack = [
      listing.title,
      listing.description,
      listing.city,
      listing.district ?? "",
      "brand" in listing ? `${listing.brand} ${listing.model}` : "",
    ]
      .join(" ")
      .toLowerCase();
    return terms.every((term) => haystack.includes(term));
  }).map(legacyCard);
}, [q, city, priceMax]);

const results = React.useMemo(() => sortCards([...(apiCards ?? []), ...mockCards], sort), [apiCards, mockCards, sort]);
const loading = apiCards === null;
```

Change `results.filter((l) => l.category === tab)` to `results.filter((card) => card.door === tab)`, pass `cards={visible}` and `loading={loading}` to `ListingGrid`, and show the result count only when `!loading`. Imports: add `createApi`, `searchCatalog`, `catalogCard`, `isCard`, `legacyCard`, `sortCards`, `type CardModel`, `citySlugOf`, `MOCK_DOORS`; drop `sortListings`.

- [ ] **Step 8: Header suggestions** — `src/components/search/search-bar.tsx`

In `matchListings`, skip doors on the API (their mock ids no longer resolve), as the first line of the `.map` callback:

```ts
if (!MOCK_DOORS.includes(listing.category)) return null;
```

Replace `const suggestions = React.useMemo(() => matchListings(query), [query]);` with:

```tsx
const [apiSuggestions, setApiSuggestions] = React.useState<CardModel[]>([]);

React.useEffect(() => {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    setApiSuggestions([]);
    return;
  }
  const controller = new AbortController();
  const timer = window.setTimeout(() => {
    searchCatalog(createApi(), { q: trimmed, pageSize: MAX_SUGGESTIONS }, controller.signal)
      .then((page) => setApiSuggestions(page.items.map(catalogCard).filter(isCard)))
      .catch(() => {
        if (!controller.signal.aborted) setApiSuggestions([]);
      });
  }, 250);
  return () => {
    window.clearTimeout(timer);
    controller.abort();
  };
}, [query]);

const suggestions = React.useMemo(
  () => [...apiSuggestions, ...matchListings(query).map(legacyCard)].slice(0, MAX_SUGGESTIONS),
  [apiSuggestions, query],
);
```

In the dropdown and in `submit`, the items are now `CardModel`: `listingHref(x)` → `x.href`; `listing.id` → `card.id`; `listing.title` → `card.title`; `listing.images[0]` → `card.images[0]`, rendering the `<Image>` only when it exists; `formatPrice(listing.price, { currency, prices: listing.prices })` → `card.price ? formatAmount(card.price, toDisplayCurrency(currency)) : null`; any other `listing.*` location text → `card.location`. Rename the map variable from `listing` to `card`.

- [ ] **Step 9: Verify**

Run: `npm run typecheck && npm run lint && npm test`, then `npm run dev` with the API running.

| Action | Expected |
| --- | --- |
| `/search?q=հյուրանոց` | the 3 seed hotels from the API |
| `/search?q=Toyota` | mock cars only |
| Type `Կապ` in the header | property suggestions from the API next to mock ones; Enter on one opens its page |
| Heart one API listing and one car, open `/favorites` | both cards, in the order hearted |
| In `psql`, `UPDATE property.listings SET status='archived' WHERE id='<the hearted id>'`, reload `/favorites` | that card is gone and its id is gone from `localStorage["syuniq:favorites"]`; restore it with `status='active'` |
| Stop the API, reload `/favorites` | mock favorites still show; API favorites are missing but their ids stay in localStorage |

- [ ] **Step 10: Commit**

```bash
git add src/components src/lib/card.ts src/lib/card.test.ts
git commit -m "feat(search): search, suggestions and favorites span API and mock listings

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Sitemap from the catalog

**Files:**
- Modify: `src/app/sitemap.ts`, `src/lib/api/catalog.ts` (`getAllActiveCards`)
- Test: `src/lib/api/reads.test.ts` (new case)

**Interfaces:**
- Consumes: `searchCatalog` (Task 3), `catalogCard` (Task 6), `MOCK_DOORS` (Task 7).
- Produces: `getAllActiveCards(api: Api, pageSize?: number): Promise<CatalogCard[]>`.

- [ ] **Step 1: Write the failing test** — append to `src/lib/api/reads.test.ts`

```ts
import { getAllActiveCards } from "./catalog";

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
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npm test -- src/lib/api/reads.test.ts`
Expected: FAIL, `getAllActiveCards is not a function`.

- [ ] **Step 3: Add it** to `src/lib/api/catalog.ts`

```ts
/** Every active listing, for the sitemap. Fine below a few thousand listings; past that the
 * sitemap becomes an index (SEO_BACKEND_REQUIREMENTS §4). */
export async function getAllActiveCards(api: Api, pageSize = 100): Promise<CatalogCard[]> {
  const cards: CatalogCard[] = [];
  for (let page = 1; ; page += 1) {
    const result = await searchCatalog(api, { page, pageSize, sort: "date-desc" });
    cards.push(...result.items);
    if (result.items.length === 0 || cards.length >= result.total) return cards;
  }
}
```

Run: `npm test -- src/lib/api/reads.test.ts`
Expected: 5 tests pass.

- [ ] **Step 4: Rewrite `src/app/sitemap.ts`**

```ts
import type { MetadataRoute } from "next";
import { getAllActiveCards } from "@/lib/api/catalog";
import { createApi } from "@/lib/api/client";
import { catalogCard, isCard, legacyCard } from "@/lib/card";
import { CATEGORY_LIST, MOCK_DOORS } from "@/lib/categories";
import { SITE_URL } from "@/lib/seo";
import { ALL_LISTINGS } from "@/mock/listings";

// Built per request: new and removed listings show up at once, and the build needs no API.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const home: MetadataRoute.Sitemap = [{ url: SITE_URL, changeFrequency: "daily", priority: 1 }];

  const categories: MetadataRoute.Sitemap = CATEGORY_LIST.map((category) => ({
    url: `${SITE_URL}${category.href}`,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const apiCards = (await getAllActiveCards(createApi())).map(catalogCard).filter(isCard);
  const mockCards = ALL_LISTINGS.filter(
    (listing) => listing.status === "active" && MOCK_DOORS.includes(listing.category),
  ).map(legacyCard);

  const listings: MetadataRoute.Sitemap = [...apiCards, ...mockCards].map((card) => ({
    url: `${SITE_URL}${card.href}`,
    // TODO backend: the contract has no updatedAt yet (SEO_BACKEND_REQUIREMENTS §1); publishedAt
    // is the best available lastmod until it does.
    lastModified: new Date(card.publishedAt),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...home, ...categories, ...listings];
}
```

- [ ] **Step 5: Verify**

With the API and `npm run dev` running: `curl -s http://localhost:3000/sitemap.xml | grep -c '<url>'`. Expected: 1 home + 6 doors + 44 property + the active mock cars, work and services listings.

- [ ] **Step 6: Commit**

```bash
git add src/app/sitemap.ts src/lib/api/catalog.ts src/lib/api/reads.test.ts
git commit -m "feat(seo): sitemap lists API listings per request

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: Full verification, smoke script, docs, pull request

**Files:**
- Create: `scripts/smoke-api.mjs`
- Modify: `README.md`, `docs/SEO_BACKEND_REQUIREMENTS.md`

- [ ] **Step 1: Write `scripts/smoke-api.mjs`**

```js
// Smoke test for the API-backed routes. Needs `npm run dev` (or `npm start`) and InSyunik-Api
// with seed data. Usage: node scripts/smoke-api.mjs [baseUrl]
const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const RE_1 = "947e6113-f009-5717-a2f7-97b482ec8acf";

const checks = [
  ["/", 200, "/real-estate/"],
  ["/real-estate", 200, "/real-estate/"],
  ["/rentals", 200, "/rentals/"],
  ["/hotels", 200, "/hotels/"],
  [`/real-estate/${RE_1}`, 200, "RealEstateListing"],
  ["/real-estate/re-1", 404, null],
  ["/cars", 200, "/cars/car-"],
  ["/sitemap.xml", 200, `/real-estate/${RE_1}`],
];

let failed = 0;
for (const [path, status, needle] of checks) {
  const response = await fetch(base + path, { redirect: "manual" });
  const body = await response.text();
  const ok = response.status === status && (needle === null || body.includes(needle));
  if (!ok) failed += 1;
  console.log(`${ok ? "ok  " : "FAIL"} ${response.status} ${path}`);
}
process.exit(failed ? 1 : 0);
```

- [ ] **Step 2: The build must not need the API**

Stop the API, then run: `npm run typecheck && npm run lint && npm test && npm run build`.
Expected: all pass. In the build's route table, `/`, `/real-estate`, `/rentals`, `/hotels`, their `[id]` routes and `/sitemap.xml` are marked `ƒ` (dynamic); `/cars/[id]`, `/work/[id]`, `/services/[id]` stay `●`.

- [ ] **Step 3: Smoke-test the production server**

Start the API (preconditions), then `npm start`, then:

```bash
node scripts/smoke-api.mjs
```

Expected: eight `ok` lines, exit code 0.

- [ ] **Step 4: Update docs**

`README.md`: replace "Прототип без бэкенда — все данные лежат в mock-файлах" with a short paragraph saying that the property doors, home, search, favorites and sitemap read InSyunik-Api (`NEXT_PUBLIC_API_URL`, default `http://localhost:5080`) while cars, work and services are still mock until their API modules land; add `npm test`, `npm run api:types` and `node scripts/smoke-api.mjs` to the commands; add one line on refreshing the contract (the Step 6 command of Task 1).

`docs/SEO_BACKEND_REQUIREMENTS.md` §5: note that property JSON-LD now reads `priceCurrency` from the listing (`propertyListingJsonLd`); the hardcoded `"USD"` remains only in the mock-door builders.

- [ ] **Step 5: Commit and open the pull request**

```bash
git add scripts/smoke-api.mjs README.md docs/SEO_BACKEND_REQUIREMENTS.md
git commit -m "docs: API-backed routes, contract refresh and smoke test

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push -u origin feat/api-client
gh pr create --title "feat: property doors, home, search, favorites and sitemap on InSyunik-Api" --body "Implements PR A1 of docs/superpowers/plans/2026-09-23-pr-a1-property-doors-on-api.md against contract v0.3.0. Cars, work and services stay on mock data.

🤖 Generated with [Claude Code](https://claude.com/claude-code)"
```

---

## Known gaps carried to later PRs

| Gap | Why it is acceptable now | Closed by |
| --- | --- | --- |
| Search shows at most 100 API results, unpaginated | Seed has 44 property listings | The last module PR, when search moves fully to the catalog |
| A price filter in AMD excludes USD-priced listings | The API compares amounts in each listing's own currency; seed prices are all USD | An API decision on cross-currency price bounds (raise with the API stream) |
| Redirects from the door and detail loaders drop a `/ru` or `/en` prefix | Locale routes are rewrites without their own segment today (spec open question) | The locale routing work |
| The header city is still stored as its Armenian name | Converted with `citySlugOf` where the API needs it | Cleanup PR after PR E |
| Sitemap `lastmod` is `publishedAt` | The contract has no `updatedAt` | A contract field, tracked in `SEO_BACKEND_REQUIREMENTS.md` |
| Profile, wizard, sign-in stay local | They need auth, which is PR A2 | PR A2 |

## Follow-on plans

| Plan | Contract | Scope | Library adoptions (decision record §2) |
| --- | --- | --- | --- |
| PR A2: auth and property create | v0.3.0 | `@supabase/ssr` session, sign-in, sign-up with `putMyProfile`, reset password, guarded routes, profile "my listings" via `getMyListings`, wizard create for property with signed uploads | `sonner`; `react-hook-form`; Base UI `Form`/`Field` for field errors and an error summary |
| PR B: edit and archive | v0.4.0 | Wizard edit, profile archive, profile settings | Base UI `Drawer` for the wizard on phones |
| PR C, D, E | v0.5.0, v0.6.0, v0.7.0 | Jobs, vehicles, services doors, each flipping `source` to `"api"` and deleting its mock | `react-day-picker` for job `expiresAt` in PR C |
| Cleanup | — | Delete `src/mock` listing arrays, `legacy*` mappers, `legacyBadges`, Armenian city storage | — |

PR A2 is written next, after this plan is reviewed, because it builds on `createApi`, `ApiError` and `CardModel` as they land here.

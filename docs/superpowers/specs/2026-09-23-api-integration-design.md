# Design: insyuniq on InSyunik-Api

Date: 2026-09-23. Status: draft for review.
Companion documents: `InSyunik-Api/docs/designs/phase-a-exit-all-domains-on-http.md`
(Step 2 of that design is what this document expands),
`InSyunik-Api/contract/openapi.yaml` (the contract), ADRs 0001, 0004, 0005,
0006 in `InSyunik-Web/docs/adr/`.

## 1. Goal

Replace every read of `src/mock/*` listing data in insyuniq with calls to
InSyunik-Api, and replace the localStorage sign-in stub with Supabase Auth,
so that all six doors, detail pages, home, search, favorites, profile and the
publish wizard work against a running API. Exit condition: no source file
imports a mock listing array; every door, detail, similar, home, search,
create, edit and delete flow works against `http://localhost:5080`.

## 2. Decisions taken during design (2026-09-21 to 2026-09-23)

| # | Decision | Consequence |
| --- | --- | --- |
| W1 | Both streams run in parallel: the API continues its plan, the web is built against the pinned property contract from day one. | Web PR A can land before Jobs exists. |
| W2 | The web target is `insyuniq` (Next 14), not `InSyunik-Web`. | `InSyunik-Web`'s `ListingRepository` seam is a reference, not a dependency. |
| W3 | Components consume the contract's shapes directly (`PropertyListing`, `CatalogCard`, `Money`, `SellerSummary`); no adapter layer to the old `Listing` types. | `src/lib/types.ts` is rewritten; every card, filter, detail block and wizard step changes. |
| W4 | Hotels door: `deal=daily` over every subcategory that allows daily. Prototype `houses`, `daily-houses` and `cottages` all become property `houses`. No contract change. | Door tabs: hotels, guesthouses, houses, apartments. |
| W5 | Rentals door: `deal=rent` only. The prototype's `term` filter disappears. | Every listing belongs to exactly one door. |
| W6 | Services gets a module (contract v0.6.0) with the prototype's subcategory list minus `restaurants`, plus the plan's fields. | The web swap of `/services` waits for v0.6.0. |
| W7 | Auth is Supabase email and password through `@supabase/ssr`. Phone OTP is later and needs no API change. | Sign-in loses its phone field; sign-up keeps phone for the seller profile. |
| W8 | Category and detail pages are server-rendered per request. | Needs a Node host; static params go away. |
| W9 | Edit and delete of listings need contract endpoints; they join the API stream (property first, then every module). | Profile edit and delete ship in web PR B, not A. |
| W10 | The contract YAML is vendored into `insyuniq/contract/openapi.yaml` and pinned; types are generated from the vendored copy. | No path into a sibling checkout; a freshness check guards drift. |
| W11 | The web swap ships door by door, one PR per module, never as one big-bang branch. | Doors not yet ported keep their mock code behind the door registry until their PR. |
| W12 | Server-side fetches read `API_URL` and fall back to `NEXT_PUBLIC_API_URL`. | Internal traffic can stay inside the host network. |
| W13 | The API's `scripts/export-seed.mts` is frozen at the commit before `src/mock` is deleted; `seed/*.json` stays committed. | Services seed rows are hand-written, as Task 24 says. |

## 3. API stream: changes to the existing plan

The API keeps `docs/plans/2026-09-21-prototype-gaps.md` and Tasks 22 to 24 of
`docs/superpowers/plans/2026-09-10-insyunik-api-mvp.md`, with these deltas.
They are recorded here so the API plans can be amended before each PR is cut.

| PR | Branch | Contract | Delta from the existing plan |
| --- | --- | --- | --- |
| 1 | `feat/prototype-gaps` | v0.3.0 | None. Finish tasks 5 to 9 of its plan. |
| 1b | `feat/property-edit` | v0.3.1 | New. `PUT /v1/property/listings/{id}` (`updatePropertyListing`, same body as create, owner = token `sub`, 403 otherwise, 404 when not active) and `DELETE /v1/property/listings/{id}` (`archivePropertyListing`, sets `status = archived`, 204). Both bearer, both rate-limited as writes. Images in an update must be paths issued to the same user or URLs already on the listing. |
| 2 | `feat/jobs` | v0.4.0 | Task 22 plus `updateJobListing`, `archiveJobListing`, and a required `expiresAt` (date-time, at most 90 days after creation) on `JobListing` and its create request, because Google's JobPosting markup needs a real `validThrough`. |
| 3 | `feat/vehicles` | v0.5.0 | Task 23 plus update and archive. |
| 4 | `feat/services` | v0.6.0 | Task 24 with the field set below, plus update and archive. |

Services field set (replaces Task 24 Step 0's proposal):

| Set / column | Value |
| --- | --- |
| `Subcategories` | `construction, beauty, education, legal, it, transport, events, household, other` |
| `PricePeriods` | `hour, total` |
| `provider text` | required, 2 to 80 characters; business or specialist name |
| `working_hours text?` | free text, at most 80 characters |
| `travels_to_client bool` | default false |
| `service_cities text[]` | city slugs; empty means the listing's city only |
| `CardJson` | `provider`, `travelsToClient` |
| Filters | `subcategory` (List, facet), `travelsToClient` (Flag), `period` (OneOf) |

`restaurants` is dropped because ADR 0006 reserves `businesses` for venues.

## 4. Web stream: architecture

### 4.1 Contract and generated types

- `contract/openapi.yaml`: a byte-for-byte copy of the API's file at the pinned
  version. `package.json` gains `"contractVersion": "0.3.0"`.
- `src/lib/api/schema.d.ts`: generated by `openapi-typescript` (dev
  dependency) from the vendored YAML. Committed. Never hand-edited.
- Scripts: `api:types` regenerates; `contract:check` regenerates to a temp
  file and fails when it differs from the committed one, or when the YAML's
  `info.version` differs from `contractVersion`. `typecheck` runs
  `contract:check` first.

### 4.2 Client layer, `src/lib/api/`

- `client.ts`: `apiFetch<T>(path, init)` with base URL resolution (W12), an
  optional `token` option that sets `Authorization: Bearer`, query
  serialisation per contract §7.2 (arrays comma-joined, booleans as `1`,
  undefined and empty dropped), `Accept: application/json`, and problem
  parsing. Non-2xx responses throw `ApiError { status, type, title, detail,
  errors }`. No retries, no caching layer beyond `fetch`'s own `next`
  options, which callers pass through.
- One file per tag, exporting async functions named after operation ids and
  typed from `schema.d.ts`: `property.ts` (search, facets, getById, similar,
  create, update, archive), `catalog.ts` (search, facets, featured, recent,
  myListings), `me.ts` (getMyProfile, putMyProfile), `media.ts`
  (createUploadUrl, `uploadFile(file, token)` which chains the signed PUT),
  and later `jobs.ts`, `vehicles.ts`, `services.ts` with the property shape.
- Every function is isomorphic and stateless. Server Components call them
  with the token from cookies; Client Components call them with the token
  from the browser Supabase client.

### 4.3 Types, `src/lib/types.ts`

Re-exports from `schema.d.ts`: `PropertyListing`, `CatalogCard`, `Money`,
`SellerSummary`, `Facets`, every enum. Defines the UI-only unions: `DoorSlug`
(`real-estate | cars | rentals | hotels | work | services`), `ViewMode`, the
filter state interfaces per door (see 4.5). The old `Listing` union, `Seller`,
`BaseListing`, `CommonFilters` and their guards are deleted in the PR that
ports the last door; until then the mock doors keep a `legacy-types.ts` that
only their own components import.

### 4.4 Door registry, `src/lib/categories.ts`

`CATEGORIES` loses `listings` and `cover` from static arrays and gains:

- `module`: `property | jobs | vehicles | services`.
- `preset`: fixed query parameters (`{ deal: "sale" }`, `{ deal: "rent" }`,
  `{ deal: "daily" }`, or none).
- `subcategories`: options whose `value` is a contract enum value; labels
  and icons stay in `taxonomy.ts` keyed by that value.
- `source`: `"api" | "mock"`, flipped per door as its PR lands (W11).
  `cover` becomes a static asset per door under `public/covers/`.

### 4.5 Filters and URL state

`src/lib/filtering.ts` keeps `defaultFilters`, `parseFilters`,
`filtersToQuery` and `countActiveFilters`, but the filter interfaces mirror
the contract's parameters for each module, with the door preset excluded:

| Door | Parameters in the URL |
| --- | --- |
| property doors | `q, city, district, priceMin, priceMax, cur, withPhoto, verifiedOnly, subcategory, rooms, areaMin, areaMax, floorMin, floorMax, totalFloorsMin, totalFloorsMax, condition, buildingType, furniture, balcony, parking, pool, sort, page` |
| cars | the vehicles parameters of v0.5.0 |
| work | the jobs parameters of v0.4.0 |
| services | `q, city, priceMin, priceMax, cur, withPhoto, verifiedOnly, subcategory, travelsToClient, period, sort, page` |

The URL of a door page is therefore the API query without the preset. The
client-side `filterCars`, `filterRealEstate` and friends, `sortListings` and
the in-memory pagination are deleted with their doors. `priceCurrency` becomes
the contract's `cur`; when set, price bounds are in that currency and listings
in the other currency are excluded, which is the API's semantics.

### 4.6 Geography, money and labels

- Cities and districts are slugs everywhere in state and URLs. `cities.ts`
  inverts to slug-keyed labels; `DISTRICTS` is derived from the contract's
  `District` enum by city prefix. The header location picker stores a slug.
- `currency.ts` keeps `USD` and `AMD` only. `formatPrice(money, display)`
  renders `Money` in the viewer's display currency using the illustrative
  rate when the two differ, and renders "negotiable" when `amount` is null.
  `period` renders as a suffix (per month, per night, per hour).
- `labels.ts` maps every contract enum value to Armenian, Russian and
  English strings through i18next keys named after the value.

### 4.7 Pages and rendering

| Route | Component | Calls on the server |
| --- | --- | --- |
| `/{door}` | Server Component builds the query from URL and preset, then renders `CategoryPage` (client) with `items`, `total`, `facets`, `page`. | module `search` and `facets`, in parallel, `cache: "no-store"` |
| `/{door}/[id]` | Server Component; `notFound()` on 404. `generateMetadata` reuses the same fetch through React `cache`. | module `getById` and `similar`, in parallel |
| `/` | Server Component. | catalog `featured`, `recent`, and one `search` per home section with `category` and `pageSize=8` |
| `/search` | Client Component, `noindex`. | catalog `search` with `q, city, priceMax, category, sort, page` from an effect |
| `/favorites` | Client Component. | catalog `search` with `ids` in chunks of 50; ids the API omits are dropped from state |
| `/profile` | Client Component behind the session guard. | catalog `myListings` with `status`; `me.getMyProfile` |
| `/create`, `/create?edit={id}` | Client Component behind the session guard. | module `create` or `update`; `getById` to prefill |
| `sitemap.ts` | Route. | catalog `search` paginated with `pageSize=100` until `total` is reached, `revalidate = 3600` |

`CategoryPage` keeps the draft-versus-applied filter model. The live count
next to the apply button comes from a debounced (300 ms) module `search` with
`pageSize=1`, reading `total`, in a transition, cancelled by an `AbortController`
when the draft changes again. Facet counts grey out options with zero matches.

`ListingCard` renders `CatalogCard` (home, search, favorites, profile) or a
module listing (door pages) through one props shape: `{ id, category,
subcategory, title, price, city, images or coverImage, featured, verified,
publishedAt, card }`. Door pages map their module listing to that shape in the
page, so the card has one implementation.

### 4.8 Auth and session

- Packages: `@supabase/supabase-js`, `@supabase/ssr`.
- Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Locally
  both point at the Supabase CLI stack (`supabase start`, URL
  `http://127.0.0.1:54321`), which the API's `appsettings.Development.json`
  already targets, so tokens issued locally validate locally.
- `src/lib/supabase/server.ts` and `client.ts` follow the `@supabase/ssr`
  cookie pattern. `middleware.ts` calls the session refresh before the locale
  rewrite and keeps its matcher.
- `AppProvider` drops `user`, `signIn`, `signUp`, `updateUser`, `signOut`,
  `published`, `publishListing`, `updateListing` and `deleteListing`. It
  exposes `session` (Supabase user or null), `profile` (`SellerSummary` or
  null, fetched once after sign-in), `refreshProfile`, and `createHref`
  computed from `session`.
- Sign-in: email and password; the phone-or-email input becomes an email
  input. Sign-up: email, password, name, phone; after `signUp` succeeds it
  calls `putMyProfile` with `type: "private"`, `hasWhatsApp` and friends
  false. Forgot-password calls `resetPasswordForEmail`; the reset landing
  page is a new `/reset-password` route that calls `updateUser`. Profile
  settings edit name, phone, type and the three messenger flags through
  `putMyProfile`; avatar upload goes through media with `purpose: avatar`.
- Guarded routes (`/create`, `/profile`) redirect to `/sign-in?next=` on the
  server when there is no session.

### 4.9 Wizard

- `ListingDraft` keeps its shape with these changes: `term` and `urgent`
  removed; `city` and `district` hold slugs; `currency` is `USD | AMD`;
  `period` derived from the door (`sale` total, `rent` month, `daily` night,
  services hour or total chosen in the price step); jobs gain `expiresAt`.
- `draftToCreateRequest(draft)` returns the module's create request. It
  omits fields the contract forbids for the chosen subcategory (land has no
  `rooms`; garages have no `floor`; parts have no vehicle fields), so a
  forbidden field can never reach the API by accident.
- Publish flow: upload each photo in order (media `createUploadUrl`, then
  the signed `PUT`), collect `objectPath`, then call `create`. Photos that
  already are URLs (edit mode, seed images) are sent as they are. A failed
  upload marks that photo with a retry control and blocks publish until
  resolved or removed. On 201, the success state links to
  `/{door}/{id}`.
- Edit mode: `/create?edit={id}` fetches the listing, checks
  `seller.id === profile.id`, prefills through `listingToDraft`, and submits
  through `update`. Delete on the profile tab calls `archive` after the
  existing confirm dialog.

### 4.10 Images

`next.config.mjs` adds `remotePatterns` for the Supabase Storage public host,
derived from `NEXT_PUBLIC_SUPABASE_URL` at config time, and keeps
`images.unsplash.com` for seed rows and `i.pravatar.cc` until seed avatars
move.

## 5. Error handling

| Where | Status | Behaviour |
| --- | --- | --- |
| Server page | 404 | `notFound()` |
| Server page | other | throws; `error.tsx` per route group shows a retry button |
| Door page | 400 keyed by parameter | the page removes that parameter from the URL and re-fetches once; a second 400 falls through to `error.tsx` |
| Wizard | 400 keyed by field | errors map onto the draft's step errors; the wizard jumps to the first offending step |
| Wizard, profile | 401 | redirect to `/sign-in?next=` |
| Wizard | 422 profile-required | opens the profile settings form inline, then retries publish |
| Any write | 429 | toast with the retry-after hint |
| Upload | non-2xx on the `PUT` | that photo shows a retry control |
| Favorites | ids omitted | dropped from localStorage silently |

`ApiError.type` is the switch key, never the status alone, so a future error
code with the same status does not change behaviour by accident.

## 6. Testing

Vitest (dev dependency, node environment, no DOM), `src/**/*.test.ts`:

- `filtering.test.ts`: for every door, `filtersToQuery(parseFilters(url))`
  equals the normalised `url`; the preset never appears in the URL; `cur`
  and comma lists serialise per §7.2.
- `draft.test.ts`: `draftToCreateRequest` for each subcategory omits forbidden
  fields and sets `period` from the deal; edit round-trip
  `draftToCreateRequest(listingToDraft(listing))` matches the listing.
- `client.test.ts`: problem parsing, query serialisation, base URL
  resolution, token header.
- `contract:check` in `typecheck` guards the generated types.

Smoke script `scripts/smoke-api.mts` against a running API: GET every door
page, one detail, home and `/search?q=` and assert 200 with at least one card
where the seed guarantees one.

Manual acceptance per web PR: the door renders the seed, filters change the
URL and the results, a detail page renders with its seller, a sign-up creates
a profile, a listing created through the wizard appears on its door and in
`property.listings`, edit changes it, delete archives it.

## 7. Sequencing

| Order | Stream | Deliverable | Depends on |
| --- | --- | --- | --- |
| 1 | API | PR 1 lands (v0.3.0) | none |
| 2 | Web | PR A: contract vendoring, client, types, auth, property doors, detail, home, search, favorites, profile read, sitemap | 1 |
| 3 | API | PR 1b (v0.3.1), then Jobs (v0.4.0) | 1 |
| 4 | Web | PR B: wizard create, edit, delete for property; profile settings | 3 |
| 5 | API | Vehicles (v0.5.0), Services (v0.6.0) | 3 |
| 6 | Web | PR C jobs, PR D vehicles, PR E services; each flips `source` and deletes its mock | 5 |
| 7 | Both | Delete remaining `src/mock` listing arrays, `legacy-types.ts`; note the frozen export script in the API README | 6 |

Steps 2 and 3 run in parallel. Every web PR leaves all six doors working.

## 8. Non-goals

Phone OTP; a sitemap index; canonical URLs for filter combinations;
per-listing reviews; messaging; the Next 16 upgrade of insyuniq; Playwright;
a cloud Supabase project (local CLI stack only until a deploy target is
chosen); any change to `InSyunik-Web`.

## 9. Open items for the writing-plans stage

- Exact vehicles and jobs parameter lists are copied from v0.4.0 and v0.5.0
  when those contracts are pinned; PR C and D plans are written then.
- The Supabase CLI stack needs `supabase init` in one of the repos; the
  proposal is `InSyunik-Api/supabase/` with config only, no migrations, so
  the API's rule that the CLI never touches module schemas holds.

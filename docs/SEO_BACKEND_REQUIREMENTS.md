# SEO data requirements for the real backend

This documents what the production API/database must guarantee once it
replaces `src/mock/*`, so that everything wired up in this pass (canonical
URLs, sitemap, JSON-LD, meta descriptions) keeps working — and doesn't quietly
start emitting invalid or misleading markup once real data flows through it.

The frontend code that consumes these fields lives in:
- `src/lib/seo.ts` — canonical/description helpers
- `src/lib/structured-data.ts` — JSON-LD builders
- `src/app/sitemap.ts`, `src/app/robots.ts`

If a field below doesn't exist yet in the data model, the current code either
fakes it (documented inline with a `TODO backend:`-style comment) or omits
that part of the markup. Search for `TODO backend` in the codebase to find
every such spot.

---

## 1. Every listing, regardless of category

| Field | Requirement | Why |
|---|---|---|
| `id` | Stable forever, URL-safe, never reused after deletion | It's the URL segment (`/cars/{id}`). Reusing an id for a different listing after deletion silently rewrites history for anyone who bookmarked or indexed the old URL. |
| `status` | At minimum `active` / `archived`/`deleted`, exposed to the API the site reads | `sitemap.ts` filters to `status === "active"` — the sitemap is only correct if this field is accurate and current. |
| `publishedAt` | ISO 8601 timestamp, immutable once set | Feeds `datePosted` in every listing's JSON-LD and the sitemap's `lastModified` fallback. |
| **`updatedAt`** ⚠️ missing from the current model | ISO 8601 timestamp, bumped on every edit | **Not in `BaseListing` today.** `sitemap.ts` currently reuses `publishedAt` as `lastModified` for every listing, which is wrong the moment a listing is edited without being "reposted." Add this field and wire it into the sitemap before launch — an inaccurate `lastModified` actively teaches Google to re-crawl less often. |
| `price` | Numeric, stored in one canonical currency (currently USD in the mock data) | JSON-LD (`structured-data.ts`) emits `priceCurrency: "USD"` unconditionally. If the backend ever stores price in a different base currency, or lets a currency be chosen per-listing, `listingJsonLd()` must read the listing's actual currency instead of the hardcoded string — a mismatch between the visible price and the schema price is a common cause of Search Console "Product markup invalid" reports. |
| `images` | Absolute HTTPS URLs, ≥ 3, first image ≥ 1200×630px | Used directly as Open Graph/Twitter images and in JSON-LD `image[]`. The first image is what social platforms crop into a preview card — anything under ~1200×630 gets upscaled and looks soft. |
| `city`, `district`, `address`, `coords` | All required, `coords` as real lat/lng (not the city centroid) | Feeds `PostalAddress`/`GeoCoordinates` in JSON-LD. A city-centroid fallback is fine as a stopgap but should be flagged in the API response (e.g. an `isApproximateLocation` flag) so the frontend can decide whether to still claim a precise `geo`. |
| `description` | Plain text, ideally 400–2000 characters, no HTML | `buildListingDescription()` in `src/lib/seo.ts` builds the meta description from this (price + city prefix, then this text truncated at a word boundary). Very short descriptions (<40 chars) will produce a meta description that's almost all boilerplate. |
| `verified` | Boolean, backend-authoritative (not user-settable) | Currently decorative on the page; if it starts feeding trust signals (e.g. a future `Review`/`aggregateRating`), it must reflect something the backend actually checked — false trust badges are a structured-data policy risk. |

**Deletion / expiry behavior the API must support:**
- A request for a listing `id` that no longer exists must return a real
  404 (the page already calls `notFound()` correctly) — never a soft 200
  with empty content.
- A listing that's permanently gone (not just sold) should ideally be
  distinguishable so the route can send **410 Gone** instead of 404 — Google
  drops 410s from the index faster than 404s.
- The sitemap generator (`src/app/sitemap.ts`) needs the *current* listing
  set on every build/request; if listings move to ISR/on-demand revalidation,
  the sitemap's revalidation window must be short enough that stale/removed
  listings don't linger in it.

---

## 2. Category-specific fields (used in `structured-data.ts`)

### Real estate (`real-estate`) and rentals (`rentals`)
Both map to schema.org `RealEstateListing` wrapping an `Apartment`/`House`/
`Place`, chosen from `subcategory`. Required for that block to be meaningful:

- `rooms`, `area` (m²), `floor`, `totalFloors`
- `deal` (`sale` | `rent`, real-estate only — controls the Offer's
  `businessFunction`; rentals are always treated as lease-out)

### Cars (`cars`)
Mapped to schema.org `Product` (see the code comment in
`structured-data.ts` for why — Google deprecated "Vehicle Listing"
structured data in September 2025, so `Product`/`Offer` is the closest type
that still earns a price/availability rich result).

- `brand`, `model`, `year`, `mileage`, `fuel`, `transmission`, `condition`
  (`new`/`used` → `NewCondition`/`UsedCondition`)
- If the backend ever adds VIN or a listing-quality photo count, both are
  worth surfacing — Merchant/Product rich results reward complete offers.

### Hotels / stays (`hotels`)
Mapped to `LodgingBusiness`. Needs `address`, `coords`, and `pool` (drives
`amenityFeature`). If real amenities (wifi, breakfast, parking) get added to
the data model later, extend `hotelJsonLd()` — `LodgingBusiness` supports an
open-ended `amenityFeature` list.

### Work / jobs (`work`)
Mapped to `JobPosting` — this is the one category with an **active, verified
Google rich-result payoff**. Google requires:

- `title`, `description`, `datePosted`, `hiringOrganization.name`,
  `jobLocation.address` (all present today via `employer`, `city`,
  `address`) ✅
- **`validThrough`** ⚠️ **not in the data model.** `WorkListing` has no
  expiry field, so `jobPostingJsonLd()` currently *synthesizes* one —
  `publishedAt + 45 days` — with a comment flagging it as a placeholder.
  **Add a real `expiresAt`/`validThrough` field before launch.** Google
  actively penalizes JobPosting rich results that stay listed past their
  real expiry (it's one of the few structured data types Google
  spot-checks for staleness), so a fake 45-day default is a launch blocker,
  not a nice-to-have.
- `baseSalary` currently reuses `price` (documented on `BaseListing` as
  "carries the monthly salary" for work listings) with a hardcoded
  `unitText: "MONTH"`. If a future job type pays hourly/annually, that unit
  needs to come from the data, not be assumed.

---

## 3. Filtering & URL surface (why canonical URLs matter here specifically)

`src/lib/filtering.ts` builds query strings from a large combinable set of
parameters per category — confirmed directly from the filter/default-filter
definitions:

- Common to every category: `q`, `city`, `priceMin`, `priceMax`,
  `withPhoto`, `verifiedOnly`, plus `sort` and `page`
- Real estate: + `subcategory`, `deal`, `district`, `rooms`, `areaMin/Max`,
  `floorMin/Max`, `totalFloorsMin`, `condition`, `buildingType`,
  `furniture`, `balcony`, `parking`
- Cars: + `subcategory`, `brand`, `model`, `yearMin/Max`, `mileageMin/Max`,
  `bodyType`, `fuel`, `engineMin/Max`, `transmission`, `drive`, `color`,
  `condition`, `steering`, `ownersMax`, `accidentFree`
- Rentals/Hotels: + `subcategory`, `term`, `rooms`, `areaMin/Max` (+`pool`
  for hotels)
- Work: + `subcategory`, `employmentType`, `experience`

That's tens of thousands of theoretically distinct, crawlable URLs per
category. The fix applied in this pass is a **flat canonical**: every
`/cars`, `/real-estate`, etc. URL — filtered or not — canonicalizes back to
the bare category URL (`alternates.canonical: "/cars"`). This is deliberately
conservative and correct today, but it means filtered views (e.g.
`?subcategory=suv`) don't compete for their own search visibility either.

**If/when the business wants specific filter combinations to rank on their
own** (a very reasonable next step — "apartments for rent in Kapan" is a real
search query), the backend/content decision needed is:
1. Which parameters represent a *distinct, marketable page* (typically just
   `subcategory`, maybe `city` and `deal`) vs. which are pure refinement
   noise (`priceMin`, `sort`, `page`, checkboxes).
2. For the first group, canonical should point at the normalized
   `?subcategory=X` URL instead of the bare category — not implemented yet,
   deliberately, since guessing wrong here creates the exact duplicate-content
   problem this pass was fixing.

---

## 4. Sitemap scale

`src/app/sitemap.ts` currently builds one in-memory array from
`ALL_LISTINGS`. Two things the backend integration must account for:

- **Sitemap size limits**: 50,000 URLs / 50MB per sitemap file. Fine for a
  regional classifieds site at launch; once listing volume grows, this needs
  to become a **sitemap index** (`sitemap.xml` listing multiple
  `sitemap-{category}-{page}.xml` files) — Next.js supports this via
  `generateSitemaps()` in the same file.
- **Freshness**: today it's computed at request/build time from static mock
  arrays. Against a real database, make sure this route's revalidation
  window (or ISR interval) is short enough that sold/removed listings drop
  out of the sitemap within hours, not days.

---

## 5. Currency consistency (cross-cutting)

Prices are stored once, in USD, and converted for display via
`CURRENCY_OPTIONS` in `src/lib/currency.ts`. The default display currency is
USD (`useState<Currency>("USD")` in `AppProvider`) until a returning visitor's
stored preference hydrates client-side — so the server-rendered HTML a
crawler sees and the JSON-LD price agree today. **If the default display
currency ever changes to something other than the JSON-LD's currency, or the
backend starts storing/returning listings already priced in AMD**, update
`listingJsonLd()`'s `priceCurrency` to read from the listing rather than the
current hardcoded `"USD"`.

---

## 6. Fields intentionally *not* requested

To keep this list honest: `reviews`/`rating` on `Seller` were not wired into
any structured data in this pass, even though a `Review`/`AggregateRating`
schema is tempting for a marketplace. Google's guidelines require review
markup to reflect reviews *of that specific listing*, not the seller's
general reputation — the current `Seller.rating` is agency/owner-level, not
per-listing, so attaching it to a `Product`/`RealEstateListing` would be a
guideline violation (self-serving/mismatched review markup). If per-listing
reviews are ever built, that's the point to add `AggregateRating`, not before.

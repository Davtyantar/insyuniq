# Approaches and design system: decision record

Date: 2026-09-23. Feeds `docs/superpowers/specs/2026-09-23-api-integration-design.md`
and every plan under `docs/superpowers/plans/` that implements it.
Versions come from `npm view` and GitHub on 2026-09-23. Items marked
*unverified* were not checked against a primary source.

## 1. What the requirements demand of the UI layer

| Requirement (spec section) | UI capability it needs |
| --- | --- |
| Server-rendered doors and detail pages (W8, 4.7) | Components that render in Server Components or as thin client islands |
| Faceted filters with a live count (4.5, 4.7) | Chip groups, multi-selects, range inputs, a mobile bottom sheet |
| RFC 9457 errors keyed by field (5) | A form layer that accepts server errors per field, plus an error summary |
| Seven-step publish wizard with uploads (4.9) | Stepper, file drop zone, per-file retry, review step |
| Supabase email and password (4.8) | Auth forms with inline errors |
| Armenian first, then Russian and English | Long-word tolerant layout; `hy-AM` number and date formatting done by hand (see `src/lib/format.ts`) |
| Mid-range phones on mobile data | Small client bundles; no runtime CSS-in-JS |

Hard constraints today: React 18.3, Next 14.2, Tailwind 3.4, TypeScript 6.
Any candidate that needs React 19 is out until the planned upgrade.

## 2. Component foundation

| Candidate | Latest | React 18 | Fit | Verdict |
| --- | --- | --- | --- | --- |
| shadcn on Radix (current) | `radix-ui` 1.6.7, shadcn CLI 4.21.0 | Yes | Native Tailwind; zero migration | **Keep** |
| shadcn on Base UI | `@base-ui/react` 1.8.0 (1.0 in 2025-12) | Yes | `<Form errors>` maps field errors directly; stable Drawer; different data attributes | Borrow single primitives in PR A2, full move deferred |
| Radix Themes | 3.3.0 | Yes | Own CSS and tokens, fights Tailwind | Reject |
| React Aria Components | 1.21.1 | Yes | Best accessibility and date handling; different API model | Reject for now; revisit for heavy date entry |
| Mantine | 9.6.2 | **No** (v9 needs React 19.2) | CSS modules | Reject |
| Chakra v3 / Ark / Park UI | 3.37.0 / 5.39.2 | Yes | Emotion runtime (Chakra); Park UI's Tailwind plugin unmaintained | Reject |
| HeroUI | 3.2.6 | **No** (v3 needs React 19) | Tailwind 4 | Reject |

**Decision D1: keep the existing shadcn-style Radix wrappers.** The sibling
`InSyunik-Web` is also on Radix (`components.json` style `radix-nova`; Base UI
appears in one file), so staying put is also the convergent choice.

**Decision D2: add Base UI one primitive at a time where Radix has nothing,**
starting in PR A2: `Form`/`Field` for server field errors, `Drawer` for the
filter and wizard sheets (the current sheet is a Radix Dialog variant; `vaul`
last published 2024-12). Base UI supports React 18, so this needs no upgrade.

**Decision D3: defer a full Base UI migration** to the React 19 + Tailwind 4
upgrade, run once across both web repos with shadcn's migration tooling.

Supporting libraries, adopted in the PR that first needs them:

| Need | Choice | First PR |
| --- | --- | --- |
| Toasts (429, publish success) | `sonner` 2.0.8 | A2 |
| Form state with server errors | `react-hook-form` 7.88, `setError` fed from `ApiError.errors` | A2 |
| Dates (job `expiresAt`) | `react-day-picker` | C |
| Filter URL state | keep `parseFilters` / `filtersToQuery`; `nuqs` 2.10.1 considered and not adopted, because the existing helpers already give typed round trips and the new property model is tested directly | — |

## 3. Patterns borrowed from reference design systems

| Source | Pattern | Where it lands |
| --- | --- | --- |
| GOV.UK | [Error summary](https://design-system.service.gov.uk/components/error-summary/) at the top of a failed step, each entry linking to its field | Wizard and auth forms (A2) |
| GOV.UK | [Question pages](https://design-system.service.gov.uk/patterns/question-pages/) and [Check answers](https://design-system.service.gov.uk/patterns/check-answers/) | The wizard's step shape and review step, already close; A2 adds "change" links |
| Baymard | [Mobile filtering](https://baymard.com/blog/ecommerce-mobile-filtering): sheet with a live result count on the apply button | Property doors (A1), via the debounced count request |
| Shopify Polaris | [Drop zone](https://shopify.dev/docs/api/app-home/latest/web-components/forms/drop-zone) with per-file status | Photo step upload states (A2) |
| Atlassian | [Error message writing](https://atlassian.design/foundations/content/designing-messages/error-messages): say what happened and what to do | Every `ApiError` message shown to users |
| Adobe Spectrum | [International design](https://spectrum.adobe.com/page/international-design/): budget for text expansion | Chip and button layouts, already a known Armenian issue |

## 4. Architecture approaches compared

| Concern | Reference practice | This project's choice | Why it differs, if it does |
| --- | --- | --- | --- |
| Data layer | Medusa `dtc-starter`: `src/lib/data/*` modules marked `server-only`, one fetch wrapper injecting auth | `src/lib/api/*`, one wrapper, **isomorphic** | The live filter count, favorites hydration and header suggestions call the API from the browser; only token reading (A2) is `server-only` |
| Typed client | openapi-typescript + openapi-fetch; alternatives @hey-api/openapi-ts 0.99 (pre-1.0), Orval 8.37, Kubb 5.3 | openapi-typescript 7.13 + openapi-fetch 0.17 | Types-only generation, one ~6 kB runtime, plain `fetch` so Next caching options pass through. Verified 2026-09-23: generation from the v0.3.0 contract, typed calls under TypeScript 6 (with an npm `overrides` entry), runtime auth middleware and problem parsing |
| Enum source | Hand-written unions in most starters | `--enum-values` runtime arrays generated from the contract | The contract is the only hand-written copy of every closed set (API ADR 0004); the web must not add a second |
| Caching | Vercel Commerce: `cacheTag` + `revalidateTag` | `dynamic = "force-dynamic"` on API-backed routes | New listings must appear immediately (W8); tag revalidation needs a webhook from the API that does not exist yet |
| Auth in App Router | Supabase SSR guide, `@supabase/ssr` 0.12.7 | Same (A2) | — |
| Filter URL state | Sharetribe `util/search.js`, Vercel `createUrl()` | Existing `filtersToQuery` pattern with a typed property model | Proven in this codebase; URL is the API query minus the door preset |

No actively maintained open-source Next.js classifieds codebase was found;
the references above are commerce and marketplace templates.

## 5. Findings about this repository

- `@types/react` 19 is installed next to React 18. Switching to React 18
  types produces zero typecheck errors (checked 2026-09-23); PR A1 fixes it.
- `openapi-typescript` 7.13 declares `typescript ^5`; the repo is on
  TypeScript 6. An npm `overrides` entry resolves it; generation and a strict
  typecheck of generated calls both pass.
- Baseline on `feat/api-client` at 2026-09-23: `npm ci`, `tsc --noEmit`,
  `next lint` and `next build` all pass; every listing route is prerendered
  from mock data today.

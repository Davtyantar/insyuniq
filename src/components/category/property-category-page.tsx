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

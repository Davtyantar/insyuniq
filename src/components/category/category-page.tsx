"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { CityAccent } from "@/components/city-accent";
import { FilterDrawer } from "@/components/filters/filter-drawer";
import { FilterPanel } from "@/components/filters/filter-panel";
import { EmptyState } from "@/components/listings/empty-state";
import { ListingGrid } from "@/components/listings/listing-grid";
import { Pagination } from "@/components/listings/pagination";
import { ResultsToolbar } from "@/components/listings/results-toolbar";
import { CATEGORIES } from "@/lib/categories";
import { PAGE_SIZE } from "@/lib/constants";
import {
  countActiveFilters,
  defaultFilters,
  filterCars,
  filterHotels,
  filterRealEstate,
  filterRentals,
  filtersToQuery,
  parseFilters,
  sortListings,
} from "@/lib/filtering";
import type {
  AnyFilters,
  CarFilters,
  CarListing,
  CategorySlug,
  HotelFilters,
  HotelListing,
  Listing,
  RealEstateFilters,
  RealEstateListing,
  RentalFilters,
  RentalListing,
  SortKey,
  ViewMode,
} from "@/lib/types";
import { cn } from "@/lib/utils";

function runFilters(category: CategorySlug, listings: Listing[], filters: AnyFilters): Listing[] {
  if (category === "cars") return filterCars(listings as CarListing[], filters as CarFilters);
  if (category === "rentals") return filterRentals(listings as RentalListing[], filters as RentalFilters);
  if (category === "hotels") return filterHotels(listings as HotelListing[], filters as HotelFilters);
  return filterRealEstate(listings as RealEstateListing[], filters as RealEstateFilters);
}

export function CategoryPage({ category }: { category: CategorySlug }) {
  const config = CATEGORIES[category];
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const defaults = React.useMemo(() => defaultFilters(category), [category]);
  const applied = React.useMemo(
    () => parseFilters(defaults, new URLSearchParams(searchParams.toString())),
    [defaults, searchParams],
  );
  const sort = (searchParams.get("sort") as SortKey) || "relevant";
  const page = Number(searchParams.get("page") ?? 1) || 1;

  const [draft, setDraft] = React.useState<AnyFilters>(applied);
  const [view, setView] = React.useState<ViewMode>("grid");
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  // Keep the draft in sync when the URL changes (back/forward, quick chips).
  React.useEffect(() => setDraft(applied), [applied]);

  const results = React.useMemo(
    () => sortListings(runFilters(category, config.listings, applied), sort),
    [category, config.listings, applied, sort],
  );
  const draftCount = React.useMemo(
    () => runFilters(category, config.listings, draft).length,
    [category, config.listings, draft],
  );

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const activeCount = countActiveFilters(defaults, applied);

  const navigate = React.useCallback(
    (filters: AnyFilters, extra: Record<string, string | undefined> = {}) => {
      const query = filtersToQuery(defaults, filters, {
        sort: sort === "relevant" ? undefined : sort,
        ...extra,
      });
      startTransition(() => router.push(`${pathname}${query}`, { scroll: false }));
    },
    [defaults, pathname, router, sort],
  );

  function patchDraft(patch: Partial<AnyFilters>) {
    setDraft((prev) => ({ ...prev, ...patch }) as AnyFilters);
  }

  function applyDraft() {
    navigate(draft, { page: undefined });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetFilters() {
    setDraft(defaults);
    startTransition(() => router.push(pathname, { scroll: false }));
  }

  function changeSort(next: SortKey) {
    const query = filtersToQuery(defaults, applied, {
      sort: next === "relevant" ? undefined : next,
    });
    startTransition(() => router.push(`${pathname}${query}`, { scroll: false }));
  }

  function changePage(next: number) {
    const query = filtersToQuery(defaults, applied, {
      sort: sort === "relevant" ? undefined : sort,
      page: next === 1 ? undefined : String(next),
    });
    startTransition(() => router.push(`${pathname}${query}`, { scroll: false }));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function selectSubcategory(value: string) {
    navigate({ ...draft, subcategory: value } as AnyFilters, { page: undefined });
  }

  const subcategory = (applied as { subcategory: string }).subcategory;

  return (
    <div className="container py-5 lg:py-8">
      <nav className="flex items-center gap-1.5 text-[13px] text-foreground/70">
        <Link href="/" className="transition-colors hover:text-foreground">
          Գլխավոր
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">{config.label}</span>
        {subcategory && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground">
              {config.subcategories.find((s) => s.value === subcategory)?.label}
            </span>
          </>
        )}
      </nav>

      <h1 className="mt-3 text-2xl font-semibold tracking-tight lg:text-[28px]">
        {subcategory
          ? config.subcategories.find((s) => s.value === subcategory)?.label
          : config.label}
        <CityAccent />{" "}
        {applied.city && <span className="text-muted-foreground">· {applied.city}</span>}
      </h1>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          type="button"
          onClick={() => selectSubcategory("")}
          className={cn(
            "h-9 shrink-0 rounded-md border px-3.5 text-[13px] font-medium transition-colors",
            !subcategory
              ? "border-primary bg-primary text-primary-foreground"
              : "border-input bg-card hover:bg-secondary",
          )}
        >
          Բոլորը
        </button>
        {config.subcategories.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => selectSubcategory(item.value)}
            className={cn(
              "h-9 shrink-0 rounded-md border px-3.5 text-[13px] font-medium transition-colors",
              subcategory === item.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-card hover:bg-secondary",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-[124px] max-h-[calc(100vh-148px)] overflow-y-auto thin-scrollbar rounded-lg border border-border bg-card p-4">
            <FilterPanel
              category={category}
              filters={draft}
              onChange={patchDraft}
              onApply={applyDraft}
              onReset={resetFilters}
              activeCount={activeCount}
              resultCount={draftCount}
            />
          </div>
        </aside>

        <section className="space-y-4">
          <ResultsToolbar
            category={category}
            total={results.length}
            sort={sort}
            onSortChange={changeSort}
            view={view}
            onViewChange={setView}
            onOpenFilters={() => setDrawerOpen(true)}
            activeFilters={activeCount}
          />

          {results.length === 0 && !isPending ? (
            <EmptyState
              title="Ոչինչ չի գտնվել"
              description="Փորձեք փոխել ֆիլտրերը կամ ընդլայնել գնի միջակայքը — այս ընտրանքում համապատասխան հայտարարություններ չկան։"
              action={{ label: "Զրոյացնել ֆիլտրերը", onClick: resetFilters }}
              secondaryAction={{ label: "Հրապարակել հայտարարություն", href: "/create" }}
            />
          ) : (
            <ListingGrid
              listings={pageItems}
              view={view}
              loading={isPending}
              skeletonCount={Math.min(PAGE_SIZE, Math.max(pageItems.length, 6))}
              columns={3}
            />
          )}

          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={changePage}
            className="pt-2"
          />
        </section>
      </div>

      <FilterDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        category={category}
        filters={draft}
        onChange={patchDraft}
        onApply={applyDraft}
        onReset={resetFilters}
        activeCount={activeCount}
        resultCount={draftCount}
      />
    </div>
  );
}

"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CityAccent } from "@/components/city-accent";
import { EmptyState } from "@/components/listings/empty-state";
import { ListingGrid } from "@/components/listings/listing-grid";
import { SortSelect, ViewToggle } from "@/components/listings/results-toolbar";
import { useApp } from "@/components/providers/app-provider";
import { FloatingTabs } from "@/components/ui/floating-tabs";
import { searchCatalog } from "@/lib/api/catalog";
import { createApi } from "@/lib/api/client";
import { type CardModel, catalogCard, isCard, legacyCard, sortCards } from "@/lib/card";
import { MOCK_DOORS } from "@/lib/categories";
import { plural } from "@/lib/format";
import { citySlugOf } from "@/lib/geo";
import type { SortKey, ViewMode } from "@/lib/types";
import { ALL_LISTINGS } from "@/mock/listings";

/** The catalog page cap. Search is not paginated yet; see "Known gaps" in the plan. */
const SEARCH_API_LIMIT = 100;

const TABS = [
  { value: "all", label: "Բոլորը" },
  { value: "real-estate", label: "Անշարժ գույքի վաճառք" },
  { value: "cars", label: "Ավտոմեքենաներ" },
  { value: "rentals", label: "Վարձակալություն" },
  { value: "hotels", label: "Հյուրանոցներ և հանգիստ" },
  { value: "work", label: "Աշխատանք" },
  { value: "services", label: "Ծառայություններ" }
];

/** Cross-category search: text, city and price only — deeper filters live on category pages. */
export function SearchResults() {
  const router = useRouter();
  const { localizeHref, createHref } = useApp();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const city = searchParams.get("city") ?? "";
  const priceMax = Number(searchParams.get("priceMax") ?? "") || undefined;

  const [tab, setTab] = React.useState("all");
  const [sort, setSort] = React.useState<SortKey>("relevant");
  const [view, setView] = React.useState<ViewMode>("grid");

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

  const visible =
    tab === "all" ? results : results.filter((card) => card.door === tab);

  return (
    <div className='container py-6 lg:py-8'>
      <h1 className='text-2xl font-semibold tracking-tight lg:text-[28px]'>
        {q ? (
          `Արդյունքներ «${q}» հարցման համար`
        ) : (
          <>
            Բոլոր հայտարարությունները
            <CityAccent />
          </>
        )}
      </h1>
      {!loading && (
        <p className='mt-1 text-sm text-muted-foreground'>
          {visible.length}{" "}
          {plural(visible.length, "հայտարարություն", "հայտարարություններ")}
          {city && ` · ${city}`}
        </p>
      )}

      <div className='mt-5 flex flex-wrap items-center justify-between gap-3'>
        <FloatingTabs items={TABS} value={tab} onChange={setTab} />
        <div className='flex items-center gap-2'>
          <SortSelect
            category={
              tab === "cars" ||
              tab === "rentals" ||
              tab === "hotels" ||
              tab === "work" ||
              tab === "services"
                ? tab
                : "real-estate"
            }
            sort={sort}
            onSortChange={setSort}
          />
          <ViewToggle view={view} onViewChange={setView} />
        </div>
      </div>

      <div className='mt-5'>
        {!loading && visible.length === 0 ? (
          <EmptyState
            title='Ոչինչ չի գտնվել'
            description='Փորձեք այլ հարցում կամ դիտեք հայտարարությունները ըստ կատեգորիաների։'
            action={{
              label: "Մաքրել որոնումը",
              onClick: () => router.push(localizeHref("/search"))
            }}
            secondaryAction={{
              label: "Հրապարակել հայտարարություն",
              href: createHref
            }}
          />
        ) : (
          <ListingGrid cards={visible} loading={loading} view={view} columns={4} />
        )}
      </div>
    </div>
  );
}

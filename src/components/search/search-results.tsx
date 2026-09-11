"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CityAccent } from "@/components/city-accent";
import { EmptyState } from "@/components/listings/empty-state";
import { ListingGrid } from "@/components/listings/listing-grid";
import { SortSelect, ViewToggle } from "@/components/listings/results-toolbar";
import { FloatingTabs } from "@/components/ui/floating-tabs";
import { sortListings } from "@/lib/filtering";
import { plural } from "@/lib/format";
import type { SortKey, ViewMode } from "@/lib/types";
import { ALL_LISTINGS } from "@/mock/listings";

const TABS = [
  { value: "all", label: "Բոլորը" },
  { value: "real-estate", label: "Անշարժ գույք" },
  { value: "cars", label: "Ավտոմեքենաներ" },
  { value: "rentals", label: "Վարձակալություն" },
  { value: "hotels", label: "Հյուրանոցներ և հանգիստ" },
  { value: "work", label: "Աշխատանք" },
];

/** Cross-category search: text, city and price only — deeper filters live on category pages. */
export function SearchResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const city = searchParams.get("city") ?? "";
  const priceMax = Number(searchParams.get("priceMax") ?? "") || undefined;

  const [tab, setTab] = React.useState("all");
  const [sort, setSort] = React.useState<SortKey>("relevant");
  const [view, setView] = React.useState<ViewMode>("grid");

  const results = React.useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    const matched = ALL_LISTINGS.filter((listing) => {
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
    });
    return sortListings(matched, sort);
  }, [q, city, priceMax, sort]);

  const visible = tab === "all" ? results : results.filter((l) => l.category === tab);

  return (
    <div className="container py-6 lg:py-8">
      <h1 className="text-2xl font-semibold tracking-tight lg:text-[28px]">
        {q ? (
          `Արդյունքներ «${q}» հարցման համար`
        ) : (
          <>
            Բոլոր հայտարարությունները
            <CityAccent />
          </>
        )}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {visible.length} {plural(visible.length, "հայտարարություն", "հայտարարություններ")}
        {city && ` · ${city}`}
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <FloatingTabs items={TABS} value={tab} onChange={setTab} />
        <div className="flex items-center gap-2">
          <SortSelect
            category={
              tab === "cars" || tab === "rentals" || tab === "hotels" || tab === "work"
                ? tab
                : "real-estate"
            }
            sort={sort}
            onSortChange={setSort}
          />
          <ViewToggle view={view} onViewChange={setView} />
        </div>
      </div>

      <div className="mt-5">
        {visible.length === 0 ? (
          <EmptyState
            title="Ոչինչ չի գտնվել"
            description="Փորձեք այլ հարցում կամ դիտեք հայտարարությունները ըստ կատեգորիաների։"
            action={{ label: "Մաքրել որոնումը", onClick: () => router.push("/search") }}
            secondaryAction={{ label: "Հրապարակել հայտարարություն", href: "/create" }}
          />
        ) : (
          <ListingGrid listings={visible} view={view} columns={4} />
        )}
      </div>
    </div>
  );
}

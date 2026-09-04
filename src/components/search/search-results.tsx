"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EmptyState } from "@/components/listings/empty-state";
import { ListingGrid } from "@/components/listings/listing-grid";
import { SortSelect, ViewToggle } from "@/components/listings/results-toolbar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sortListings } from "@/lib/filtering";
import { plural } from "@/lib/format";
import type { SortKey, ViewMode } from "@/lib/types";
import { ALL_LISTINGS } from "@/mock/listings";

const TABS = [
  { value: "all", label: "Все" },
  { value: "real-estate", label: "Недвижимость" },
  { value: "cars", label: "Автомобили" },
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
        {q ? `Результаты по запросу «${q}»` : "Все объявления"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {visible.length} {plural(visible.length, "объявление", "объявления", "объявлений")}
        {city && ` · ${city}`}
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            {TABS.map((item) => (
              <TabsTrigger key={item.value} value={item.value}>
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <SortSelect
            category={tab === "cars" ? "cars" : "real-estate"}
            sort={sort}
            onSortChange={setSort}
          />
          <ViewToggle view={view} onViewChange={setView} />
        </div>
      </div>

      <div className="mt-5">
        {visible.length === 0 ? (
          <EmptyState
            title="Ничего не найдено"
            description="Попробуйте другой запрос или посмотрите объявления по категориям."
            action={{ label: "Сбросить поиск", onClick: () => router.push("/search") }}
            secondaryAction={{ label: "Подать объявление", href: "/create" }}
          />
        ) : (
          <ListingGrid listings={visible} view={view} columns={4} />
        )}
      </div>
    </div>
  );
}

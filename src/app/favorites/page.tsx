"use client";

import * as React from "react";
import { Heart } from "lucide-react";
import { EmptyState } from "@/components/listings/empty-state";
import { ListingGrid } from "@/components/listings/listing-grid";
import { useApp } from "@/components/providers/app-provider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { plural } from "@/lib/format";
import { getListings } from "@/mock/listings";

const TABS = [
  { value: "all", label: "Все" },
  { value: "real-estate", label: "Недвижимость" },
  { value: "cars", label: "Автомобили" },
  { value: "rentals", label: "Аренда" },
  { value: "hotels", label: "Отели и отдых" },
];

export default function FavoritesPage() {
  const { favorites, hydrated } = useApp();
  const [tab, setTab] = React.useState("all");

  const listings = getListings(favorites);
  const visible = tab === "all" ? listings : listings.filter((l) => l.category === tab);
  const counts = {
    all: listings.length,
    "real-estate": listings.filter((l) => l.category === "real-estate").length,
    cars: listings.filter((l) => l.category === "cars").length,
    rentals: listings.filter((l) => l.category === "rentals").length,
    hotels: listings.filter((l) => l.category === "hotels").length,
  } as Record<string, number>;

  return (
    <div className="container py-6 lg:py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight lg:text-[28px]">Избранное</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {hydrated
              ? `${listings.length} ${plural(listings.length, "объявление", "объявления", "объявлений")} сохранено`
              : "Загружаем сохранённые объявления…"}
          </p>
        </div>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            {TABS.map((item) => (
              <TabsTrigger key={item.value} value={item.value} className="gap-1.5">
                {item.label}
                <span className="text-[11px] opacity-60">{counts[item.value]}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </header>

      <div className="mt-6">
        {!hydrated ? (
          <ListingGrid listings={[]} loading skeletonCount={6} columns={3} />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={Heart}
            title={listings.length === 0 ? "В избранном пока пусто" : "В этой категории пусто"}
            description="Нажимайте на сердечко в карточке объявления, чтобы вернуться к нему позже с любого устройства."
            action={{ label: "Смотреть недвижимость", href: "/real-estate" }}
            secondaryAction={{ label: "Смотреть автомобили", href: "/cars" }}
          />
        ) : (
          <ListingGrid listings={visible} columns={3} />
        )}
      </div>
    </div>
  );
}

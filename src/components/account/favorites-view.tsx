"use client";

import * as React from "react";
import { Heart, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/listings/empty-state";
import { ListingGrid } from "@/components/listings/listing-grid";
import { ViewToggle } from "@/components/listings/results-toolbar";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { FloatingTabs } from "@/components/ui/floating-tabs";
import type { ViewMode } from "@/lib/types";
import { getListings } from "@/mock/listings";

export function FavoritesView() {
  const { t } = useTranslation();
  const { favorites, hydrated, clearFavorites } = useApp();
  const [tab, setTab] = React.useState("all");
  const [view, setView] = React.useState<ViewMode>("grid");

  function handleClearAll() {
    if (window.confirm(t("favorites.clearAllConfirm"))) clearFavorites();
  }

  const TABS = [
    { value: "all", label: t("favorites.tabs.all") },
    { value: "real-estate", label: t("favorites.tabs.realEstate") },
    { value: "cars", label: t("favorites.tabs.cars") },
    { value: "rentals", label: t("favorites.tabs.rentals") },
    { value: "hotels", label: t("favorites.tabs.hotels") },
    { value: "services", label: t("favorites.tabs.services") },
  ];

  const listings = getListings(favorites);
  const visible = tab === "all" ? listings : listings.filter((l) => l.category === tab);

  return (
    <div className="container py-6 lg:py-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight lg:text-[28px]">{t("common.favorites")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {hydrated ? t("favorites.count", { count: listings.length }) : t("favorites.loading")}
        </p>
      </header>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <FloatingTabs items={TABS} value={tab} onChange={setTab} />
        <div className="flex items-center gap-2">
          {hydrated && listings.length > 0 && (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleClearAll}>
              <Trash2 className="h-4 w-4" />
              {t("favorites.clearAll")}
            </Button>
          )}
          <ViewToggle view={view} onViewChange={setView} />
        </div>
      </div>

      <div className="mt-5">
        {!hydrated ? (
          <ListingGrid listings={[]} loading skeletonCount={6} view={view} columns={4} dense />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={Heart}
            title={listings.length === 0 ? t("favorites.emptyAll.title") : t("favorites.emptyCategory.title")}
            description={t("favorites.emptyAll.description")}
            action={{ label: t("favorites.emptyAll.action"), href: "/real-estate" }}
            secondaryAction={{ label: t("favorites.emptyAll.secondaryAction"), href: "/cars" }}
          />
        ) : (
          <ListingGrid listings={visible} view={view} columns={4} dense />
        )}
      </div>
    </div>
  );
}

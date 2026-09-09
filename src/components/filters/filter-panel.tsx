"use client";

import { RotateCcw } from "lucide-react";
import { CarFilterFields } from "@/components/filters/car-filters";
import { HotelFilterFields } from "@/components/filters/hotel-filters";
import { RealEstateFilterFields } from "@/components/filters/real-estate-filters";
import { RentalFilterFields } from "@/components/filters/rental-filters";
import { Button } from "@/components/ui/button";
import type {
  AnyFilters,
  CarFilters,
  CategorySlug,
  HotelFilters,
  RealEstateFilters,
  RentalFilters,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export interface FilterPanelProps {
  category: CategorySlug;
  filters: AnyFilters;
  onChange: (patch: Partial<AnyFilters>) => void;
  onApply: () => void;
  onReset: () => void;
  activeCount: number;
  resultCount: number;
  className?: string;
  /** Drawer mode gets a sticky action bar pinned to the bottom of the sheet. */
  variant?: "sidebar" | "drawer";
}

export function FilterFields({
  category,
  filters,
  onChange,
}: Pick<FilterPanelProps, "category" | "filters" | "onChange">) {
  if (category === "cars") {
    return (
      <CarFilterFields
        filters={filters as CarFilters}
        onChange={onChange as (patch: Partial<CarFilters>) => void}
      />
    );
  }
  if (category === "rentals") {
    return (
      <RentalFilterFields
        filters={filters as RentalFilters}
        onChange={onChange as (patch: Partial<RentalFilters>) => void}
      />
    );
  }
  if (category === "hotels") {
    return (
      <HotelFilterFields
        filters={filters as HotelFilters}
        onChange={onChange as (patch: Partial<HotelFilters>) => void}
      />
    );
  }
  return (
    <RealEstateFilterFields
      filters={filters as RealEstateFilters}
      onChange={onChange as (patch: Partial<RealEstateFilters>) => void}
    />
  );
}

export function FilterPanel({
  category,
  filters,
  onChange,
  onApply,
  onReset,
  activeCount,
  resultCount,
  className,
  variant = "sidebar",
}: FilterPanelProps) {
  const isDrawer = variant === "drawer";

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {!isDrawer && (
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-base font-semibold tracking-tight">Ֆիլտրեր</h2>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Զրոյացնել
            </button>
          )}
        </div>
      )}

      <div
        className={cn(
          "flex-1",
          isDrawer && "thin-scrollbar overflow-y-auto px-4 pb-4",
        )}
      >
        <FilterFields category={category} filters={filters} onChange={onChange} />
      </div>

      <div
        className={cn(
          "flex items-center gap-2 pt-4",
          isDrawer &&
            "sticky bottom-0 border-t border-border bg-card px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3",
        )}
      >
        <Button variant="accent" className="flex-1" onClick={onApply}>
          Ցույց տալ {resultCount}
        </Button>
        <Button variant="outline" onClick={onReset} className="shrink-0">
          Զրոյացնել
        </Button>
      </div>
    </div>
  );
}

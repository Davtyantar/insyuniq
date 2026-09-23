"use client";

import type * as React from "react";
import { RotateCcw } from "lucide-react";
import { CarFilterFields } from "@/components/filters/car-filters";
import { SingleOpenAccordion } from "@/components/filters/filter-fields";
import { HotelFilterFields } from "@/components/filters/hotel-filters";
import { RealEstateFilterFields } from "@/components/filters/real-estate-filters";
import { RentalFilterFields } from "@/components/filters/rental-filters";
import { ServiceFilterFields } from "@/components/filters/service-filters";
import { WorkFilterFields } from "@/components/filters/work-filters";
import { Button } from "@/components/ui/button";
import type {
  AnyFilters,
  CarFilters,
  CategorySlug,
  HotelFilters,
  RealEstateFilters,
  RentalFilters,
  ServiceFilters,
  WorkFilters,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

type FieldSource =
  | {
      category: CategorySlug;
      filters: AnyFilters;
      onChange: (patch: Partial<AnyFilters>) => void;
      renderFields?: never;
    }
  | {
      /** Doors on the API render their own fields; `mobile` is true inside the drawer. */
      renderFields: (mobile: boolean) => React.ReactNode;
      category?: never;
      filters?: never;
      onChange?: never;
    };

export type FilterPanelProps = FieldSource & {
  onApply: () => void;
  onReset: () => void;
  activeCount: number;
  resultCount: number;
  className?: string;
  /** Drawer mode gets a sticky action bar pinned to the bottom of the sheet. */
  variant?: "sidebar" | "drawer";
};

export function FilterFields({
  category,
  filters,
  onChange,
  mobile = false,
}: {
  category: CategorySlug;
  filters: AnyFilters;
  onChange: (patch: Partial<AnyFilters>) => void;
  mobile?: boolean;
}) {
  const fields = (() => {
    if (category === "cars") {
      return (
        <CarFilterFields
          filters={filters as CarFilters}
          onChange={onChange as (patch: Partial<CarFilters>) => void}
          mobile={mobile}
        />
      );
    }
    if (category === "rentals") {
      return (
        <RentalFilterFields
          filters={filters as RentalFilters}
          onChange={onChange as (patch: Partial<RentalFilters>) => void}
          mobile={mobile}
        />
      );
    }
    if (category === "hotels") {
      return (
        <HotelFilterFields
          filters={filters as HotelFilters}
          onChange={onChange as (patch: Partial<HotelFilters>) => void}
          mobile={mobile}
        />
      );
    }
    if (category === "work") {
      return (
        <WorkFilterFields
          filters={filters as WorkFilters}
          onChange={onChange as (patch: Partial<WorkFilters>) => void}
          mobile={mobile}
        />
      );
    }
    if (category === "services") {
      return (
        <ServiceFilterFields
          filters={filters as ServiceFilters}
          onChange={onChange as (patch: Partial<ServiceFilters>) => void}
          mobile={mobile}
        />
      );
    }
    return (
      <RealEstateFilterFields
        filters={filters as RealEstateFilters}
        onChange={onChange as (patch: Partial<RealEstateFilters>) => void}
        mobile={mobile}
      />
    );
  })();

  // On the phone drawer only one section should be open at a time so the list stays short.
  return mobile ? <SingleOpenAccordion>{fields}</SingleOpenAccordion> : fields;
}

export function FilterPanel(props: FilterPanelProps) {
  const { onApply, onReset, activeCount, resultCount, className, variant = "sidebar" } = props;
  const isDrawer = variant === "drawer";

  return (
    <div className={cn("flex flex-col", isDrawer ? "min-h-0 flex-1" : "h-full", className)}>
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
          isDrawer && "thin-scrollbar overflow-y-auto px-4 pb-4 pt-4",
        )}
      >
        {props.renderFields ? (
          isDrawer ? <SingleOpenAccordion>{props.renderFields(true)}</SingleOpenAccordion> : props.renderFields(false)
        ) : (
          <FilterFields category={props.category} filters={props.filters} onChange={props.onChange} mobile={isDrawer} />
        )}
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

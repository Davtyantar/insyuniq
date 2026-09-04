"use client";

import { LayoutGrid, Rows3, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SORT_OPTIONS } from "@/lib/filtering";
import { plural } from "@/lib/format";
import type { CategorySlug, SortKey, ViewMode } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ResultsToolbarProps {
  category: CategorySlug;
  total: number;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onOpenFilters: () => void;
  activeFilters: number;
}

export function SortSelect({
  category,
  sort,
  onSortChange,
  className,
}: Pick<ResultsToolbarProps, "category" | "sort" | "onSortChange"> & { className?: string }) {
  return (
    <Select value={sort} onValueChange={(value) => onSortChange(value as SortKey)}>
      <SelectTrigger className={cn("h-9 w-[190px] text-[13px]", className)} aria-label="Сортировка">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {SORT_OPTIONS[category].map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function ViewToggle({
  view,
  onViewChange,
}: Pick<ResultsToolbarProps, "view" | "onViewChange">) {
  return (
    <div className="hidden items-center gap-0.5 rounded-md border border-input bg-card p-0.5 sm:flex">
      {(
        [
          { value: "grid" as const, icon: LayoutGrid, label: "Плиткой" },
          { value: "list" as const, icon: Rows3, label: "Списком" },
        ]
      ).map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onViewChange(option.value)}
          aria-label={option.label}
          aria-pressed={view === option.value}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
            view === option.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-secondary",
          )}
        >
          <option.icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}

export function ResultsToolbar({
  category,
  total,
  sort,
  onSortChange,
  view,
  onViewChange,
  onOpenFilters,
  activeFilters,
}: ResultsToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        Найдено{" "}
        <span className="font-medium text-foreground">
          {total.toLocaleString("ru-RU")} {plural(total, "объявление", "объявления", "объявлений")}
        </span>
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 lg:hidden"
          onClick={onOpenFilters}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Фильтры
          {activeFilters > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold text-accent-foreground">
              {activeFilters}
            </span>
          )}
        </Button>
        <SortSelect category={category} sort={sort} onSortChange={onSortChange} />
        <ViewToggle view={view} onViewChange={onViewChange} />
      </div>
    </div>
  );
}

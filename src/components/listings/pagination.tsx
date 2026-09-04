"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/** Compact page list: first, last, current neighbours, ellipsis for the rest. */
function pageItems(page: number, totalPages: number): (number | "gap")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const items: (number | "gap")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  if (start > 2) items.push("gap");
  for (let i = start; i <= end; i += 1) items.push(i);
  if (end < totalPages - 1) items.push("gap");
  items.push(totalPages);
  return items;
}

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className={cn("flex items-center justify-center gap-1", className)} aria-label="Страницы">
      <Button
        variant="outline"
        size="icon-sm"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Предыдущая страница"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {pageItems(page, totalPages).map((item, index) =>
        item === "gap" ? (
          <span key={`gap-${index}`} className="px-1 text-sm text-muted-foreground">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-current={item === page ? "page" : undefined}
            className={cn(
              "h-8 min-w-8 rounded-md px-2 text-sm font-medium transition-colors",
              item === page
                ? "bg-primary text-primary-foreground"
                : "border border-input bg-card hover:bg-secondary",
            )}
          >
            {item}
          </button>
        ),
      )}
      <Button
        variant="outline"
        size="icon-sm"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Следующая страница"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}

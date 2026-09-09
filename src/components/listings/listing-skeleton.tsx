import { Skeleton } from "@/components/ui/skeleton";
import type { ViewMode } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ListingCardSkeleton({ view = "grid" }: { view?: ViewMode }) {
  const isList = view === "list";
  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-xl border border-border/70 bg-card",
        isList && "sm:flex-row",
      )}
    >
      <Skeleton
        className={cn(
          "rounded-none",
          isList ? "aspect-[4/3] sm:aspect-auto sm:h-[212px] sm:w-[300px]" : "aspect-[4/3]",
        )}
      />
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="space-y-1.5 pt-1">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="container grid gap-8 py-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <div className="space-y-3">
        <Skeleton className="aspect-[4/3] w-full rounded-lg" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-28 rounded-md" />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    </div>
  );
}

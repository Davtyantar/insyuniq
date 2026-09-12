import { Skeleton } from "@/components/ui/skeleton";
import type { ViewMode } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ListingCardSkeleton({ view = "grid", dense = false }: { view?: ViewMode; dense?: boolean }) {
  const isList = view === "list";
  return (
    <div
      className={cn(
        "flex h-full overflow-hidden rounded-xl border border-border/70 bg-card",
        dense ? "flex-row" : "flex-col",
        isList ? "sm:flex-row" : "sm:flex-col",
      )}
    >
      <Skeleton
        className={cn(
          "shrink-0 rounded-none",
          dense ? "aspect-square w-28" : "aspect-[4/3]",
          isList ? "sm:aspect-auto sm:h-[212px] sm:w-[300px]" : "sm:aspect-[4/3] sm:w-full",
        )}
      />
      <div className={cn("flex flex-1 flex-col gap-2.5 p-4", dense && "gap-1.5 p-2 sm:gap-2.5 sm:p-4")}>
        <Skeleton className={cn("h-6 w-28", dense && "h-5 w-24 sm:h-6 sm:w-28")} />
        <Skeleton className={cn("h-4 w-3/4", dense && "h-3.5 sm:h-4")} />
        <Skeleton className="h-3 w-1/2" />
        <div className={cn("space-y-1.5 pt-1", dense && "hidden sm:block")}>
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

import { ListingCardSkeleton } from "@/components/listings/listing-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function CategoryPageSkeleton() {
  return (
    <div className="container py-5 lg:py-8">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-3 h-8 w-64" />
      <div className="mt-4 flex gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-28" />
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
        <Skeleton className="hidden h-[600px] w-full lg:block" />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-9 w-48" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <ListingCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

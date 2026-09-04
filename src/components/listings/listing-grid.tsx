import { ListingCard } from "@/components/listings/listing-card";
import { ListingCardSkeleton } from "@/components/listings/listing-skeleton";
import type { Listing, ViewMode } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ListingGridProps {
  listings: Listing[];
  view?: ViewMode;
  loading?: boolean;
  skeletonCount?: number;
  className?: string;
  /** Number of grid columns on large screens. */
  columns?: 2 | 3 | 4;
}

export function ListingGrid({
  listings,
  view = "grid",
  loading,
  skeletonCount = 6,
  className,
  columns = 3,
}: ListingGridProps) {
  const layout =
    view === "list"
      ? "grid grid-cols-1 gap-3"
      : cn(
          "grid grid-cols-1 gap-4 sm:grid-cols-2",
          columns === 2 && "lg:grid-cols-2",
          columns === 3 && "lg:grid-cols-3",
          columns === 4 && "lg:grid-cols-3 xl:grid-cols-4",
        );

  if (loading) {
    return (
      <div className={cn(layout, className)}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <ListingCardSkeleton key={index} view={view} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn(layout, className)}>
      {listings.map((listing, index) => (
        <ListingCard key={listing.id} listing={listing} view={view} priority={index < 3} />
      ))}
    </div>
  );
}

import { ListingCard } from "@/components/listings/listing-card";
import { ListingCardSkeleton } from "@/components/listings/listing-skeleton";
import type { CardModel } from "@/lib/card";
import type { ViewMode } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ListingGridProps {
  cards: CardModel[];
  view?: ViewMode;
  loading?: boolean;
  skeletonCount?: number;
  className?: string;
  /** Number of grid columns on large screens. */
  columns?: 2 | 3 | 4;
  /** Compact mobile list row — see ListingCard. Off by default for editorial/highlight grids. */
  dense?: boolean;
  /** See ListingCard's `hideDescription`. */
  hideDescription?: boolean;
}

export function ListingGrid({
  cards,
  view = "grid",
  loading,
  skeletonCount = 6,
  className,
  columns = 3,
  dense = false,
  hideDescription = false,
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
          <ListingCardSkeleton key={index} view={view} dense={dense} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn(layout, className)}>
      {cards.map((card, index) => (
        <ListingCard
          key={card.id}
          card={card}
          view={view}
          priority={index < 3}
          dense={dense}
          hideDescription={hideDescription}
        />
      ))}
    </div>
  );
}

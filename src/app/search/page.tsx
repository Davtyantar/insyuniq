import { Suspense } from "react";
import type { Metadata } from "next";
import { ListingCardSkeleton } from "@/components/listings/listing-skeleton";
import { SearchResults } from "@/components/search/search-results";

export const metadata: Metadata = {
  title: "Հայտարարությունների որոնում",
};

function SearchSkeleton() {
  return (
    <div className="container grid grid-cols-1 gap-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <ListingCardSkeleton key={index} />
      ))}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchResults />
    </Suspense>
  );
}

import { Suspense } from "react";
import type { Metadata } from "next";
import { ListingCardSkeleton } from "@/components/listings/listing-skeleton";
import { SearchResults } from "@/components/search/search-results";

export const metadata: Metadata = {
  title: "Հայտարարությունների որոնում",
  // Free-text search results are a different page per query string — thin,
  // near-duplicate content that shouldn't compete with the category hubs.
  robots: { index: false, follow: true },
  // Self-referencing (not query-specific) so this doesn't inherit the root
  // layout's "/" canonical, which would wrongly claim the homepage here.
  alternates: { canonical: "/search" },
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

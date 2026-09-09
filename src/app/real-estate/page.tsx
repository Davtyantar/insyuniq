import { Suspense } from "react";
import type { Metadata } from "next";
import { CategoryPage } from "@/components/category/category-page";
import { CategoryPageSkeleton } from "@/components/category/category-page-skeleton";

export const metadata: Metadata = {
  title: "Անշարժ գույք",
  description: "Բնակարաններ, տներ, նորակառույցներ, կոմերցիոն անշարժ գույք և հողատարածքներ։",
};

export default function RealEstatePage() {
  return (
    <Suspense fallback={<CategoryPageSkeleton />}>
      <CategoryPage category="real-estate" />
    </Suspense>
  );
}

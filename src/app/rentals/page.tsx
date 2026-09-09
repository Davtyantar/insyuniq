import { Suspense } from "react";
import type { Metadata } from "next";
import { CategoryPage } from "@/components/category/category-page";
import { CategoryPageSkeleton } from "@/components/category/category-page-skeleton";

export const metadata: Metadata = {
  title: "Аренда",
  description: "Квартиры, дома, коммерческая недвижимость и гаражи в аренду.",
};

export default function RentalsPage() {
  return (
    <Suspense fallback={<CategoryPageSkeleton />}>
      <CategoryPage category="rentals" />
    </Suspense>
  );
}

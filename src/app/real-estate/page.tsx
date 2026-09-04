import { Suspense } from "react";
import type { Metadata } from "next";
import { CategoryPage } from "@/components/category/category-page";
import { CategoryPageSkeleton } from "@/components/category/category-page-skeleton";

export const metadata: Metadata = {
  title: "Недвижимость",
  description: "Квартиры, дома, новостройки, коммерческая недвижимость и участки.",
};

export default function RealEstatePage() {
  return (
    <Suspense fallback={<CategoryPageSkeleton />}>
      <CategoryPage category="real-estate" />
    </Suspense>
  );
}

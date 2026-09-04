import { Suspense } from "react";
import type { Metadata } from "next";
import { CategoryPage } from "@/components/category/category-page";
import { CategoryPageSkeleton } from "@/components/category/category-page-skeleton";

export const metadata: Metadata = {
  title: "Автомобили",
  description: "Легковые, внедорожники, электромобили, грузовые и мото.",
};

export default function CarsPage() {
  return (
    <Suspense fallback={<CategoryPageSkeleton />}>
      <CategoryPage category="cars" />
    </Suspense>
  );
}

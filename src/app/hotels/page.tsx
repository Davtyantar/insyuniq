import { Suspense } from "react";
import type { Metadata } from "next";
import { CategoryPage } from "@/components/category/category-page";
import { CategoryPageSkeleton } from "@/components/category/category-page-skeleton";

export const metadata: Metadata = {
  title: "Отели и отдых",
  description: "Отели, гостевые дома и жильё для отдыха посуточно и на длительный срок.",
};

export default function HotelsPage() {
  return (
    <Suspense fallback={<CategoryPageSkeleton />}>
      <CategoryPage category="hotels" />
    </Suspense>
  );
}

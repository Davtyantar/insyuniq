import { Suspense } from "react";
import type { Metadata } from "next";
import { CategoryPage } from "@/components/category/category-page";
import { CategoryPageSkeleton } from "@/components/category/category-page-skeleton";

export const metadata: Metadata = {
  title: "Ավտոմեքենաներ",
  description: "Մարդատար մեքենաներ, ամենագնացներ, էլեկտրական մեքենաներ, բեռնատարներ և մոտոտեխնիկա։"
};

export default function CarsPage() {
  return (
    <Suspense fallback={<CategoryPageSkeleton />}>
      <CategoryPage category='cars' />
    </Suspense>
  );
}

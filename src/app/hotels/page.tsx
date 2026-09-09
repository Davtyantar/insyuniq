import { Suspense } from "react";
import type { Metadata } from "next";
import { CategoryPage } from "@/components/category/category-page";
import { CategoryPageSkeleton } from "@/components/category/category-page-skeleton";

export const metadata: Metadata = {
  title: "Հյուրանոցներ և հանգիստ",
  description: "Հյուրանոցներ, հյուրատներ և հանգստյան բնակատեղեր՝ օրավարձ և երկարաժամկետ։",
};

export default function HotelsPage() {
  return (
    <Suspense fallback={<CategoryPageSkeleton />}>
      <CategoryPage category="hotels" />
    </Suspense>
  );
}

import { Suspense } from "react";
import type { Metadata } from "next";
import { CategoryPage } from "@/components/category/category-page";
import { CategoryPageSkeleton } from "@/components/category/category-page-skeleton";

export const metadata: Metadata = {
  title: "Աշխատանք",
  description: "Թափուր աշխատատեղեր Սյունիքի մարզի գործատուներից։",
};

export default function WorkPage() {
  return (
    <Suspense fallback={<CategoryPageSkeleton />}>
      <CategoryPage category="work" />
    </Suspense>
  );
}

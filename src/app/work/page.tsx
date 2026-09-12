import { Suspense } from "react";
import type { Metadata } from "next";
import { CategoryPage } from "@/components/category/category-page";
import { CategoryPageSkeleton } from "@/components/category/category-page-skeleton";
import { JsonLd } from "@/components/seo/json-ld";
import { CATEGORIES } from "@/lib/categories";
import { breadcrumbJsonLd, categoryItemListJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Աշխատանք",
  description: "Թափուր աշխատատեղեր Սյունիքի մարզի գործատուներից։",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  const category = CATEGORIES.work;
  return (
    <>
      <JsonLd
        data={[
          categoryItemListJsonLd(category.label, category.href, category.listings),
          breadcrumbJsonLd([
            { name: "Գլխավոր", path: "/" },
            { name: category.label, path: category.href },
          ]),
        ]}
      />
      <Suspense fallback={<CategoryPageSkeleton />}>
        <CategoryPage category="work" />
      </Suspense>
    </>
  );
}

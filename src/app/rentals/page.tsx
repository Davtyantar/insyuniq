import { Suspense } from "react";
import type { Metadata } from "next";
import { CategoryPage } from "@/components/category/category-page";
import { CategoryPageSkeleton } from "@/components/category/category-page-skeleton";
import { JsonLd } from "@/components/seo/json-ld";
import { CATEGORIES } from "@/lib/categories";
import { breadcrumbJsonLd, categoryItemListJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Վարձակալություն",
  description: "Բնակարաններ, տներ, կոմերցիոն գույք և ավտոտնակներ վարձով։",
  alternates: { canonical: "/rentals" },
};

export default function RentalsPage() {
  const category = CATEGORIES.rentals;
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
        <CategoryPage category="rentals" />
      </Suspense>
    </>
  );
}

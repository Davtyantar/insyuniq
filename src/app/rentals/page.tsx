import { Suspense } from "react";
import type { Metadata } from "next";
import { CategoryPage } from "@/components/category/category-page";
import { CategoryPageSkeleton } from "@/components/category/category-page-skeleton";

export const metadata: Metadata = {
  title: "Վարձակալություն",
  description: "Բնակարաններ, տներ, կոմերցիոն գույք և ավտոտնակներ վարձով։",
};

export default function RentalsPage() {
  return (
    <Suspense fallback={<CategoryPageSkeleton />}>
      <CategoryPage category="rentals" />
    </Suspense>
  );
}

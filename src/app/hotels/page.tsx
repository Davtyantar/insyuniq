import type { Metadata } from "next";
import { PropertyDoorPage } from "@/components/category/property-door-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Հյուրանոցներ և հանգիստ",
  description: "Հյուրանոցներ, հյուրատներ և հանգստյան բնակատեղեր՝ օրավարձ և երկարաժամկետ։",
  alternates: { canonical: "/hotels" },
};

export default function HotelsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return <PropertyDoorPage door="hotels" searchParams={searchParams} />;
}

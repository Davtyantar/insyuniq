import type { Metadata } from "next";
import { PropertyDoorPage } from "@/components/category/property-door-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Վարձակալություն",
  description: "Բնակարաններ, տներ, կոմերցիոն գույք և ավտոտնակներ վարձով։",
  alternates: { canonical: "/rentals" },
};

export default function RentalsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return <PropertyDoorPage door="rentals" searchParams={searchParams} />;
}

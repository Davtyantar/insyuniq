import type { Metadata } from "next";
import { PropertyDoorPage } from "@/components/category/property-door-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Անշարժ գույքի վաճառք",
  description: "Բնակարաններ, տներ, նորակառույցներ, կոմերցիոն անշարժ գույք և հողատարածքներ։",
  alternates: { canonical: "/real-estate" },
};

export default function RealEstatePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return <PropertyDoorPage door="real-estate" searchParams={searchParams} />;
}

import type { Metadata } from "next";
import { PropertyDetailPage, propertyDetailMetadata } from "@/components/listing/property-detail-page";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return propertyDetailMetadata("rentals", params.id);
}

export default function RentalListingPage({ params }: PageProps) {
  return <PropertyDetailPage door="rentals" id={params.id} />;
}

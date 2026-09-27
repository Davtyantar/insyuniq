import type { Metadata } from "next";
import { PropertyDetailPage, propertyDetailMetadata } from "@/components/listing/property-detail-page";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return propertyDetailMetadata("hotels", params.id);
}

export default function HotelListingPage({ params }: PageProps) {
  return <PropertyDetailPage door="hotels" id={params.id} />;
}

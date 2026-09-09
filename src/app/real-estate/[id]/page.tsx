import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ListingDetails } from "@/components/listing/listing-details";
import { getRealEstate, getSimilar } from "@/mock/listings";
import { REAL_ESTATE_LISTINGS } from "@/mock/real-estate";

interface PageProps {
  params: { id: string };
}

export function generateStaticParams() {
  return REAL_ESTATE_LISTINGS.map((listing) => ({ id: listing.id }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const listing = getRealEstate(params.id);
  if (!listing) return { title: "Հայտարարությունը չի գտնվել" };
  return { title: listing.title, description: listing.description.slice(0, 160) };
}

export default function RealEstateListingPage({ params }: PageProps) {
  const listing = getRealEstate(params.id);
  if (!listing) notFound();
  return <ListingDetails listing={listing} similar={getSimilar(listing)} />;
}

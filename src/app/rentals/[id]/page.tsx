import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ListingDetails } from "@/components/listing/listing-details";
import { getRental, getSimilar } from "@/mock/listings";
import { RENTAL_LISTINGS } from "@/mock/rentals";

interface PageProps {
  params: { id: string };
}

export function generateStaticParams() {
  return RENTAL_LISTINGS.map((listing) => ({ id: listing.id }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const listing = getRental(params.id);
  if (!listing) return { title: "Объявление не найдено" };
  return { title: listing.title, description: listing.description.slice(0, 160) };
}

export default function RentalListingPage({ params }: PageProps) {
  const listing = getRental(params.id);
  if (!listing) notFound();
  return <ListingDetails listing={listing} similar={getSimilar(listing)} />;
}

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ListingDetails } from "@/components/listing/listing-details";
import { HOTEL_LISTINGS } from "@/mock/hotels";
import { getHotel, getSimilar } from "@/mock/listings";

interface PageProps {
  params: { id: string };
}

export function generateStaticParams() {
  return HOTEL_LISTINGS.map((listing) => ({ id: listing.id }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const listing = getHotel(params.id);
  if (!listing) return { title: "Объявление не найдено" };
  return { title: listing.title, description: listing.description.slice(0, 160) };
}

export default function HotelListingPage({ params }: PageProps) {
  const listing = getHotel(params.id);
  if (!listing) notFound();
  return <ListingDetails listing={listing} similar={getSimilar(listing)} />;
}

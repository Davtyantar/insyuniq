import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ListingDetails } from "@/components/listing/listing-details";
import { CAR_LISTINGS } from "@/mock/cars";
import { getCar, getSimilar } from "@/mock/listings";

interface PageProps {
  params: { id: string };
}

export function generateStaticParams() {
  return CAR_LISTINGS.map((listing) => ({ id: listing.id }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const listing = getCar(params.id);
  if (!listing) return { title: "Հայտարարությունը չի գտնվել" };
  return { title: listing.title, description: listing.description.slice(0, 160) };
}

export default function CarListingPage({ params }: PageProps) {
  const listing = getCar(params.id);
  if (!listing) notFound();
  return <ListingDetails listing={listing} similar={getSimilar(listing)} />;
}

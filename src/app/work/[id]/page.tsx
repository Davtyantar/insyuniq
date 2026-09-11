import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ListingDetails } from "@/components/listing/listing-details";
import { WORK_LISTINGS } from "@/mock/work";
import { getSimilar, getWork } from "@/mock/listings";

interface PageProps {
  params: { id: string };
}

export function generateStaticParams() {
  return WORK_LISTINGS.map((listing) => ({ id: listing.id }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const listing = getWork(params.id);
  if (!listing) return { title: "Հայտարարությունը չի գտնվել" };
  return { title: listing.title, description: listing.description.slice(0, 160) };
}

export default function WorkListingPage({ params }: PageProps) {
  const listing = getWork(params.id);
  if (!listing) notFound();
  return <ListingDetails listing={listing} similar={getSimilar(listing)} />;
}

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ListingDetails } from "@/components/listing/listing-details";
import { JsonLd } from "@/components/seo/json-ld";
import { CATEGORIES } from "@/lib/categories";
import { buildListingDescription } from "@/lib/seo";
import { breadcrumbJsonLd, listingJsonLd } from "@/lib/structured-data";
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
  if (!listing) return { title: "Հայտարարությունը չի գտնվել" };
  const description = buildListingDescription(listing);
  return {
    title: listing.title,
    description,
    alternates: { canonical: `/hotels/${listing.id}` },
    openGraph: { title: listing.title, description, images: listing.images.slice(0, 4) },
    twitter: { card: "summary_large_image", title: listing.title, description, images: listing.images.slice(0, 1) },
  };
}

export default function HotelListingPage({ params }: PageProps) {
  const listing = getHotel(params.id);
  if (!listing) notFound();
  const category = CATEGORIES[listing.category];
  return (
    <>
      <JsonLd
        data={[
          listingJsonLd(listing),
          breadcrumbJsonLd([
            { name: "Գլխավոր", path: "/" },
            { name: category.label, path: category.href },
            { name: listing.title, path: `/${listing.category}/${listing.id}` },
          ]),
        ]}
      />
      <ListingDetails listing={listing} similar={getSimilar(listing)} />
    </>
  );
}

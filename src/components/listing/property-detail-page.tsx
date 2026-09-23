import { cache } from "react";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ListingDetails } from "@/components/listing/listing-details";
import { JsonLd } from "@/components/seo/json-ld";
import { createApi } from "@/lib/api/client";
import { getPropertyListing, getSimilarProperty } from "@/lib/api/property";
import { propertyCard } from "@/lib/card";
import { CATEGORIES } from "@/lib/categories";
import { propertyDetail } from "@/lib/detail";
import { locationText } from "@/lib/geo";
import { formatMoney } from "@/lib/money";
import { DOOR_BY_DEAL, propertyHref, type PropertyDoor } from "@/lib/property-doors";
import { buildDescription } from "@/lib/seo";
import { breadcrumbJsonLd, propertyListingJsonLd } from "@/lib/structured-data";

/** One API call per request, shared by generateMetadata and the page. */
const loadListing = cache((id: string) => getPropertyListing(createApi(), id));

export async function propertyDetailMetadata(door: PropertyDoor, id: string): Promise<Metadata> {
  const listing = await loadListing(id);
  if (!listing) return { title: "Հայտարարությունը չի գտնվել" };
  const description = buildDescription({
    title: listing.title,
    price: formatMoney(listing.price, listing.price.currency),
    location: locationText(listing.city, listing.district),
    description: listing.description,
  });
  const canonical = propertyHref(listing);
  return {
    title: listing.title,
    description,
    alternates: { canonical },
    openGraph: { title: listing.title, description, images: listing.images.slice(0, 4) },
    twitter: { card: "summary_large_image", title: listing.title, description, images: listing.images.slice(0, 1) },
  };
}

export async function PropertyDetailPage({ door, id }: { door: PropertyDoor; id: string }) {
  const listing = await loadListing(id);
  if (!listing) notFound();
  // A listing lives on its deal's door; an old or hand-typed URL on another door moves for good.
  if (DOOR_BY_DEAL[listing.deal] !== door) permanentRedirect(propertyHref(listing));

  const similar = await getSimilarProperty(createApi(), id, 8);
  const category = CATEGORIES[door];
  return (
    <>
      <JsonLd
        data={[
          propertyListingJsonLd(listing),
          breadcrumbJsonLd([
            { name: "Գլխավոր", path: "/" },
            { name: category.label, path: category.href },
            { name: listing.title, path: propertyHref(listing) },
          ]),
        ]}
      />
      <ListingDetails detail={propertyDetail(listing)} similar={similar.map(propertyCard)} />
    </>
  );
}

import { APP_NAME } from "./constants";
import { absoluteUrl, SITE_URL, type Crumb } from "./seo";
import type { Listing } from "./types";

const SYUNIK_TOWNS = [
  "Կապան",
  "Գորիս",
  "Սիսիան",
  "Քաջարան",
  "Մեղրի",
  "Ագարակ",
  "Դաստակերտ",
  "Տաթև",
  "Խնձորեսկ",
  "Շինուհայր",
];

const ADDRESS_REGION = "Սյունիքի մարզ";
const ADDRESS_COUNTRY = "AM";

/** Sitewide Organization graph node — emitted once, in the root layout. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: APP_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/logo.png"),
    areaServed: SYUNIK_TOWNS.map((name) => ({ "@type": "City", name })),
  };
}

/** Sitewide WebSite graph node with a SearchAction — enables Google's sitelinks search box. */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: APP_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/** Lightweight ItemList for a category hub page — points crawlers at every listing without inlining full items. */
export function categoryItemListJsonLd(name: string, path: string, listings: Listing[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    url: absoluteUrl(path),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: listings.slice(0, 24).map((listing, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(`/${listing.category}/${listing.id}`),
      })),
    },
  };
}

function postalAddress(listing: Listing) {
  return {
    "@type": "PostalAddress",
    streetAddress: listing.address,
    addressLocality: listing.city,
    addressRegion: ADDRESS_REGION,
    addressCountry: ADDRESS_COUNTRY,
  };
}

function geo(listing: Listing) {
  return { "@type": "GeoCoordinates", latitude: listing.coords.lat, longitude: listing.coords.lng };
}

/** Accommodation subtype for the real-estate/rental "about" node — undefined when the listing isn't a built structure (e.g. land). */
function accommodationType(subcategory: string): string | undefined {
  if (subcategory === "apartments" || subcategory === "new-buildings") return "Apartment";
  if (subcategory === "houses") return "House";
  if (subcategory === "commercial" || subcategory === "garages") return "Place";
  return undefined;
}

function realEstateJsonLd(listing: Extract<Listing, { category: "real-estate" }>) {
  const kind = accommodationType(listing.subcategory);
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: listing.title,
    description: listing.description,
    url: absoluteUrl(`/real-estate/${listing.id}`),
    image: listing.images,
    datePosted: listing.publishedAt,
    ...(kind && {
      about: {
        "@type": kind,
        name: listing.title,
        numberOfRooms: listing.rooms || undefined,
        floorSize: { "@type": "QuantitativeValue", value: listing.area, unitCode: "MTK" },
        address: postalAddress(listing),
        geo: geo(listing),
      },
    }),
    offers: {
      "@type": "Offer",
      price: listing.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      businessFunction:
        listing.deal === "rent"
          ? "http://purl.org/goodrelations/v1#LeaseOut"
          : "http://purl.org/goodrelations/v1#Sell",
    },
  };
}

function rentalJsonLd(listing: Extract<Listing, { category: "rentals" }>) {
  const kind = accommodationType(listing.subcategory);
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: listing.title,
    description: listing.description,
    url: absoluteUrl(`/rentals/${listing.id}`),
    image: listing.images,
    datePosted: listing.publishedAt,
    ...(kind && {
      about: {
        "@type": kind,
        name: listing.title,
        numberOfRooms: listing.rooms || undefined,
        floorSize: { "@type": "QuantitativeValue", value: listing.area, unitCode: "MTK" },
        address: postalAddress(listing),
        geo: geo(listing),
      },
    }),
    offers: {
      "@type": "Offer",
      price: listing.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      businessFunction: "http://purl.org/goodrelations/v1#LeaseOut",
    },
  };
}

function hotelJsonLd(listing: Extract<Listing, { category: "hotels" }>) {
  return {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: listing.title,
    description: listing.description,
    url: absoluteUrl(`/hotels/${listing.id}`),
    image: listing.images,
    address: postalAddress(listing),
    geo: geo(listing),
    ...(listing.pool && {
      amenityFeature: [{ "@type": "LocationFeatureSpecification", name: "Pool", value: true }],
    }),
  };
}

/**
 * Google deprecated "Vehicle Listing" structured data (removed from Search
 * results, Sept 2025) — Product/Offer is the closest actively-supported type
 * that still earns price/availability rich results for a car-for-sale page.
 */
function carJsonLd(listing: Extract<Listing, { category: "cars" }>) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.description,
    url: absoluteUrl(`/cars/${listing.id}`),
    image: listing.images,
    brand: { "@type": "Brand", name: listing.brand },
    model: listing.model,
    additionalProperty: [
      { "@type": "PropertyValue", name: "Թողարկման տարի", value: String(listing.year) },
      { "@type": "PropertyValue", name: "Վազք (կմ)", value: String(listing.mileage) },
      { "@type": "PropertyValue", name: "Վառելիք", value: listing.fuel },
      { "@type": "PropertyValue", name: "Փոխանցումատուփ", value: listing.transmission },
    ],
    offers: {
      "@type": "Offer",
      price: listing.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      itemCondition:
        listing.condition === "new" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
    },
  };
}

const EMPLOYMENT_TYPE_MAP: Record<string, string> = {
  "full-time": "FULL_TIME",
  "part-time": "PART_TIME",
  internship: "INTERN",
  remote: "OTHER",
};

/**
 * TODO backend: `validThrough` is required for Google's JobPosting rich
 * result but WorkListing has no real expiry field yet — see
 * docs/SEO_BACKEND_REQUIREMENTS.md §2. Defaulting to 45 days after publish
 * keeps the markup valid without lying about a specific deadline the
 * business hasn't set; replace with a real `expiresAt` field before launch.
 */
function jobPostingJsonLd(listing: Extract<Listing, { category: "work" }>) {
  const posted = new Date(listing.publishedAt);
  const validThrough = new Date(posted.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString();
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: listing.title,
    description: listing.description,
    url: absoluteUrl(`/work/${listing.id}`),
    datePosted: listing.publishedAt,
    validThrough,
    employmentType: EMPLOYMENT_TYPE_MAP[listing.employmentType] ?? "OTHER",
    ...(listing.employmentType === "remote" && { jobLocationType: "TELECOMMUTE" }),
    hiringOrganization: { "@type": "Organization", name: listing.employer },
    jobLocation: { "@type": "Place", address: postalAddress(listing) },
    baseSalary: {
      "@type": "MonetaryAmount",
      currency: "USD",
      value: { "@type": "QuantitativeValue", value: listing.price, unitText: "MONTH" },
    },
  };
}

/** Dispatches to the correct schema.org type for the listing's category. */
export function listingJsonLd(listing: Listing) {
  if (listing.category === "real-estate") return realEstateJsonLd(listing);
  if (listing.category === "rentals") return rentalJsonLd(listing);
  if (listing.category === "hotels") return hotelJsonLd(listing);
  if (listing.category === "cars") return carJsonLd(listing);
  return jobPostingJsonLd(listing);
}

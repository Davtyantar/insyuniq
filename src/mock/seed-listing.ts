import { MOCK_NOW } from "@/lib/constants";
import type { RealEstateListing } from "@/lib/types";
import { APARTMENT_PHOTOS } from "./images";

/**
 * The one listing a freshly signed-in demo account starts with, so the profile's "my listings"
 * tab (and the editing flow) has something to show right away instead of an empty state —
 * mirrors exactly what `draftToListing` produces, so `listingToDraft` can open it back into the
 * wizard for editing like any other published listing.
 */
export const SEED_LISTING: RealEstateListing = {
  id: "my-seed-1",
  category: "real-estate",
  subcategory: "apartments",
  title: "3-սենյականոց բնակարան Կապանի կենտրոնում",
  price: 42000,
  deal: "sale",
  city: "Կապան",
  district: "Կենտրոն",
  address: "Շահումյան փող., 8",
  rooms: 3,
  area: 82,
  floor: 3,
  totalFloors: 5,
  condition: "good",
  buildingType: "secondary",
  buildYear: 1988,
  ceilingHeight: 2.8,
  bathrooms: 1,
  furniture: true,
  balcony: true,
  parking: false,
  images: [APARTMENT_PHOTOS[4], APARTMENT_PHOTOS[9], APARTMENT_PHOTOS[14]],
  description:
    "Ընտանեկան բնակարան Կապանի կենտրոնում, մոտ դպրոցին և շուկային։ Պատրաստ է բնակեցման, պահանջում է կոսմետիկ վերանորոգում։ Խնդրում ենք զանգահարել՝ ցուցադրություն համաձայնեցնելու համար։",
  publishedAt: new Date(MOCK_NOW).toISOString(),
  sellerId: "me",
  verified: false,
  urgent: false,
  negotiable: true,
  views: 18,
  status: "active",
  coords: { lat: 39.2075, lng: 46.4053 },
};

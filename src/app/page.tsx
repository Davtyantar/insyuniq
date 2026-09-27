import { BenefitsSection } from "@/components/home/benefits-section";
import { Categories } from "@/components/home/categories";
import { HitsSection } from "@/components/home/hits-section";
import { NewArrivals } from "@/components/home/new-arrivals";
import { PromoBanner } from "@/components/home/promo-banner";
import { PublishCta } from "@/components/home/publish-cta";
import { getRecentListings } from "@/lib/api/catalog";
import { createApi } from "@/lib/api/client";
import { searchProperty } from "@/lib/api/property";
import { catalogCard, isCard, legacyCard, newestCards, propertyCard } from "@/lib/card";
import { MOCK_DOORS } from "@/lib/categories";
import { RECENT_LISTINGS, TOP_CARS, TOP_SERVICES } from "@/mock/listings";

export const dynamic = "force-dynamic";

const SECTION_SIZE = 8;

export default async function HomePage() {
  const api = createApi();
  const [sale, rent, daily, dailyHouses, recent] = await Promise.all([
    searchProperty(api, { deal: "sale", pageSize: SECTION_SIZE }),
    searchProperty(api, { deal: "rent", pageSize: SECTION_SIZE }),
    searchProperty(api, { deal: "daily", pageSize: SECTION_SIZE }),
    searchProperty(api, { deal: "daily", subcategory: "houses", pageSize: SECTION_SIZE }),
    getRecentListings(api, 12),
  ]);

  const arrivals = newestCards(
    [
      recent.map(catalogCard).filter(isCard),
      RECENT_LISTINGS.filter((listing) => MOCK_DOORS.includes(listing.category)).map(legacyCard),
    ],
    12,
  );

  return (
    <>
      <PromoBanner />

      <Categories />

      <HitsSection titleKey="realEstate" href="/real-estate" cards={sale.items.map(propertyCard)} />

      <NewArrivals cards={arrivals} />

      <HitsSection titleKey="cars" href="/cars" cards={TOP_CARS.map(legacyCard)} />

      <HitsSection titleKey="rentals" href="/rentals" cards={rent.items.map(propertyCard)} />

      <HitsSection titleKey="hotels" href="/hotels" cards={daily.items.map(propertyCard)} />

      <HitsSection titleKey="dailyHouses" href="/hotels?subcategory=houses" cards={dailyHouses.items.map(propertyCard)} />

      <HitsSection titleKey="services" href="/services" cards={TOP_SERVICES.map(legacyCard)} />

      <BenefitsSection />

      <PublishCta />
    </>
  );
}

import { BenefitsSection } from "@/components/home/benefits-section";
import { Categories } from "@/components/home/categories";
import { HitsSection } from "@/components/home/hits-section";
import { NewArrivals } from "@/components/home/new-arrivals";
import { PromoBanner } from "@/components/home/promo-banner";
import { PublishCta } from "@/components/home/publish-cta";
import { legacyCard } from "@/lib/card";
import {
  RECENT_LISTINGS,
  TOP_CARS,
  TOP_DAILY_HOUSES,
  TOP_HOTELS,
  TOP_REAL_ESTATE,
  TOP_RENTALS,
  TOP_SERVICES
} from "@/mock/listings";

export default function HomePage() {
  return (
    <>
      <PromoBanner />

      <Categories />

      <HitsSection titleKey="realEstate" href='/real-estate' cards={TOP_REAL_ESTATE.map(legacyCard)} />

      <NewArrivals cards={RECENT_LISTINGS.map(legacyCard)} />

      <HitsSection titleKey="cars" href='/cars' cards={TOP_CARS.map(legacyCard)} />

      <HitsSection titleKey="rentals" href='/rentals' cards={TOP_RENTALS.map(legacyCard)} />

      <HitsSection titleKey="hotels" href='/hotels' cards={TOP_HOTELS.map(legacyCard)} />

      <HitsSection titleKey="dailyHouses" href='/hotels?subcategory=daily-houses' cards={TOP_DAILY_HOUSES.map(legacyCard)} />

      <HitsSection titleKey="services" href='/services' cards={TOP_SERVICES.map(legacyCard)} />

      <BenefitsSection />

      <PublishCta />
    </>
  );
}

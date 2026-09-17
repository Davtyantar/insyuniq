import { BenefitsSection } from "@/components/home/benefits-section";
import { Categories } from "@/components/home/categories";
import { HitsSection } from "@/components/home/hits-section";
import { NewArrivals } from "@/components/home/new-arrivals";
import { PromoBanner } from "@/components/home/promo-banner";
import { PublishCta } from "@/components/home/publish-cta";
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

      <HitsSection titleKey="realEstate" href='/real-estate' listings={TOP_REAL_ESTATE} />

      <NewArrivals listings={RECENT_LISTINGS} />

      <HitsSection titleKey="cars" href='/cars' listings={TOP_CARS} />

      <HitsSection titleKey="rentals" href='/rentals' listings={TOP_RENTALS} />

      <HitsSection titleKey="hotels" href='/hotels' listings={TOP_HOTELS} />

      <HitsSection titleKey="dailyHouses" href='/hotels?subcategory=daily-houses' listings={TOP_DAILY_HOUSES} />

      <HitsSection titleKey="services" href='/services' listings={TOP_SERVICES} />

      <BenefitsSection />

      <PublishCta />
    </>
  );
}

import { unstable_cache } from "next/cache";
import type { MetadataRoute } from "next";
import { getAllActiveCards } from "@/lib/api/catalog";
import { createApi } from "@/lib/api/client";
import { catalogCard, isCard, legacyCard } from "@/lib/card";
import { CATEGORY_LIST, MOCK_DOORS } from "@/lib/categories";
import { SITE_URL } from "@/lib/seo";
import { ALL_LISTINGS } from "@/mock/listings";

// Built per request: new and removed listings show up at once, and the build needs no API. The
// API read itself is cached for an hour (ruling R13) so the fan-out to InSyunik-Api isn't
// repeated on every sitemap request.
export const dynamic = "force-dynamic";

const activeCards = unstable_cache(() => getAllActiveCards(createApi()), ["sitemap-active-cards"], {
  revalidate: 3600,
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const home: MetadataRoute.Sitemap = [{ url: SITE_URL, changeFrequency: "daily", priority: 1 }];

  const categories: MetadataRoute.Sitemap = CATEGORY_LIST.map((category) => ({
    url: `${SITE_URL}${category.href}`,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const apiCards = (await activeCards()).map(catalogCard).filter(isCard);
  const mockCards = ALL_LISTINGS.filter(
    (listing) => listing.status === "active" && MOCK_DOORS.includes(listing.category),
  ).map(legacyCard);

  const listings: MetadataRoute.Sitemap = [...apiCards, ...mockCards].map((card) => ({
    url: `${SITE_URL}${card.href}`,
    // TODO backend: the contract has no updatedAt yet (SEO_BACKEND_REQUIREMENTS §1); publishedAt
    // is the best available lastmod until it does.
    lastModified: new Date(card.publishedAt),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...home, ...categories, ...listings];
}

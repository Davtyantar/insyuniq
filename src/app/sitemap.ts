import type { MetadataRoute } from "next";
import { CATEGORY_LIST } from "@/lib/categories";
import { SITE_URL } from "@/lib/seo";
import { ALL_LISTINGS } from "@/mock/listings";

export default function sitemap(): MetadataRoute.Sitemap {
  const home: MetadataRoute.Sitemap = [{ url: SITE_URL, changeFrequency: "daily", priority: 1 }];

  const categories: MetadataRoute.Sitemap = CATEGORY_LIST.map((category) => ({
    url: `${SITE_URL}${category.href}`,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const listings: MetadataRoute.Sitemap = ALL_LISTINGS.filter((listing) => listing.status === "active").map(
    (listing) => ({
      url: `${SITE_URL}/${listing.category}/${listing.id}`,
      // TODO backend: falls back to publishedAt because Listing has no
      // updatedAt field — see docs/SEO_BACKEND_REQUIREMENTS.md §1. Once one
      // exists, use it here so an edited listing's lastmod is accurate.
      lastModified: new Date(listing.publishedAt),
      changeFrequency: "weekly",
      priority: 0.6,
    }),
  );

  return [...home, ...categories, ...listings];
}

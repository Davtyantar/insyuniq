import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * Account/utility pages are intentionally NOT disallowed here — they're kept
 * crawlable and excluded via a per-page `robots: { index: false }` instead
 * (see favorites/profile/sign-in/sign-up/search). Disallowing them here would
 * stop Googlebot from ever seeing that noindex tag and can produce an
 * "Indexed, though blocked by robots.txt" warning if anything links to them.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

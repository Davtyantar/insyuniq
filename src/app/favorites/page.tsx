import type { Metadata } from "next";
import { FavoritesView } from "@/components/account/favorites-view";

export const metadata: Metadata = {
  title: "Հավանածներ",
  // Per-browser saved state — no unique public content per URL.
  robots: { index: false, follow: true },
  // Self-referencing so this doesn't silently inherit the root layout's "/"
  // canonical, which would wrongly claim the homepage as this page's canonical.
  alternates: { canonical: "/favorites" },
};

export default function FavoritesPage() {
  return <FavoritesView />;
}

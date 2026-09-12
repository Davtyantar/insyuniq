import type { Metadata } from "next";
import { ProfileView } from "@/components/account/profile-view";

export const metadata: Metadata = {
  title: "Պրոֆիլ",
  // Per-account content — no unique public content per URL.
  robots: { index: false, follow: true },
  // Self-referencing so this doesn't silently inherit the root layout's "/"
  // canonical, which would wrongly claim the homepage as this page's canonical.
  alternates: { canonical: "/profile" },
};

export default function ProfilePage() {
  return <ProfileView />;
}

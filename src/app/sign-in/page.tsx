import type { Metadata } from "next";
import { SignInView } from "@/components/account/sign-in-view";

export const metadata: Metadata = {
  title: "Մուտք գործել",
  robots: { index: false, follow: true },
  alternates: { canonical: "/sign-in" },
};

export default function SignInPage() {
  return <SignInView />;
}

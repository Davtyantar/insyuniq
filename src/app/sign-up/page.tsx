import type { Metadata } from "next";
import { SignUpView } from "@/components/account/sign-up-view";

export const metadata: Metadata = {
  title: "Գրանցում",
  robots: { index: false, follow: true },
  alternates: { canonical: "/sign-up" },
};

export default function SignUpPage() {
  return <SignUpView />;
}

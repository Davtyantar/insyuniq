import type { Metadata } from "next";
import { ForgotPasswordView } from "@/components/account/forgot-password-view";

export const metadata: Metadata = {
  title: "Վերականգնել գաղտնաբառը",
  robots: { index: false, follow: true },
  alternates: { canonical: "/forgot-password" },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordView />;
}

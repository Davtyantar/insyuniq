import type { Metadata } from "next";
import { ResetPasswordView } from "@/components/account/reset-password-view";

export const metadata: Metadata = {
  title: "Նոր գաղտնաբառ",
  robots: { index: false, follow: false },
  alternates: { canonical: "/reset-password" },
};

export default function ResetPasswordPage() {
  return <ResetPasswordView />;
}

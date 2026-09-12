import type { Metadata } from "next";
import { PublishWizard } from "@/components/create/publish-wizard";

export const metadata: Metadata = {
  title: "Հրապարակել հայտարարություն",
  description: "Տեղադրեք հայտարարություն անշարժ գույքի կամ ավտոմեքենայի մասին մի քանի քայլով։",
  alternates: { canonical: "/create" },
};

export default function CreatePage() {
  return <PublishWizard />;
}

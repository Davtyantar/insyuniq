import { Suspense } from "react";
import type { Metadata } from "next";
import { PublishWizard } from "@/components/create/publish-wizard";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Հրապարակել հայտարարություն",
  description: "Տեղադրեք հայտարարություն անշարժ գույքի կամ ավտոմեքենայի մասին մի քանի քայլով։",
  alternates: { canonical: "/create" },
};

function WizardSkeleton() {
  return (
    <div className="container py-6 lg:py-8">
      <Skeleton className="h-7 w-64" />
      <Skeleton className="mt-3 h-4 w-40" />
      <Skeleton className="mt-6 h-80 w-full rounded-lg" />
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<WizardSkeleton />}>
      <PublishWizard />
    </Suspense>
  );
}

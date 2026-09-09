"use client";

import { MapPin } from "lucide-react";
import { StepHeader } from "@/components/create/field";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { cardSpecs, detailSpecs, isDaily, isMonthly, listingSummary, locationLine } from "@/lib/specs";
import type { Listing } from "@/lib/types";

export function StepPreview({ listing }: { listing: Listing }) {
  const specs = detailSpecs(listing);

  return (
    <div>
      <StepHeader
        title="Ստուգեք հայտարարությունը"
        description="Հենց այսպես կտեսնեն այն գնորդները։ Վերադարձեք ցանկացած քայլի, եթե ինչ-որ բան պետք է ուղղել։"
      />

      <article className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="relative aspect-[16/9] bg-secondary">
          {/* Draft photos are object URLs, so a plain img is the right element here. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={listing.images[0]}
            alt={listing.title || "Հայտարարության լուսանկար"}
            className="h-full w-full object-cover"
          />
          <div className="absolute left-3 top-3 flex gap-1.5">
            <Badge variant="outline">Սևագիր</Badge>
            {listing.images.length > 1 && (
              <Badge variant="outline">{listing.images.length} լուսանկար</Badge>
            )}
          </div>
        </div>

        <div className="p-5">
          <p className="text-[28px] font-semibold leading-none tracking-tight">
            {formatPrice(listing.price, { perMonth: isMonthly(listing), perDay: isDaily(listing) })}
          </p>
          <h3 className="mt-2.5 text-[18px] font-medium leading-snug">{listing.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{listingSummary(listing)}</p>

          <ul className="mt-3 flex flex-wrap gap-1.5">
            {cardSpecs(listing).map((spec) => (
              <li
                key={spec}
                className="rounded-md border border-border bg-background px-2.5 py-1 text-[13px]"
              >
                {spec}
              </li>
            ))}
          </ul>

          <p className="mt-3 flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {locationLine(listing)}
            {listing.address && `, ${listing.address}`}
          </p>

          <div className="mt-5 border-t border-border pt-4">
            <h4 className="text-sm font-semibold">Նկարագրություն</h4>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
              {listing.description}
            </p>
          </div>

          <div className="mt-5 border-t border-border pt-4">
            <h4 className="text-sm font-semibold">Բնութագրեր</h4>
            <dl className="mt-2 grid gap-x-8 sm:grid-cols-2">
              {specs.map((spec) => (
                <div
                  key={spec.label}
                  className="flex items-baseline justify-between gap-4 border-b border-border py-2 text-[13px]"
                >
                  <dt className="text-muted-foreground">{spec.label}</dt>
                  <dd className="text-right font-medium">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </article>
    </div>
  );
}

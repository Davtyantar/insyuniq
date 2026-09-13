"use client";

import { MapPin } from "lucide-react";
import { StepHeader } from "@/components/create/field";
import { useApp } from "@/components/providers/app-provider";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { cardSpecs, detailSpecs, isDaily, isMonthly, listingSummary, locationLine } from "@/lib/specs";
import type { Listing } from "@/lib/types";

export function StepPreview({ listing }: { listing: Listing }) {
  const { currency } = useApp();
  const specs = detailSpecs(listing);

  return (
    <div>
      <StepHeader
        title="Ստուգեք հայտարարությունը"
        description="Հենց այսպես կտեսնեն այն գնորդները։ Վերադարձեք ցանկացած քայլի, եթե ինչ-որ բան պետք է ուղղել։"
      />

      <article className="overflow-hidden rounded-lg border border-border bg-card">
        {/* Phone: compact row — info first, small thumbnail beside it. A full-bleed 16:9 photo
            above everything else (the sm+ layout) reads as too heavy on a narrow screen. */}
        <div className="flex gap-4 p-3 sm:hidden">
          <div className="min-w-0 flex-1">
            <Badge variant="outline" className="mb-1.5">
              Սևագիր
            </Badge>
            <p className="text-[20px] font-semibold leading-none tracking-tight">
              {formatPrice(listing.price, { currency, prices: listing.prices })}
              {isDaily(listing) && <span className="ml-1 text-[12px] font-normal text-accent">օր</span>}
              {isMonthly(listing) && <span className="ml-1 text-[12px] font-normal text-accent">ամիս</span>}
            </p>
            <h3 className="mt-1.5 line-clamp-2 text-[14px] font-medium leading-snug">{listing.title}</h3>
            <p className="mt-1 text-[12px] text-muted-foreground">{listingSummary(listing)}</p>
          </div>
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-secondary">
            {/* Draft photos are object URLs, so a plain img is the right element here. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={listing.images[0]}
              alt={listing.title || "Հայտարարության լուսանկար"}
              className="h-full w-full object-cover"
            />
            {listing.images.length > 1 && (
              <span className="absolute bottom-1 right-1 rounded bg-slate-950/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                {listing.images.length}
              </span>
            )}
          </div>
        </div>

        {/* sm+: full-width photo with price/title below it, as before. */}
        <div className="relative hidden aspect-[16/9] bg-secondary sm:block">
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

        <div className="p-4 sm:p-5">
          <div className="hidden sm:block">
            <p className="text-[28px] font-semibold leading-none tracking-tight">
              {formatPrice(listing.price, { currency, prices: listing.prices })}
              {isDaily(listing) && <span className="ml-1 text-sm font-normal text-accent">օր</span>}
              {isMonthly(listing) && <span className="ml-1 text-sm font-normal text-accent">ամիս</span>}
            </p>
            <h3 className="mt-2.5 text-[18px] font-medium leading-snug">{listing.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{listingSummary(listing)}</p>
          </div>

          <ul className="mt-3 flex flex-wrap gap-1.5">
            {cardSpecs(listing).map((spec) => (
              <li
                key={spec}
                className="rounded-md border border-border bg-background px-2.5 py-1 text-[12px] sm:text-[13px]"
              >
                {spec}
              </li>
            ))}
          </ul>

          <p className="mt-3 flex items-center gap-1.5 text-[12px] text-muted-foreground sm:text-[13px]">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {locationLine(listing)}
            {listing.address && `, ${listing.address}`}
          </p>

          <div className="mt-5 border-t border-border pt-4">
            <h4 className="text-[13px] font-semibold sm:text-sm">Նկարագրություն</h4>
            <p className="mt-2 whitespace-pre-line break-words text-[12px] leading-relaxed text-foreground/90 sm:text-sm">
              {listing.description}
            </p>
          </div>

          <div className="mt-5 border-t border-border pt-4">
            <h4 className="text-[13px] font-semibold sm:text-sm">Բնութագրեր</h4>
            <dl className="mt-2 grid gap-x-8 sm:grid-cols-2">
              {specs.map((spec) => (
                <div
                  key={spec.label}
                  className="flex items-baseline justify-between gap-4 border-b border-border py-2 text-[12px] sm:text-[13px]"
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

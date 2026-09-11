"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Clock, ImageIcon, MapPin } from "lucide-react";
import { FavoriteButton } from "@/components/listings/favorite-button";
import { useApp } from "@/components/providers/app-provider";
import { Badge } from "@/components/ui/badge";
import { listingHref } from "@/lib/categories";
import { formatPrice, formatRelativeDate } from "@/lib/format";
import { label } from "@/lib/labels";
import { isDaily, isMonthly, listingSummary, locationLine } from "@/lib/specs";
import type { Listing, ViewMode } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ListingCardProps {
  listing: Listing;
  view?: ViewMode;
  priority?: boolean;
  className?: string;
}

/** Highlight badges that sit on the photo. */
function accentBadges(listing: Listing): string[] {
  const badges: string[] = [];
  if (listing.category === "real-estate") {
    if (listing.buildingType === "new") badges.push("Նորակառույց");
    if (listing.deal === "rent") badges.push("Վարձակալություն");
  } else if (listing.category === "rentals" || listing.category === "hotels") {
    badges.push(listing.term === "daily" ? "Օրավարձով" : "Երկարաժամկետ");
  } else if (listing.category === "work") {
    badges.push(label("employmentType", listing.employmentType));
  } else {
    if (listing.fuel === "electric") badges.push("Էլեկտրական");
    if (listing.condition === "new") badges.push("Նոր");
    else if (listing.accidentFree) badges.push("Առանց ավարիայի");
  }
  return badges;
}

const MAX_PREVIEW_DOTS = 6;

export function ListingCard({ listing, view = "grid", priority, className }: ListingCardProps) {
  const { currency } = useApp();
  const badges = accentBadges(listing);
  const isList = view === "list";

  const imageRef = React.useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const zoneCount = Math.min(listing.images.length, MAX_PREVIEW_DOTS);

  const scrub = React.useCallback(
    (event: React.MouseEvent) => {
      const rect = imageRef.current?.getBoundingClientRect();
      if (!rect || zoneCount < 2) return;
      if (event.clientY < rect.top || event.clientY > rect.bottom) return;
      const fraction = (event.clientX - rect.left) / rect.width;
      const next = Math.min(zoneCount - 1, Math.max(0, Math.floor(fraction * zoneCount)));
      setActiveIndex((prev) => (prev === next ? prev : next));
    },
    [zoneCount],
  );

  const reset = React.useCallback(() => setActiveIndex(0), []);

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm transition-shadow hover:shadow-lift",
        isList && "sm:flex-row",
        className,
      )}
    >
      <Link
        href={listingHref(listing)}
        className="absolute inset-0 z-10"
        aria-label={listing.title}
        onMouseMove={scrub}
        onMouseLeave={reset}
      >
        <span className="sr-only">{listing.title}</span>
      </Link>

      <div
        ref={imageRef}
        className={cn(
          "relative shrink-0 overflow-hidden bg-secondary",
          isList ? "aspect-[4/3] sm:aspect-auto sm:h-[212px] sm:w-[300px]" : "aspect-[4/3]",
        )}
      >
        <Image
          src={listing.images[activeIndex]}
          alt={listing.title}
          fill
          sizes={isList ? "(max-width: 640px) 100vw, 300px" : "(max-width: 768px) 100vw, 33vw"}
          priority={priority}
          // Photos added through the publish wizard are object URLs the optimiser cannot fetch.
          unoptimized={listing.images[activeIndex].startsWith("blob:")}
          className="object-cover"
        />

        <div className="absolute left-3 top-3 z-20 flex flex-wrap gap-1.5">
          {listing.urgent && <Badge variant="destructive">Հրատապ</Badge>}
          {badges.map((badge) => (
            <Badge key={badge} variant="outline">
              {badge}
            </Badge>
          ))}
        </div>

        <FavoriteButton listingId={listing.id} className="absolute right-3 top-3 z-20" />

        {zoneCount > 1 ? (
          <>
            {/* Hover-scrub dots only make sense with a mouse; phones just get the count badge below. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden h-14 bg-gradient-to-t from-black/35 to-transparent sm:block" />
            <div className="absolute inset-x-3 bottom-3 z-20 hidden gap-1.5 sm:flex">
              {Array.from({ length: zoneCount }, (_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-[3px] flex-1 rounded-full bg-white/40 shadow-[0_0_0_1px_rgba(0,0,0,0.15)] transition-all duration-200",
                    i === activeIndex && "h-[4px] bg-white shadow-[0_0_4px_rgba(0,0,0,0.35)]",
                  )}
                />
              ))}
            </div>
            <span className="absolute bottom-3 right-3 z-20 inline-flex items-center gap-1 rounded-md bg-slate-950/65 px-1.5 py-0.5 text-[11px] font-medium text-white backdrop-blur sm:hidden">
              <ImageIcon className="h-3 w-3" />
              {listing.images.length}
            </span>
          </>
        ) : (
          <span className="absolute bottom-3 right-3 z-20 inline-flex items-center gap-1 rounded-md bg-slate-950/65 px-1.5 py-0.5 text-[11px] font-medium text-white backdrop-blur">
            <ImageIcon className="h-3 w-3" />
            {listing.images.length}
          </span>
        )}
      </div>

      <div className={cn("flex flex-1 flex-col gap-2 p-4", isList && "sm:p-5")}>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[22px] font-semibold tracking-tight text-foreground">
            {formatPrice(listing.price, { currency })}
            {isDaily(listing) && (
              <span className="ml-1 text-[13px] font-normal text-accent">օր</span>
            )}
            {isMonthly(listing) && (
              <span className="ml-1 text-[13px] font-normal text-accent">ամիս</span>
            )}
          </span>
          {listing.verified && (
            <BadgeCheck
              className="h-5 w-5 shrink-0 text-accent"
              aria-label="Ստուգված հայտարարություն"
            >
              <title>Ստուգված հայտարարություն</title>
            </BadgeCheck>
          )}
        </div>

        <h3
          className={cn(
            "font-medium leading-snug text-foreground",
            isList ? "text-[17px]" : "text-[15px] line-clamp-2",
          )}
        >
          {listing.category === "work" ? listing.title : listingSummary(listing)}
        </h3>

        <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{locationLine(listing)}</span>
        </div>

        <p className="line-clamp-3 text-[13px] leading-relaxed text-muted-foreground">
          {listing.description}
        </p>

        <div className="mt-auto flex items-center gap-1.5 pt-2 text-[12px] font-medium text-accent">
          <Clock className="h-3.5 w-3.5" />
          {formatRelativeDate(listing.publishedAt)}
        </div>
      </div>
    </article>
  );
}

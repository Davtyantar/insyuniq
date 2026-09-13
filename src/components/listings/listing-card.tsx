"use client";

import * as React from "react";
import Image from "next/image";
import { Link } from "@/components/i18n/locale-link";
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
  /** Compact list row on phones (small thumbnail, tight type) instead of a full-width vertical
   * card — for browse/results screens (category pages) where people are scanning many listings.
   * Editorial spots (home page highlights, favorites, profile, "similar listings") keep the
   * bigger photo-first card at every width, since they show only a handful of listings. */
  dense?: boolean;
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

export function ListingCard({ listing, view = "grid", priority, className, dense = false }: ListingCardProps) {
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
        "group relative flex h-full overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm transition-shadow hover:shadow-lift",
        dense ? "flex-row" : "flex-col",
        isList ? "sm:flex-row" : "sm:flex-col",
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
          dense ? "aspect-square w-28" : "aspect-[4/3]",
          isList ? "sm:aspect-auto sm:h-[212px] sm:w-[300px]" : "sm:aspect-[4/3] sm:w-full",
        )}
      >
        <Image
          src={listing.images[activeIndex]}
          alt={listing.title}
          fill
          sizes={
            dense
              ? isList
                ? "(max-width: 640px) 112px, 300px"
                : "(max-width: 640px) 112px, 33vw"
              : isList
                ? "(max-width: 640px) 100vw, 300px"
                : "(max-width: 768px) 100vw, 33vw"
          }
          priority={priority}
          // Photos added through the publish wizard are object URLs the optimiser cannot fetch.
          unoptimized={listing.images[activeIndex].startsWith("blob:")}
          className="object-cover"
        />

        <div
          className={cn(
            "absolute z-20 flex-wrap gap-1.5",
            dense ? "hidden left-1.5 top-1.5 sm:left-3 sm:top-3 sm:flex" : "flex left-3 top-3",
          )}
        >
          {listing.urgent && <Badge variant="destructive">Հրատապ</Badge>}
          {badges.map((badge) => (
            <Badge key={badge} variant="outline">
              {badge}
            </Badge>
          ))}
        </div>

        <FavoriteButton
          listingId={listing.id}
          className={cn(
            "absolute z-20",
            dense ? "right-1 top-1 h-6 w-6 sm:right-3 sm:top-3 sm:h-9 sm:w-9" : "right-3 top-3",
          )}
        />

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
            <span
              className={cn(
                "absolute z-20 inline-flex items-center bg-slate-950/65 font-medium text-white backdrop-blur sm:hidden",
                dense
                  ? "bottom-1 right-1 gap-0.5 rounded px-1 py-0.5 text-[9px]"
                  : "bottom-3 right-3 gap-1 rounded-md px-1.5 py-0.5 text-[11px]",
              )}
            >
              <ImageIcon className={dense ? "h-2.5 w-2.5" : "h-3 w-3"} />
              {listing.images.length}
            </span>
          </>
        ) : (
          <span
            className={cn(
              "absolute z-20 inline-flex items-center bg-slate-950/65 font-medium text-white backdrop-blur",
              dense
                ? "bottom-1 right-1 gap-0.5 rounded px-1 py-0.5 text-[9px] sm:bottom-3 sm:right-3 sm:gap-1 sm:rounded-md sm:px-1.5 sm:text-[11px]"
                : "bottom-3 right-3 gap-1 rounded-md px-1.5 py-0.5 text-[11px]",
            )}
          >
            <ImageIcon className={cn("shrink-0", dense ? "h-2.5 w-2.5 sm:h-3 sm:w-3" : "h-3 w-3")} />
            {listing.images.length}
          </span>
        )}
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col gap-1.5 p-3 sm:gap-2 sm:p-4",
          isList && "sm:p-5",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-[15px] font-semibold tracking-tight text-foreground sm:text-[22px]">
            {formatPrice(listing.price, { currency, prices: listing.prices })}
            {isDaily(listing) && <span className="ml-1 text-[11px] font-normal text-accent sm:text-[13px]">օր</span>}
            {isMonthly(listing) && (
              <span className="ml-1 text-[11px] font-normal text-accent sm:text-[13px]">ամիս</span>
            )}
          </span>
          {listing.verified && (
            <BadgeCheck
              className="h-4 w-4 shrink-0 text-accent sm:h-5 sm:w-5"
              aria-label="Ստուգված հայտարարություն"
            >
              <title>Ստուգված հայտարարություն</title>
            </BadgeCheck>
          )}
        </div>

        <h3
          className={cn(
            "line-clamp-2 text-[12.5px] font-medium leading-snug text-foreground",
            isList ? "sm:line-clamp-none sm:text-[17px]" : "sm:text-[15px]",
          )}
        >
          {listing.category === "work" ? listing.title : listingSummary(listing)}
        </h3>

        <div className="flex items-center gap-1 text-[11px] text-muted-foreground sm:gap-1.5 sm:text-[13px]">
          <MapPin className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
          <span className="min-w-0 flex-1 truncate">{locationLine(listing)}</span>
          {/* List view pairs the date with location instead of pinning it to the card's bottom:
              with a fixed-height photo next to a variable amount of text, "bottom of the card"
              and "bottom of the photo" don't line up, leaving an odd empty gap under a shorter
              photo. Grid cards don't have that mismatch, so they keep the bottom-pinned line. */}
          {isList && (
            <span className="inline-flex shrink-0 items-center gap-1 font-medium text-accent">
              <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              {formatRelativeDate(listing.publishedAt)}
            </span>
          )}
        </div>

        <p className="line-clamp-3 text-[11px] leading-relaxed text-muted-foreground sm:text-[13px]">
          {listing.description}
        </p>

        {!isList && (
          <div className="mt-auto flex items-center gap-1 pt-0.5 text-[10px] font-medium text-accent sm:gap-1.5 sm:pt-2 sm:text-[12px]">
            <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            {formatRelativeDate(listing.publishedAt)}
          </div>
        )}
      </div>
    </article>
  );
}

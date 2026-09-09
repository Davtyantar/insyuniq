"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, ImageIcon, MapPin } from "lucide-react";
import { FavoriteButton } from "@/components/listings/favorite-button";
import { Badge } from "@/components/ui/badge";
import { listingHref } from "@/lib/categories";
import { formatPrice, formatRelativeDate } from "@/lib/format";
import { cardSpecs, isDaily, isMonthly, listingSummary, locationLine } from "@/lib/specs";
import type { Listing, ViewMode } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getSeller } from "@/mock/sellers";

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
    if (listing.buildingType === "new") badges.push("Новостройка");
    if (listing.deal === "rent") badges.push("Аренда");
  } else if (listing.category === "rentals" || listing.category === "hotels") {
    badges.push(listing.term === "daily" ? "Посуточно" : "Длительный срок");
  } else {
    if (listing.fuel === "electric") badges.push("Электро");
    if (listing.condition === "new") badges.push("Новый");
    else if (listing.accidentFree) badges.push("Без ДТП");
  }
  return badges;
}

const MAX_PREVIEW_DOTS = 6;

export function ListingCard({ listing, view = "grid", priority, className }: ListingCardProps) {
  const seller = getSeller(listing.sellerId);
  const specs = cardSpecs(listing);
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
        "group relative overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-slate-300 hover:shadow-lift",
        isList && "sm:flex",
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
          {listing.verified && (
            <Badge variant="outline" className="gap-1 text-brand-700">
              <BadgeCheck className="h-3.5 w-3.5" />
              Проверено
            </Badge>
          )}
          {badges.map((badge) => (
            <Badge key={badge} variant="outline">
              {badge}
            </Badge>
          ))}
        </div>

        <FavoriteButton listingId={listing.id} className="absolute right-3 top-3 z-20" />

        {zoneCount > 1 ? (
          <div className="absolute inset-x-3 bottom-3 z-20 flex gap-1">
            {Array.from({ length: zoneCount }, (_, i) => (
              <span
                key={i}
                className={cn(
                  "h-[3px] flex-1 rounded-full bg-white/40 transition-colors",
                  i === activeIndex && "bg-white",
                )}
              />
            ))}
          </div>
        ) : (
          <span className="absolute bottom-3 right-3 z-20 inline-flex items-center gap-1 rounded-md bg-slate-950/65 px-1.5 py-0.5 text-[11px] font-medium text-white backdrop-blur">
            <ImageIcon className="h-3 w-3" />
            {listing.images.length}
          </span>
        )}
      </div>

      <div className={cn("flex flex-1 flex-col p-4", isList && "sm:p-5")}>
        <div className="flex items-baseline gap-2">
          <span className="text-[22px] font-semibold tracking-tight">
            {formatPrice(listing.price, { perMonth: isMonthly(listing), perDay: isDaily(listing) })}
          </span>
        </div>

        <h3
          className={cn(
            "mt-1 font-medium leading-snug text-foreground",
            isList ? "text-[17px]" : "text-[15px] line-clamp-2",
          )}
        >
          {listingSummary(listing)}
        </h3>

        <ul className="mt-2.5 flex flex-wrap gap-x-2 gap-y-1 text-[13px] text-muted-foreground">
          {specs.slice(0, isList ? 6 : 4).map((spec, index) => (
            <li key={spec} className="flex items-center gap-2">
              {index > 0 && <span className="text-border">·</span>}
              {spec}
            </li>
          ))}
        </ul>

        {isList && (
          <p className="mt-3 hidden text-sm leading-relaxed text-muted-foreground sm:line-clamp-2">
            {listing.description}
          </p>
        )}

        <div className="mt-3 flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{locationLine(listing)}</span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-3 text-[12px] text-muted-foreground">
          <span className="truncate">{seller.name}</span>
          <span className="shrink-0">{formatRelativeDate(listing.publishedAt)}</span>
        </div>
      </div>
    </article>
  );
}

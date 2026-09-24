"use client";

import * as React from "react";
import Image from "next/image";
import { Link } from "@/components/i18n/locale-link";
import { BadgeCheck, Clock, ImageIcon, MapPin } from "lucide-react";
import { FavoriteButton } from "@/components/listings/favorite-button";
import { useApp } from "@/components/providers/app-provider";
import { Badge } from "@/components/ui/badge";
import type { CardModel } from "@/lib/card";
import { formatRelativeDate } from "@/lib/format";
import { formatAmount, periodLabel, toDisplayCurrency } from "@/lib/money";
import type { ViewMode } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ListingCardProps {
  card: CardModel;
  view?: ViewMode;
  priority?: boolean;
  className?: string;
  /** Compact list row on phones (small thumbnail, tight type) instead of a full-width vertical
   * card — for browse/results screens (category pages) where people are scanning many listings.
   * Editorial spots (home page highlights, favorites, profile, "similar listings") keep the
   * bigger photo-first card at every width, since they show only a handful of listings. */
  dense?: boolean;
  /** Profile's "favorites" tab only — that context is quick management, not browsing, so it
   * doesn't need the description preview the same card shows everywhere else. */
  hideDescription?: boolean;
}

const MAX_PREVIEW_DOTS = 6;

export function ListingCard({
  card,
  view = "grid",
  priority,
  className,
  dense = false,
  hideDescription = false,
}: ListingCardProps) {
  const { currency } = useApp();
  const isList = view === "list";
  const price = card.price;
  const display = toDisplayCurrency(currency);
  const verifiedBadge = card.verified && (
    <BadgeCheck className="h-4 w-4 shrink-0 text-accent sm:h-5 sm:w-5" aria-label="Ստուգված հայտարարություն">
      <title>Ստուգված հայտարարություն</title>
    </BadgeCheck>
  );

  const imageRef = React.useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const zoneCount = Math.min(card.images.length, MAX_PREVIEW_DOTS);

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
        "group relative flex h-full overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm",
        dense ? "flex-row" : "flex-col",
        isList ? "sm:flex-row" : "sm:flex-col",
        className,
      )}
    >
      <Link
        href={card.href}
        className="absolute inset-0 z-10"
        aria-label={card.title}
        onMouseMove={scrub}
        onMouseLeave={reset}
      >
        <span className="sr-only">{card.title}</span>
      </Link>

      <div
        ref={imageRef}
        className={cn(
          "relative shrink-0 overflow-hidden bg-secondary",
          dense ? "aspect-square w-28" : "aspect-[4/3]",
          // List view: no fixed height — the flex row's default stretch makes the photo match
          // whatever height the text column ends up needing, so a longer description (or the
          // date row) never leaves a gap of card background showing below a shorter photo.
          isList ? "sm:aspect-auto sm:min-h-[212px] sm:w-[300px]" : "sm:aspect-[4/3] sm:w-full",
        )}
      >
        {card.images.length > 0 && (
          <Image
            src={card.images[activeIndex]}
            alt={card.title}
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
            unoptimized={card.images[activeIndex]?.startsWith("blob:")}
            className="object-cover"
          />
        )}

        {/* Phones: bottom-left, out of the way of the favorite button and title above it.
            sm+: back to the classic top-left placement, for both card sizes. */}
        <div className="absolute bottom-1.5 left-1.5 z-20 flex max-w-[75%] flex-wrap gap-1.5 sm:bottom-auto sm:left-3 sm:top-3 sm:max-w-[calc(100%-1.5rem)]">
          {card.featured && <Badge variant="destructive">Առանձնացված</Badge>}
          {card.badges.map((badge) => (
            <Badge key={badge} variant="outline">
              {badge}
            </Badge>
          ))}
        </div>

        <FavoriteButton
          listingId={card.id}
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
                    // A light-colored photo (e.g. a silver car on grey pavement) leaves the
                    // faint inactive segments nearly invisible against it while the active one
                    // stays opaque — reading as "one wide bar" instead of N equal dots. A solid
                    // dark track behind every segment keeps them all equally visible regardless
                    // of what's under them.
                    "h-[3px] min-w-0 flex-1 rounded-full bg-black/25 shadow-[0_0_0_1px_rgba(0,0,0,0.25)] ring-1 ring-inset ring-white/25 transition-all duration-200",
                    i === activeIndex && "h-[4px] bg-white shadow-[0_0_4px_rgba(0,0,0,0.35)] ring-0",
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
              {card.imageCount}
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
            {card.imageCount}
          </span>
        )}
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col gap-1.5 p-3 sm:gap-2 sm:p-4",
          isList && "sm:p-5",
        )}
      >
        {price ? (
          <div className="flex items-center justify-between gap-2">
            <span className="text-[15px] font-semibold tracking-tight text-foreground sm:text-[22px]">
              {formatAmount(price, display)}
              {price.amount !== null && periodLabel(price.period) && (
                <span className="ml-1 text-[11px] font-normal text-accent sm:text-[13px]">{periodLabel(price.period)}</span>
              )}
            </span>
            {verifiedBadge}
          </div>
        ) : null}

        {/* No price row (services): the verified badge moves up beside the title instead of
            leaving an empty row above it. */}
        <div className="flex items-start justify-between gap-2">
          <h3
            className={cn(
              "line-clamp-2 min-w-0 text-[12.5px] font-medium leading-snug text-foreground transition-colors group-hover:text-accent",
              isList ? "sm:line-clamp-none sm:text-[17px]" : "sm:text-[15px]",
            )}
          >
            {card.headline}
          </h3>
          {!price && verifiedBadge}
        </div>

        <div className="flex items-center gap-1 text-[11px] text-muted-foreground sm:gap-1.5 sm:text-[13px]">
          <MapPin className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
          <span className="min-w-0 flex-1 truncate">{card.location}</span>
        </div>

        {!hideDescription && card.description && (
          <p className="line-clamp-3 text-[11px] leading-relaxed text-muted-foreground sm:text-[13px]">
            {card.description}
          </p>
        )}

        <div
          className="mt-auto flex items-center gap-1 pt-0.5 text-[10px] font-medium text-accent sm:gap-1.5 sm:pt-2 sm:text-[12px]"
          suppressHydrationWarning
        >
          <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          {formatRelativeDate(card.publishedAt)}
        </div>
      </div>
    </article>
  );
}

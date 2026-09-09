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

export function ListingCard({ listing, view = "grid", priority, className }: ListingCardProps) {
  const seller = getSeller(listing.sellerId);
  const specs = cardSpecs(listing);
  const badges = accentBadges(listing);
  const isList = view === "list";

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-slate-300 hover:shadow-lift",
        isList && "sm:flex",
        className,
      )}
    >
      <Link href={listingHref(listing)} className="absolute inset-0 z-10" aria-label={listing.title}>
        <span className="sr-only">{listing.title}</span>
      </Link>

      <div
        className={cn(
          "relative shrink-0 overflow-hidden bg-secondary",
          isList ? "aspect-[4/3] sm:aspect-auto sm:h-[212px] sm:w-[300px]" : "aspect-[4/3]",
        )}
      >
        <Image
          src={listing.images[0]}
          alt={listing.title}
          fill
          sizes={isList ? "(max-width: 640px) 100vw, 300px" : "(max-width: 768px) 100vw, 33vw"}
          priority={priority}
          // Photos added through the publish wizard are object URLs the optimiser cannot fetch.
          unoptimized={listing.images[0].startsWith("blob:")}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
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

        <span className="absolute bottom-3 right-3 z-20 inline-flex items-center gap-1 rounded-md bg-slate-950/65 px-1.5 py-0.5 text-[11px] font-medium text-white backdrop-blur">
          <ImageIcon className="h-3 w-3" />
          {listing.images.length}
        </span>
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

"use client";

import * as React from "react";
import Image from "next/image";
import { Link } from "@/components/i18n/locale-link";
import { MapPin, Pencil, Trash2 } from "lucide-react";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatPrice, formatRelativeDate } from "@/lib/format";
import { isDaily, isMonthly, listingSummary, locationLine } from "@/lib/specs";
import type { Listing } from "@/lib/types";

interface MyListingCardProps {
  listing: Listing;
  priority?: boolean;
}

/**
 * Compact "owner" card for the profile's "my listings" tab — smaller than the public browsing
 * card, no description, and (unlike that card) not one big link over the whole thing: only the
 * Edit button is clickable, front and center at the top instead of buried at the bottom, since
 * managing the listing is the only thing this tab is for.
 */
export function MyListingCard({ listing, priority }: MyListingCardProps) {
  const { currency, deleteListing } = useApp();
  const showPrice = listing.category !== "services";
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
      <div className="relative aspect-[16/10] shrink-0 overflow-hidden bg-secondary">
        <Image
          src={listing.images[0]}
          alt=""
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={priority}
          unoptimized={listing.images[0]?.startsWith("blob:")}
          className="object-cover"
        />
        <Link
          href={`/create?edit=${listing.id}`}
          className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-full bg-accent px-2.5 py-1.5 text-[11px] font-semibold text-accent-foreground shadow-md transition-colors hover:bg-brand-700 sm:text-[12px]"
        >
          <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          Խմբագրել
        </Link>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          aria-label="Ջնջել հայտարարությունը"
          title="Ջնջել հայտարարությունը"
          className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-slate-950/70 text-white shadow-md backdrop-blur transition-colors hover:bg-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>

        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ջնջե՞լ հայտարարությունը</DialogTitle>
              <DialogDescription>
                «{listing.title}»-ը կհեռացվի ձեր հայտարարություններից։ Այս գործողությունը հնարավոր չէ հետարկել։
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Չեղարկել</Button>
              </DialogClose>
              <Button
                variant="destructive"
                onClick={() => {
                  deleteListing(listing.id);
                  setConfirmOpen(false);
                }}
              >
                Ջնջել
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-2.5 sm:p-3">
        {showPrice && (
          <span className="text-[14px] font-semibold tracking-tight text-foreground sm:text-[16px]">
            {formatPrice(listing.price, { currency, prices: listing.prices })}
            {isDaily(listing) && <span className="ml-1 text-[10px] font-normal text-accent">օր</span>}
            {isMonthly(listing) && <span className="ml-1 text-[10px] font-normal text-accent">ամիս</span>}
          </span>
        )}

        <h3 className="line-clamp-1 text-[12px] font-medium leading-snug text-foreground sm:text-[13px]">
          {listing.category === "work" ? listing.title : listingSummary(listing)}
        </h3>

        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="min-w-0 flex-1 truncate">{locationLine(listing)}</span>
        </div>

        <span className="mt-1 text-[10px] text-muted-foreground" suppressHydrationWarning>
          {formatRelativeDate(listing.publishedAt)}
        </span>
      </div>
    </article>
  );
}

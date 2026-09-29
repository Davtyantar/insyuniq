"use client";

import * as React from "react";
import Image from "next/image";
import { Link } from "@/components/i18n/locale-link";
import { Eye, Pencil, MapPin, Trash2 } from "lucide-react";
import { useApp } from "@/components/providers/app-provider";
import { Badge } from "@/components/ui/badge";
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
import type { ListingStatus } from "@/lib/api/types";
import type { CardModel } from "@/lib/card";
import { formatRelativeDate } from "@/lib/format";
import { formatAmount, periodLabel, toDisplayCurrency } from "@/lib/money";

interface MyListingCardProps {
  card: CardModel;
  /** API listings carry a status; anything but active gets a badge. */
  status?: ListingStatus;
  /** Local (mock-door) listings only; the contract has no update endpoint until PR B. */
  editHref?: string;
  onDelete?: () => void;
  priority?: boolean;
}

const STATUS_LABEL: Record<ListingStatus, string> = {
  draft: "Սևագիր",
  active: "Ակտիվ",
  archived: "Արխիվացված",
  closed: "Փակված",
};

/**
 * Compact "owner" card for the profile's "my listings" tab — smaller than the public browsing
 * card, no description, and (unlike that card) not one big link over the whole thing: only the
 * Edit button is clickable, front and center at the top instead of buried at the bottom, since
 * managing the listing is the only thing this tab is for.
 */
export function MyListingCard({ card, status, editHref, onDelete, priority }: MyListingCardProps) {
  const { currency } = useApp();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const display = toDisplayCurrency(currency);
  const cover = card.images[0];

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
      <div className="relative aspect-[16/10] shrink-0 overflow-hidden bg-secondary">
        {cover && (
          <Image
            src={cover}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            unoptimized={cover.startsWith("blob:")}
            className="object-cover"
          />
        )}
        {editHref ? (
          <Link
            href={editHref}
            className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-full bg-accent px-2.5 py-1.5 text-[11px] font-semibold text-accent-foreground shadow-md transition-colors hover:bg-brand-700 sm:text-[12px]"
          >
            <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            Խմբագրել
          </Link>
        ) : status === "active" ? (
          <Link
            href={card.href}
            className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-full bg-accent px-2.5 py-1.5 text-[11px] font-semibold text-accent-foreground shadow-md transition-colors hover:bg-brand-700 sm:text-[12px]"
          >
            <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            Դիտել
          </Link>
        ) : null}
        {onDelete && (
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            aria-label="Ջնջել հայտարարությունը"
            title="Ջնջել հայտարարությունը"
            className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-slate-950/70 text-white shadow-md backdrop-blur transition-colors hover:bg-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}

        {status && status !== "active" && (
          <Badge variant="outline" className="absolute bottom-2 left-2 z-10">
            {STATUS_LABEL[status]}
          </Badge>
        )}

        {onDelete && (
          <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ջնջե՞լ հայտարարությունը</DialogTitle>
                <DialogDescription>
                  «{card.title}»-ը կհեռացվի ձեր հայտարարություններից։ Այս գործողությունը հնարավոր չէ հետարկել։
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Չեղարկել</Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={() => {
                    onDelete();
                    setConfirmOpen(false);
                  }}
                >
                  Ջնջել
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-2.5 sm:p-3">
        {card.price && (
          <span className="text-[14px] font-semibold tracking-tight text-foreground sm:text-[16px]">
            {formatAmount(card.price, display)}
            {periodLabel(card.price.period) && (
              <span className="ml-1 text-[10px] font-normal text-accent">{periodLabel(card.price.period)}</span>
            )}
          </span>
        )}

        <h3 className="line-clamp-1 text-[12px] font-medium leading-snug text-foreground sm:text-[13px]">
          {card.headline}
        </h3>

        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="min-w-0 flex-1 truncate">{card.location}</span>
        </div>

        <span className="mt-1 text-[10px] text-muted-foreground" suppressHydrationWarning>
          {formatRelativeDate(card.publishedAt)}
        </span>
      </div>
    </article>
  );
}

"use client";

import * as React from "react";
import { Phone, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMonthYear, maskPhone, plural } from "@/lib/format";
import type { Seller } from "@/lib/types";
import { SELLER_TYPES } from "@/mock/taxonomy";

export function SellerCard({ seller }: { seller: Seller }) {
  const [revealed, setRevealed] = React.useState(false);

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={seller.avatar} alt={seller.name} />
          <AvatarFallback>{seller.name.slice(0, 1)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium">{seller.name}</p>
            {seller.online && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                առցանց
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[13px] text-muted-foreground">{SELLER_TYPES[seller.type]}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
            <span className="inline-flex items-center gap-1 text-foreground">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {seller.rating.toFixed(1)}
            </span>
            <span>
              {seller.reviews} {plural(seller.reviews, "կարծիք", "կարծիքներ")}
            </span>
            <span>
              {seller.listingsCount} {plural(seller.listingsCount, "հայտարարություն", "հայտարարություններ")}
            </span>
          </div>
        </div>
      </div>

      <dl className="mt-4 space-y-1.5 text-[13px]">
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Կայքում է</dt>
          <dd>{formatMonthYear(seller.registeredAt)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Պատասխանում է</dt>
          <dd className="text-right">{seller.responseTime}</dd>
        </div>
      </dl>

      <div className="mt-4">
        <Button
          variant="accent"
          size="lg"
          className="w-full justify-center gap-2"
          onClick={() => setRevealed(true)}
        >
          <Phone className="h-4 w-4" />
          {revealed ? seller.phone : `${maskPhone(seller.phone)} · Ցույց տալ հեռախոսը`}
        </Button>
      </div>

      <Badge variant="accent" className="mt-4">
        Կանխավճար մի փոխանցեք մինչև զննումը
      </Badge>
    </div>
  );
}

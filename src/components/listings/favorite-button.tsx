"use client";

import * as React from "react";
import { Heart } from "lucide-react";
import { useApp } from "@/components/providers/app-provider";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  listingId: string;
  className?: string;
  /** `floating` sits on top of a photo, `inline` sits in a toolbar. */
  variant?: "floating" | "inline";
  withLabel?: boolean;
}

export function FavoriteButton({
  listingId,
  className,
  variant = "floating",
  withLabel = false,
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite, hydrated } = useApp();
  const active = hydrated && isFavorite(listingId);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? "Հեռացնել հավանածներից" : "Ավելացնել հավանածներում"}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(listingId);
      }}
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        variant === "floating" &&
          "h-9 w-9 rounded-full bg-card/90 text-foreground shadow-card backdrop-blur hover:bg-card",
        variant === "inline" &&
          "h-11 rounded-md border border-input px-4 text-sm font-medium hover:bg-secondary",
        className,
      )}
    >
      <Heart
        className={cn(
          "h-[18px] w-[18px] transition-all",
          active ? "fill-destructive text-destructive" : "text-current",
        )}
      />
      {withLabel && <span>{active ? "Հավանածների մեջ է" : "Հավանել"}</span>}
    </button>
  );
}

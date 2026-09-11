"use client";

import { useApp } from "@/components/providers/app-provider";
import { cn } from "@/lib/utils";

/** Dims everything below the header while the search field is focused, spotlighting it. */
export function SearchOverlay() {
  const { searchOpen } = useApp();

  return (
    <div
      aria-hidden
      className={cn(
        "fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-[2px] transition-opacity duration-200",
        searchOpen ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    />
  );
}

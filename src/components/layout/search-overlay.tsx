"use client";

import { useApp } from "@/components/providers/app-provider";
import { cn } from "@/lib/utils";

/** Dims everything below the header while the search field or categories menu is open, spotlighting it. */
export function SearchOverlay() {
  const { searchOpen, categoriesMenuOpen } = useApp();
  const open = searchOpen || categoriesMenuOpen;

  return (
    <div
      aria-hidden
      className={cn(
        "fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-[2px] transition-opacity duration-200",
        open ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    />
  );
}

"use client";

import { useApp } from "@/components/providers/app-provider";
import { cityInPrepositional } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Appends " в Капане" (accent-colored) to a title once a city is picked in the header. */
export function CityAccent({ className }: { className?: string }) {
  const { city, hydrated } = useApp();
  if (!hydrated || !city) return null;
  return <span className={cn("text-accent", className)}> в {cityInPrepositional(city)}</span>;
}

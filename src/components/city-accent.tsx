"use client";

import { useApp } from "@/components/providers/app-provider";
import { cityInPrepositional } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Appends " Կապանում" (accent-colored, Armenian locative already means "in Kapan") once a city is picked in the header. */
export function CityAccent({ className }: { className?: string }) {
  const { city, hydrated } = useApp();
  if (!hydrated || !city) return null;
  return <span className={cn("text-accent", className)}> {cityInPrepositional(city)}</span>;
}

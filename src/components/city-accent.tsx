"use client";

import { useTranslation } from "react-i18next";
import { useApp } from "@/components/providers/app-provider";
import { CITY_SLUG } from "@/lib/cities";
import { cn } from "@/lib/utils";

/** Appends the locale's "in <city>" form (accent-colored) once a city is picked in the header. */
export function CityAccent({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { city, hydrated } = useApp();
  if (!hydrated || !city) return null;
  return <span className={cn("text-accent", className)}> {t(`cities.${CITY_SLUG[city]}.in`)}</span>;
}

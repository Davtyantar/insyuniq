"use client";

import * as React from "react";
import { Link } from "@/components/i18n/locale-link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CityAccent } from "@/components/city-accent";
import { ListingCard } from "@/components/listings/listing-card";
import type { Listing } from "@/lib/types";

interface HitsSectionProps {
  /** i18n key under `home.hits.*`, e.g. "cars" — resolved client-side so the section reacts to locale changes. */
  titleKey: string;
  href: string;
  listings: Listing[];
}

/** Gap between cards (Tailwind gap-3 = 0.75rem), used to compute the one-card scroll step. */
const GAP_PX = 12;

/**
 * Short "top picks" row for one category on the home page — a peek-scroll carousel.
 * Only ~4 cards show at once (fewer on narrow screens); the arrows reveal one more at a time
 * instead of jumping a full page, so the rest of the list stays tucked away until asked for.
 */
export function HitsSection({ titleKey, href, listings }: HitsSectionProps) {
  const { t } = useTranslation();
  const scrollerRef = React.useRef<HTMLDivElement>(null);

  function scrollByCard(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const step = (card?.getBoundingClientRect().width ?? el.clientWidth) + GAP_PX;
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  }

  return (
    <section className="container py-8 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[16px] font-semibold tracking-tight sm:text-xl md:text-2xl">
            {t(`home.hits.${titleKey}.title`)}
            <CityAccent />
          </h2>
          <p className="mt-1 text-[14px] text-muted-foreground sm:text-sm">{t(`home.hits.${titleKey}.subtitle`)}</p>
        </div>
        <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-normal">
          <Link
            href={href}
            className="inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-brand-700"
          >
            {t("common.viewAll")}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label={t("common.previous")}
              onClick={() => scrollByCard(-1)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={t("common.next")}
              onClick={() => scrollByCard(1)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="no-scrollbar snap-x-mandatory mt-5 flex gap-3 overflow-x-auto"
      >
        {listings.map((listing, index) => (
          <div
            key={listing.id}
            // Mobile shows a deliberate peek of the next card (~1.5 visible) to hint there's more
            // to scroll to; sm+ switches to evenly-divided columns with no partial card showing.
            className="w-[68%] shrink-0 snap-start sm:w-[calc(33.333%-8px)] lg:w-[calc(25%-9px)]"
          >
            <ListingCard listing={listing} priority={index < 4} />
          </div>
        ))}
      </div>
    </section>
  );
}

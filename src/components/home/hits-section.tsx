"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { CityAccent } from "@/components/city-accent";
import { ListingCard } from "@/components/listings/listing-card";
import { ListingGrid } from "@/components/listings/listing-grid";
import type { Listing } from "@/lib/types";

interface HitsSectionProps {
  title: string;
  subtitle: string;
  href: string;
  listings: Listing[];
}

/** Short "top picks" row for one category on the home page. */
export function HitsSection({ title, subtitle, href, listings }: HitsSectionProps) {
  const scrollerRef = React.useRef<HTMLDivElement>(null);

  function scrollByPage(direction: 1 | -1) {
    scrollerRef.current?.scrollBy({ left: direction * scrollerRef.current.clientWidth, behavior: "smooth" });
  }

  return (
    <section className="container py-8 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
            {title}
            <CityAccent />
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={href}
            className="inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-brand-700"
          >
            Տեսնել բոլորը
            <ArrowRight className="h-4 w-4" />
          </Link>
          {/* Slider nav — only the mobile 2-up row below scrolls, so only show these under sm. */}
          <div className="flex items-center gap-1.5 sm:hidden">
            <button
              type="button"
              aria-label="Նախորդները"
              onClick={() => scrollByPage(-1)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Հաջորդները"
              onClick={() => scrollByPage(1)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile: 2-up horizontal slider. */}
      <div
        ref={scrollerRef}
        className="no-scrollbar snap-x-mandatory mt-5 flex gap-3 overflow-x-auto sm:hidden"
      >
        {listings.map((listing, index) => (
          <div key={listing.id} className="w-[calc(50%-6px)] shrink-0 snap-start">
            <ListingCard listing={listing} priority={index < 2} />
          </div>
        ))}
      </div>

      {/* Tablet and up: regular grid. */}
      <ListingGrid listings={listings} columns={4} className="mt-5 hidden sm:grid" />
    </section>
  );
}

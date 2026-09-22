"use client";

import * as React from "react";
import Image from "next/image";
import { Link } from "@/components/i18n/locale-link";
import { ArrowRight, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { CityAccent } from "@/components/city-accent";
import { FavoriteButton } from "@/components/listings/favorite-button";
import { useApp } from "@/components/providers/app-provider";
import { categoryOf, listingHref } from "@/lib/categories";
import { formatPrice, formatRelativeDate } from "@/lib/format";
import { isDaily, isMonthly, listingSummary, locationLine } from "@/lib/specs";
import type { Listing } from "@/lib/types";

interface NewArrivalsProps {
  listings: Listing[];
}

/** How fast the row drifts on its own, in pixels per second — a normal walking pace, not a crawl. */
const AUTO_SCROLL_PX_PER_SEC = 55;

/** Below this, the row is mobile: swipe + the prev/next buttons instead of the auto-drift. */
const DESKTOP_QUERY = "(min-width: 640px)";

/** Gap between cards (Tailwind gap-4 = 1rem), used to compute the mobile arrow-button step. */
const GAP_PX = 16;

/**
 * Editorial, photo-first showcase of the newest listings across every category — sits right
 * after the real-estate hits row so the home page opens with "top picks" then "what's fresh".
 * Same peek-scroll carousel mechanics as HitsSection, but taller image-led cards with the
 * price/title overlaid on the photo instead of a separate text block below it.
 *
 * On desktop the row drifts sideways on its own instead of relying on prev/next buttons — the
 * list is rendered twice back to back so the drift can loop seamlessly (resetting scrollLeft by
 * exactly half the scroll width is invisible, since the second half mirrors the first). It
 * pauses whenever the pointer is anywhere over the row, never starts for anyone who has asked
 * for reduced motion, and stays off on mobile, where the prev/next buttons drive it instead —
 * auto-drift fights a thumb mid-swipe, so phones keep the manual controls.
 */
export function NewArrivals({ listings }: NewArrivalsProps) {
  const { currency } = useApp();
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const pausedRef = React.useRef(false);

  function scrollByCard(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const step =
      (card?.getBoundingClientRect().width ?? el.clientWidth) + GAP_PX;
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  }

  React.useEffect(() => {
    const el = scrollerRef.current;
    if (!el || listings.length === 0) return;

    const desktop = window.matchMedia(DESKTOP_QUERY);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let frame: number | null = null;
    let last = performance.now();

    function tick(now: number) {
      const elapsed = now - last;
      last = now;
      if (el && !pausedRef.current) {
        el.scrollLeft += (AUTO_SCROLL_PX_PER_SEC * elapsed) / 1000;
        const half = el.scrollWidth / 2;
        if (el.scrollLeft >= half) el.scrollLeft -= half;
      }
      frame = requestAnimationFrame(tick);
    }

    function sync() {
      const shouldRun = desktop.matches && !reduceMotion.matches;
      if (shouldRun && frame === null) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      } else if (!shouldRun && frame !== null) {
        cancelAnimationFrame(frame);
        frame = null;
      }
    }

    sync();
    desktop.addEventListener("change", sync);
    reduceMotion.addEventListener("change", sync);

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      desktop.removeEventListener("change", sync);
      reduceMotion.removeEventListener("change", sync);
    };
  }, [listings.length]);

  return (
    <section className="bg-gradient-to-b from-brand-50/60 via-transparent to-transparent dark:from-brand-500/[0.06]">
      <div className="container pt-8 md:pt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="mt-2 text-[16px] font-semibold tracking-tight sm:text-xl md:text-2xl">
              Վերջերս ավելացվածները
              <CityAccent />
            </h2>
            <p className="mt-1 text-[14px] text-muted-foreground sm:text-sm">
              Ամենաթարմ հայտարարությունները բոլոր կատեգորիաներից՝ մեկ տեղում
            </p>
          </div>
          <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-start">
            <Link
              href="/search"
              className="inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-brand-700"
            >
              Տեսնել բոլորը
              <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-1.5 sm:hidden">
              <button
                type="button"
                aria-label="Նախորդները"
                onClick={() => scrollByCard(-1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Հաջորդները"
                onClick={() => scrollByCard(1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile keeps the normal `.container` gutter; from `sm` up the wrapper drops its own
          max-width/padding so the row can bleed full-bleed, and the scroller supplies matching
          side padding itself so the first card still lines up under the heading. */}
      <div className="container sm:max-w-none sm:px-0">
        <div
          ref={scrollerRef}
          onMouseEnter={() => {
            pausedRef.current = true;
          }}
          onMouseLeave={() => {
            pausedRef.current = false;
          }}
          className="no-scrollbar snap-x-mandatory mt-5 flex gap-4 overflow-x-auto pb-8 py-3 sm:snap-none sm:px-4 md:pb-10 lg:px-8"
        >
          {[...listings, ...listings].map((listing, index) => {
            const category = categoryOf(listing);
            const isDuplicate = index >= listings.length;
            return (
              <article
                key={`${listing.id}-${isDuplicate ? "dup" : "orig"}`}
                aria-hidden={isDuplicate || undefined}
                className="group relative w-[74%] shrink-0 snap-start sm:w-[min(45%,288px)] sm:snap-align-none md:w-[min(31%,238px)] lg:w-[min(22.5%,306px)]"
              >
                <Link
                  href={listingHref(listing)}
                  className="absolute inset-0 z-10"
                  aria-label={listing.title}
                  tabIndex={isDuplicate ? -1 : undefined}
                >
                  <span className="sr-only">{listing.title}</span>
                </Link>

                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-secondary shadow-sm ring-2 ring-transparent transition-[box-shadow] duration-300 sm:group-hover:shadow-lift sm:group-hover:ring-accent/50">
                  <Image
                    src={listing.images[0]}
                    alt={listing.title}
                    fill
                    sizes="(max-width: 640px) 75vw, (max-width: 1024px) 35vw, 22vw"
                    priority={!isDuplicate && index < 3}
                    unoptimized={listing.images[0].startsWith("blob:")}
                    className="object-cover"
                  />

                  {/* Occasional light sweep, staggered per card so the row doesn't flash in
                      unison — a quiet "alive" cue instead of a hover-zoom on the photo. */}
                  <span
                    aria-hidden
                    style={{ animationDelay: `${(index % 5) * 0.7}s` }}
                    className="pointer-events-none absolute inset-0 z-10 -skew-x-[20deg] animate-wink bg-gradient-to-r from-transparent via-white/25 to-transparent"
                  />

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-black/10" />

                  <div className="absolute inset-x-3 top-3 z-20 flex items-start justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-slate-900 shadow-sm backdrop-blur">
                      <category.icon className="h-3 w-3" />
                      {category.label}
                    </span>
                    <span inert={isDuplicate ? true : undefined}>
                      <FavoriteButton
                        listingId={listing.id}
                        className="h-8 w-8 shrink-0"
                      />
                    </span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 z-20 p-3.5 text-white sm:p-4">
                    <div className="flex items-center gap-1 text-[11px] font-medium text-white/80">
                      <Clock className="h-3 w-3" />
                      {formatRelativeDate(listing.publishedAt)}
                    </div>
                    <p className="mt-1 line-clamp-1 text-[14px] font-medium leading-snug sm:text-[15px]">
                      {listingSummary(listing)}
                    </p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="truncate text-[12px] text-white/75">
                        {locationLine(listing)}
                      </span>
                      <span className="shrink-0 text-[15px] font-semibold">
                        {formatPrice(listing.price, {
                          currency,
                          prices: listing.prices,
                        })}
                        {isDaily(listing) && (
                          <span className="ml-0.5 text-[11px] font-normal text-white/80">
                            /օր
                          </span>
                        )}
                        {isMonthly(listing) && (
                          <span className="ml-0.5 text-[11px] font-normal text-white/80">
                            /ամիս
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

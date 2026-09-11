"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
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

/** Gap between cards (Tailwind gap-3.5 = 0.875rem), used to compute the one-card scroll step. */
const GAP_PX = 14;

/**
 * Editorial, photo-first showcase of the newest listings across every category — sits right
 * after the real-estate hits row so the home page opens with "top picks" then "what's fresh".
 * Same peek-scroll carousel mechanics as HitsSection, but taller image-led cards with the
 * price/title overlaid on the photo instead of a separate text block below it.
 */
export function NewArrivals({ listings }: NewArrivalsProps) {
  const { currency } = useApp();
  const scrollerRef = React.useRef<HTMLDivElement>(null);

  function scrollByCard(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const step =
      (card?.getBoundingClientRect().width ?? el.clientWidth) + GAP_PX;
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  }

  return (
    <section className='bg-gradient-to-b from-brand-50/60 via-transparent to-transparent dark:from-brand-500/[0.06]'>
      <div className='container py-8 md:py-10'>
        <div className='flex flex-wrap items-end justify-between gap-3'>
          <div>
            <h2 className='mt-2 text-xl font-semibold tracking-tight md:text-2xl'>
              Վերջերս ավելացվածները
              <CityAccent />
            </h2>
            <p className='mt-1 text-sm text-muted-foreground'>
              Ամենաթարմ հայտարարությունները բոլոր կատեգորիաներից՝ մեկ տեղում
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <Link
              href='/search'
              className='inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-brand-700'
            >
              Տեսնել բոլորը
              <ArrowRight className='h-4 w-4' />
            </Link>
            <div className='flex items-center gap-1.5'>
              <button
                type='button'
                aria-label='Նախորդները'
                onClick={() => scrollByCard(-1)}
                className='flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary'
              >
                <ChevronLeft className='h-4 w-4' />
              </button>
              <button
                type='button'
                aria-label='Հաջորդները'
                onClick={() => scrollByCard(1)}
                className='flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary'
              >
                <ChevronRight className='h-4 w-4' />
              </button>
            </div>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className='no-scrollbar snap-x-mandatory mt-5 flex gap-3.5 overflow-x-auto pb-1'
        >
          {listings.map((listing, index) => {
            const category = categoryOf(listing);
            return (
              <article
                key={listing.id}
                className='group relative w-[74%] shrink-0 snap-start sm:w-[45%] md:w-[31%] lg:w-[22.5%]'
              >
                <Link
                  href={listingHref(listing)}
                  className='absolute inset-0 z-10'
                  aria-label={listing.title}
                >
                  <span className='sr-only'>{listing.title}</span>
                </Link>

                <div className='relative aspect-[3/4] overflow-hidden rounded-2xl bg-secondary shadow-sm transition-shadow duration-300 group-hover:shadow-lift'>
                  <Image
                    src={listing.images[0]}
                    alt={listing.title}
                    fill
                    sizes='(max-width: 640px) 75vw, (max-width: 1024px) 35vw, 22vw'
                    priority={index < 3}
                    unoptimized={listing.images[0].startsWith("blob:")}
                    className='object-cover transition-transform duration-500 group-hover:scale-[1.04]'
                  />

                  <div className='pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-black/10' />

                  <div className='absolute inset-x-3 top-3 z-20 flex items-start justify-between gap-2'>
                    <span className='inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-slate-900 shadow-sm backdrop-blur'>
                      <category.icon className='h-3 w-3' />
                      {category.label}
                    </span>
                    <FavoriteButton
                      listingId={listing.id}
                      className='h-8 w-8 shrink-0'
                    />
                  </div>

                  <div className='absolute inset-x-0 bottom-0 z-20 p-3.5 text-white sm:p-4'>
                    <div className='flex items-center gap-1 text-[11px] font-medium text-white/80'>
                      <Clock className='h-3 w-3' />
                      {formatRelativeDate(listing.publishedAt)}
                    </div>
                    <p className='mt-1 line-clamp-1 text-[14px] font-medium leading-snug sm:text-[15px]'>
                      {listingSummary(listing)}
                    </p>
                    <div className='mt-1 flex items-center justify-between gap-2'>
                      <span className='truncate text-[12px] text-white/75'>
                        {locationLine(listing)}
                      </span>
                      <span className='shrink-0 text-[15px] font-semibold'>
                        {formatPrice(listing.price, { currency })}
                        {isDaily(listing) && (
                          <span className='ml-0.5 text-[11px] font-normal text-white/80'>
                            /օր
                          </span>
                        )}
                        {isMonthly(listing) && (
                          <span className='ml-0.5 text-[11px] font-normal text-white/80'>
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

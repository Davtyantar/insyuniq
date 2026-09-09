"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { listingHref } from "@/lib/categories";
import { formatPrice } from "@/lib/format";
import { isDaily, isMonthly, listingSummary, locationLine } from "@/lib/specs";
import type { Listing } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ALL_LISTINGS } from "@/mock/listings";

interface SearchBarProps {
  className?: string;
  defaultQuery?: string;
}

const MAX_SUGGESTIONS = 6;

function matchListings(query: string): Listing[] {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const scored = ALL_LISTINGS.map((listing) => {
    const haystack = [
      listing.title,
      listing.city,
      listing.district ?? "",
      "brand" in listing ? `${listing.brand} ${listing.model}` : "",
    ]
      .join(" ")
      .toLowerCase();
    if (!terms.every((term) => haystack.includes(term))) return null;
    const startsWithBonus = haystack.startsWith(terms[0]) ? 1 : 0;
    return { listing, score: startsWithBonus * 1000 + listing.views };
  }).filter((entry): entry is { listing: Listing; score: number } => entry !== null);
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, MAX_SUGGESTIONS).map((entry) => entry.listing);
}

/** Single search field for the whole app: live suggestions as you type, submits on Enter, routes to /search. */
export function SearchBar({ className, defaultQuery = "" }: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = React.useState(defaultQuery);
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isFirstRender = React.useRef(true);

  const suggestions = React.useMemo(() => matchListings(query), [query]);
  const showDropdown = open && query.trim().length > 0;

  // Navigating anywhere — a nav link, the logo, a suggestion — clears the field
  // instead of leaving a stale query sitting in the header.
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setQuery("");
    setOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  React.useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function goToResults(value: string) {
    const trimmed = value.trim();
    setOpen(false);
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      setOpen(false);
      router.push(listingHref(suggestions[activeIndex]));
      return;
    }
    goToResults(query);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown || suggestions.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <form onSubmit={submit} className="w-full" role="search" autoComplete="off">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Որոնել հայտարարությունների մեջ"
            aria-label="Որոնել հայտարարությունների մեջ"
            role="combobox"
            aria-expanded={showDropdown}
            aria-autocomplete="list"
            aria-controls="search-suggestions"
            className="h-11 rounded-xl pl-11 pr-4 text-[15px]"
          />
        </div>
      </form>

      {showDropdown && (
        <div
          id="search-suggestions"
          role="listbox"
          className="thin-scrollbar absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-[70vh] overflow-y-auto rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-pop animate-fade-in"
        >
          {suggestions.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">
              Ոչինչ չի գտնվել «{query.trim()}» հարցման համար
            </p>
          ) : (
            <>
              {suggestions.map((listing, index) => (
                <Link
                  key={listing.id}
                  href={listingHref(listing)}
                  role="option"
                  aria-selected={index === activeIndex}
                  onClick={() => setOpen(false)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg p-2 transition-colors",
                    index === activeIndex ? "bg-secondary" : "hover:bg-secondary/70",
                  )}
                >
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md bg-secondary">
                    <Image
                      src={listing.images[0]}
                      alt=""
                      fill
                      sizes="44px"
                      unoptimized={listing.images[0]?.startsWith("blob:")}
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-medium text-foreground">
                      {listing.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {listingSummary(listing)} · {locationLine(listing)}
                    </p>
                  </div>
                  <span className="shrink-0 text-[13px] font-semibold text-foreground">
                    {formatPrice(listing.price, {
                      perMonth: isMonthly(listing),
                      perDay: isDaily(listing),
                    })}
                  </span>
                </Link>
              ))}
              <button
                type="button"
                onClick={() => goToResults(query)}
                className="mt-0.5 flex w-full items-center justify-center gap-1.5 rounded-lg p-2.5 text-sm font-medium text-accent transition-colors hover:bg-secondary/70"
              >
                <Search className="h-3.5 w-3.5" />
                Բոլոր արդյունքները «{query.trim()}» հարցման համար
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

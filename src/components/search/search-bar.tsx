"use client";

import * as React from "react";
import Image from "next/image";
import { Link } from "@/components/i18n/locale-link";
import { usePathname, useRouter } from "next/navigation";
import { Clock, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useApp } from "@/components/providers/app-provider";
import { Input } from "@/components/ui/input";
import { CATEGORY_LIST, listingHref } from "@/lib/categories";
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
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const {
    currency,
    searchOpen: open,
    setSearchOpen: setOpen,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    localizeHref,
  } = useApp();
  const [query, setQuery] = React.useState(defaultQuery);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isFirstRender = React.useRef(true);

  const suggestions = React.useMemo(() => matchListings(query), [query]);
  const showDropdown = open && query.trim().length > 0;
  const showEmptyPanel = open && query.trim().length === 0;

  // Navigating anywhere — a nav link, the logo, a suggestion — clears the field
  // instead of leaving a stale query sitting in the header.
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setQuery("");
    setOpen(false);
  }, [pathname, setOpen]);

  React.useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  React.useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [setOpen]);

  // Scrolling away from the search field should drop the spotlight/overlay, same as clicking out.
  React.useEffect(() => {
    if (!open) return;
    function handleScroll() {
      setOpen(false);
      const active = document.activeElement;
      if (active instanceof HTMLElement && containerRef.current?.contains(active)) active.blur();
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [open, setOpen]);

  function goToResults(value: string) {
    const trimmed = value.trim();
    setOpen(false);
    if (trimmed) addRecentSearch(trimmed);
    router.push(localizeHref(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search"));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      setOpen(false);
      router.push(localizeHref(listingHref(suggestions[activeIndex])));
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
            placeholder={t("search.placeholder")}
            aria-label={t("search.placeholder")}
            role="combobox"
            aria-expanded={showDropdown || showEmptyPanel}
            aria-autocomplete="list"
            aria-controls="search-suggestions"
            className="h-11 rounded-xl pl-11 pr-4 text-[15px]"
          />
        </div>
      </form>

      {showEmptyPanel && (
        <div
          id="search-suggestions"
          className="thin-scrollbar absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-[70vh] overflow-y-auto rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-pop animate-fade-in"
        >
          {recentSearches.length > 0 && (
            <div className="p-1.5 pb-1">
              <p className="px-1.5 pb-1 text-[12px] font-semibold text-muted-foreground">
                {t("search.recent")}
              </p>
              {recentSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setQuery(term);
                    goToResults(term);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg p-2 text-left text-[13.5px] text-foreground transition-colors hover:bg-secondary/70"
                >
                  <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{term}</span>
                </button>
              ))}
            </div>
          )}

          <div className="p-1.5 pt-1">
            <p className="px-1.5 pb-1 text-[12px] font-semibold text-muted-foreground">
              {t("search.popular")}
            </p>
            {CATEGORY_LIST.map((category) => (
              <Link
                key={category.slug}
                href={category.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg p-2 text-[13.5px] text-foreground transition-colors hover:bg-secondary/70"
              >
                <category.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                {category.label}
              </Link>
            ))}
          </div>

          {recentSearches.length > 0 && (
            <div className="flex justify-end border-t border-border p-1.5 pt-2">
              <button
                type="button"
                onClick={clearRecentSearches}
                className="rounded-md px-2 py-1 text-[12.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {t("search.clear")}
              </button>
            </div>
          )}
        </div>
      )}

      {showDropdown && (
        <div
          id="search-suggestions"
          role="listbox"
          className="thin-scrollbar absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-[70vh] overflow-y-auto rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-pop animate-fade-in"
        >
          {suggestions.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">
              {t("search.noResults", { query: query.trim() })}
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
                    {formatPrice(listing.price, { currency })}
                    {isDaily(listing) && (
                      <span className="ml-0.5 text-[11px] font-normal text-accent">օր</span>
                    )}
                    {isMonthly(listing) && (
                      <span className="ml-0.5 text-[11px] font-normal text-accent">ամիս</span>
                    )}
                  </span>
                </Link>
              ))}
              <button
                type="button"
                onClick={() => goToResults(query)}
                className="mt-0.5 flex w-full items-center justify-center gap-1.5 rounded-lg p-2.5 text-sm font-medium text-accent transition-colors hover:bg-secondary/70"
              >
                <Search className="h-3.5 w-3.5" />
                {t("search.allResultsFor", { query: query.trim() })}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

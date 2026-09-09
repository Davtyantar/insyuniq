"use client";

import * as React from "react";
import type { Locale } from "@/lib/i18n";
import type { Listing } from "@/lib/types";

const FAVORITES_KEY = "syuniq:favorites";
const CITY_KEY = "syuniq:city";
const LOCALE_KEY = "syuniq:locale";
const THEME_KEY = "syuniq:theme";

export type Theme = "light" | "dark";

function applyThemeClass(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

interface AppState {
  favorites: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  /** Listings published through the wizard in this session. */
  published: Listing[];
  publishListing: (listing: Listing) => void;
  /** Selected city, shown next to search; null until the user picks one. */
  city: string | null;
  setCity: (city: string) => void;
  /** Interface language; defaults to Russian until the user picks one. */
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** Light/dark theme; a blocking inline script in the document head applies it before first paint. */
  theme: Theme;
  toggleTheme: () => void;
  /** False until localStorage has been read, so SSR and first paint agree. */
  hydrated: boolean;
}

const AppContext = React.createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = React.useState<string[]>([]);
  const [published, setPublished] = React.useState<Listing[]>([]);
  const [city, setCityState] = React.useState<string | null>(null);
  const [locale, setLocaleState] = React.useState<Locale>("am");
  const [theme, setThemeState] = React.useState<Theme>("light");
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(FAVORITES_KEY);
      if (raw) setFavorites(JSON.parse(raw) as string[]);
    } catch {
      // Ignore unavailable or corrupted storage — favorites simply start empty.
    }
    try {
      const savedCity = window.localStorage.getItem(CITY_KEY);
      if (savedCity) setCityState(savedCity);
    } catch {
      // Ignore unavailable storage — city picker simply starts unset.
    }
    try {
      const savedLocale = window.localStorage.getItem(LOCALE_KEY);
      if (savedLocale === "ru" || savedLocale === "am" || savedLocale === "en") {
        setLocaleState(savedLocale);
      }
    } catch {
      // Ignore unavailable storage — locale simply starts at the default.
    }
    // The blocking inline script in <head> already set the "dark" class before paint;
    // just mirror that into state so React and the DOM agree.
    setThemeState(document.documentElement.classList.contains("dark") ? "dark" : "light");
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch {
      // Storage can be full or blocked; favourites stay in memory for this session.
    }
  }, [favorites, hydrated]);

  const toggleFavorite = React.useCallback((id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [id, ...prev]));
  }, []);

  const isFavorite = React.useCallback((id: string) => favorites.includes(id), [favorites]);

  const publishListing = React.useCallback((listing: Listing) => {
    setPublished((prev) => [listing, ...prev]);
  }, []);

  const setCity = React.useCallback((next: string) => {
    setCityState(next);
    try {
      window.localStorage.setItem(CITY_KEY, next);
    } catch {
      // Storage can be full or blocked; city stays in memory for this session.
    }
  }, []);

  const setLocale = React.useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(LOCALE_KEY, next);
    } catch {
      // Storage can be full or blocked; locale stays in memory for this session.
    }
  }, []);

  const toggleTheme = React.useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      applyThemeClass(next);
      try {
        window.localStorage.setItem(THEME_KEY, next);
      } catch {
        // Storage can be full or blocked; theme stays in memory for this session.
      }
      return next;
    });
  }, []);

  const value = React.useMemo<AppState>(
    () => ({
      favorites,
      isFavorite,
      toggleFavorite,
      published,
      publishListing,
      city,
      setCity,
      locale,
      setLocale,
      theme,
      toggleTheme,
      hydrated,
    }),
    [
      favorites,
      isFavorite,
      toggleFavorite,
      published,
      publishListing,
      city,
      setCity,
      locale,
      setLocale,
      theme,
      toggleTheme,
      hydrated,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const context = React.useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside <AppProvider>");
  return context;
}

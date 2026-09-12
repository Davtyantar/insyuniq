"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { i18next } from "@/i18n/config";
import type { Currency } from "@/lib/currency";
import { LOCALE_HTML_LANG, localeFromPathname, stripLocalePrefix, withLocalePrefix, type Locale } from "@/lib/i18n";
import type { Listing } from "@/lib/types";

const FAVORITES_KEY = "syuniq:favorites";
const CITY_KEY = "syuniq:city";
const CURRENCY_KEY = "syuniq:currency";
const THEME_KEY = "syuniq:theme";
const RECENT_SEARCHES_KEY = "syuniq:recentSearches";
const USER_KEY = "syuniq:user";
const MAX_RECENT_SEARCHES = 8;

export type Theme = "light" | "dark";

/** Prototype-only account — created and stored entirely client-side, no backend involved. */
export interface AuthUser {
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  registeredAt: string;
}

/** Only one header dropdown (search, categories menu, city, language/currency) can be open at a time. */
type HeaderMenu = "search" | "categories" | "location" | "language" | null;

function applyThemeClass(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  const meta = document.querySelector('meta[name="theme-color"]');
  meta?.setAttribute("content", theme === "dark" ? "#141a24" : "#ffffff");
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
  /** Interface language — derived from the URL ("/", "/ru", "/en"), never stored; the URL is the single source of truth. */
  locale: Locale;
  /** Navigates to the same page under the given locale's URL prefix. */
  setLocale: (locale: Locale) => void;
  /** Prefixes an internal href ("/cars") with the current locale's URL prefix; passes external/anchor hrefs through untouched. */
  localizeHref: (href: string) => string;
  /** Currency prices are displayed in; listing prices are stored in USD and converted for display. */
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  /** Light/dark theme; a blocking inline script in the document head applies it before first paint. */
  theme: Theme;
  toggleTheme: () => void;
  /** False until localStorage has been read, so SSR and first paint agree. */
  hydrated: boolean;
  /** Whether the header search field is focused/open; dims the rest of the page to spotlight it.
   * Only one header dropdown is ever open at once — opening one closes the others. */
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  /** Whether the header categories mega menu is open; also dims the rest of the page. */
  categoriesMenuOpen: boolean;
  setCategoriesMenuOpen: (open: boolean) => void;
  /** Whether the city picker dropdown is open. */
  locationMenuOpen: boolean;
  setLocationMenuOpen: (open: boolean) => void;
  /** Whether the language/currency picker dropdown is open. */
  languageMenuOpen: boolean;
  setLanguageMenuOpen: (open: boolean) => void;
  /** Most recent search queries, newest first; shown in the search dropdown before the user types. */
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  /** Signed-in account for this prototype; null until sign-in/sign-up, persisted to localStorage only. */
  user: AuthUser | null;
  signIn: (user: AuthUser) => void;
  signUp: (user: AuthUser) => void;
  updateUser: (patch: Partial<AuthUser>) => void;
  signOut: () => void;
}

const AppContext = React.createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  // Derived, not stored — identical on the server and on first client render,
  // since it comes straight from the URL Next.js already resolved.
  const locale = React.useMemo(() => localeFromPathname(pathname), [pathname]);

  const [favorites, setFavorites] = React.useState<string[]>([]);
  const [published, setPublished] = React.useState<Listing[]>([]);
  const [city, setCityState] = React.useState<string | null>(null);
  const [currency, setCurrencyState] = React.useState<Currency>("USD");
  const [theme, setThemeState] = React.useState<Theme>("light");
  const [hydrated, setHydrated] = React.useState(false);
  const [activeHeaderMenu, setActiveHeaderMenu] = React.useState<HeaderMenu>(null);
  const [recentSearches, setRecentSearches] = React.useState<string[]>([]);
  const [user, setUser] = React.useState<AuthUser | null>(null);

  const searchOpen = activeHeaderMenu === "search";
  const categoriesMenuOpen = activeHeaderMenu === "categories";
  const locationMenuOpen = activeHeaderMenu === "location";
  const languageMenuOpen = activeHeaderMenu === "language";

  const setSearchOpen = React.useCallback((open: boolean) => {
    setActiveHeaderMenu((prev) => (open ? "search" : prev === "search" ? null : prev));
  }, []);
  const setCategoriesMenuOpen = React.useCallback((open: boolean) => {
    setActiveHeaderMenu((prev) => (open ? "categories" : prev === "categories" ? null : prev));
  }, []);
  const setLocationMenuOpen = React.useCallback((open: boolean) => {
    setActiveHeaderMenu((prev) => (open ? "location" : prev === "location" ? null : prev));
  }, []);
  const setLanguageMenuOpen = React.useCallback((open: boolean) => {
    setActiveHeaderMenu((prev) => (open ? "language" : prev === "language" ? null : prev));
  }, []);

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
      const savedCurrency = window.localStorage.getItem(CURRENCY_KEY);
      if (savedCurrency === "USD" || savedCurrency === "AMD" || savedCurrency === "EUR" || savedCurrency === "RUB") {
        setCurrencyState(savedCurrency);
      }
    } catch {
      // Ignore unavailable storage — currency simply starts at the default.
    }
    // The blocking inline script in <head> already set the "dark" class before paint;
    // just mirror that into state so React and the DOM agree.
    setThemeState(document.documentElement.classList.contains("dark") ? "dark" : "light");
    try {
      const savedSearches = window.localStorage.getItem(RECENT_SEARCHES_KEY);
      if (savedSearches) setRecentSearches(JSON.parse(savedSearches) as string[]);
    } catch {
      // Ignore unavailable or corrupted storage — recent searches simply start empty.
    }
    try {
      const savedUser = window.localStorage.getItem(USER_KEY);
      if (savedUser) setUser(JSON.parse(savedUser) as AuthUser);
    } catch {
      // Ignore unavailable or corrupted storage — user simply starts signed out.
    }
    setHydrated(true);
  }, []);

  // Keeps i18next and <html lang> in sync with the URL-derived locale. Runs
  // client-side only (after first paint), so a direct visit to /ru or /en
  // briefly shows Armenian chrome text before this fires — the same
  // hydration-flash tradeoff any client-only i18n setup makes, since the
  // server always renders the Armenian default.
  React.useEffect(() => {
    i18next.changeLanguage(locale);
    document.documentElement.lang = LOCALE_HTML_LANG[locale];
  }, [locale]);

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

  const setLocale = React.useCallback(
    (next: Locale) => {
      const search = typeof window !== "undefined" ? window.location.search : "";
      const target = withLocalePrefix(stripLocalePrefix(pathname), next) + search;
      router.push(target);
    },
    [pathname, router],
  );

  const localizeHref = React.useCallback(
    (href: string) => (href.startsWith("/") ? withLocalePrefix(href, locale) : href),
    [locale],
  );

  const setCurrency = React.useCallback((next: Currency) => {
    setCurrencyState(next);
    try {
      window.localStorage.setItem(CURRENCY_KEY, next);
    } catch {
      // Storage can be full or blocked; currency stays in memory for this session.
    }
  }, []);

  const addRecentSearch = React.useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const next = [trimmed, ...prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(
        0,
        MAX_RECENT_SEARCHES,
      );
      try {
        window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      } catch {
        // Storage can be full or blocked; recent searches stay in memory for this session.
      }
      return next;
    });
  }, []);

  const clearRecentSearches = React.useCallback(() => {
    setRecentSearches([]);
    try {
      window.localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Storage can be full or blocked; clearing in-memory state is still enough.
    }
  }, []);

  const persistUser = React.useCallback((next: AuthUser | null) => {
    setUser(next);
    try {
      if (next) window.localStorage.setItem(USER_KEY, JSON.stringify(next));
      else window.localStorage.removeItem(USER_KEY);
    } catch {
      // Storage can be full or blocked; the session stays signed in only in memory.
    }
  }, []);

  const signIn = React.useCallback((next: AuthUser) => persistUser(next), [persistUser]);
  const signUp = React.useCallback((next: AuthUser) => persistUser(next), [persistUser]);
  const signOut = React.useCallback(() => persistUser(null), [persistUser]);
  const updateUser = React.useCallback(
    (patch: Partial<AuthUser>) => {
      setUser((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...patch };
        try {
          window.localStorage.setItem(USER_KEY, JSON.stringify(next));
        } catch {
          // Storage can be full or blocked; the update stays in memory for this session.
        }
        return next;
      });
    },
    [],
  );

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
      localizeHref,
      currency,
      setCurrency,
      theme,
      toggleTheme,
      hydrated,
      searchOpen,
      setSearchOpen,
      categoriesMenuOpen,
      setCategoriesMenuOpen,
      locationMenuOpen,
      setLocationMenuOpen,
      languageMenuOpen,
      setLanguageMenuOpen,
      recentSearches,
      addRecentSearch,
      clearRecentSearches,
      user,
      signIn,
      signUp,
      updateUser,
      signOut,
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
      localizeHref,
      currency,
      setCurrency,
      theme,
      toggleTheme,
      hydrated,
      searchOpen,
      setSearchOpen,
      categoriesMenuOpen,
      setCategoriesMenuOpen,
      locationMenuOpen,
      setLocationMenuOpen,
      languageMenuOpen,
      setLanguageMenuOpen,
      recentSearches,
      addRecentSearch,
      clearRecentSearches,
      user,
      signIn,
      signUp,
      updateUser,
      signOut,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const context = React.useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside <AppProvider>");
  return context;
}

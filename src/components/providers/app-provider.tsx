"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { i18next } from "@/i18n/config";
import type { SellerProfile } from "@/lib/api/types";
import type { AuthUser } from "@/lib/account";
import { API_DOORS } from "@/lib/categories";
import type { Currency } from "@/lib/currency";
import { LOCALE_HTML_LANG, localeFromPathname, stripLocalePrefix, withLocalePrefix, type Locale } from "@/lib/i18n";
import type { Listing } from "@/lib/types";
import { type AuthResult, useSupabaseAuth } from "./use-supabase-auth";

export type { AuthUser };

const FAVORITES_KEY = "syuniq:favorites";
const CITY_KEY = "syuniq:city";
const CURRENCY_KEY = "syuniq:currency";
const THEME_KEY = "syuniq:theme";
const RECENT_SEARCHES_KEY = "syuniq:recentSearches";
// Bumped to "v2": anyone who deleted the seed listing under the old key has an empty array
// saved there, which (correctly, by design) is never re-seeded — bumping the key itself is a
// one-time reset that gets everyone back the example listing once, on this deploy only.
const PUBLISHED_KEY = "syuniq:published:v2";
const MAX_RECENT_SEARCHES = 8;

export type Theme = "light" | "dark";

/** Only one header dropdown (search, categories menu, city, language/currency, mobile nav) can be open at a time. */
type HeaderMenu = "search" | "categories" | "location" | "language" | "mobile" | null;

function applyThemeClass(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  const meta = document.querySelector('meta[name="theme-color"]');
  meta?.setAttribute("content", theme === "dark" ? "#141a24" : "#ffffff");
}

interface AppState {
  favorites: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  clearFavorites: () => void;
  /** Drops ids the API no longer knows (deleted or archived listings). */
  removeFavorites: (ids: string[]) => void;
  /** Listings published through the wizard (non-API categories only), persisted to localStorage. */
  published: Listing[];
  publishListing: (listing: Listing) => void;
  /** Replaces an existing published listing in place — the wizard's edit mode. */
  updateListing: (id: string, listing: Listing) => void;
  /** Removes a published listing — the profile's "my listings" delete action. */
  deleteListing: (id: string) => void;
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
  /** Whether the phone burger-menu panel is open. */
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  /** Most recent search queries, newest first; shown in the search dropdown before the user types. */
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  /** Signed-in account, derived from the Supabase session and seller profile; null when signed out. */
  user: AuthUser | null;
  /** The API's seller profile for the signed-in user; null until it's loaded (or there is none yet). */
  profile: SellerProfile | null;
  /** The current Supabase access token, or null when signed out / unconfigured. */
  getToken: () => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (input: { name: string; phone: string; email: string; password: string }) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  saveProfile: (patch: { name?: string; phone?: string; avatarPath?: string | null }) => Promise<AuthResult>;
  changeEmail: (email: string) => Promise<AuthResult>;
  changePassword: (current: string, next: string) => Promise<AuthResult>;
  setNewPassword: (password: string) => Promise<AuthResult>;
  requestPasswordReset: (email: string) => Promise<AuthResult>;
  /** "/create" when signed in, otherwise "/sign-in" — every "publish a listing" entry point
   * (header, bottom nav, footer, home banners, profile, empty states) links through this
   * instead of a bare "/create", so signed-out visitors land straight on the sign-in form
   * instead of bouncing through /create's own redirect (and the header/footer flash that'd
   * cause — see SiteChrome). Not locale-prefixed; wrap with localizeHref where needed. */
  createHref: string;
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
  const [storageHydrated, setStorageHydrated] = React.useState(false);
  const [activeHeaderMenu, setActiveHeaderMenu] = React.useState<HeaderMenu>(null);
  const [recentSearches, setRecentSearches] = React.useState<string[]>([]);
  const auth = useSupabaseAuth();
  const { user, profile, getToken, signIn, signUp, signOut, saveProfile, changeEmail, changePassword, setNewPassword, requestPasswordReset } =
    auth;
  const hydrated = storageHydrated && auth.ready;

  const searchOpen = activeHeaderMenu === "search";
  const categoriesMenuOpen = activeHeaderMenu === "categories";
  const locationMenuOpen = activeHeaderMenu === "location";
  const languageMenuOpen = activeHeaderMenu === "language";
  const mobileMenuOpen = activeHeaderMenu === "mobile";

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
  const setMobileMenuOpen = React.useCallback((open: boolean) => {
    setActiveHeaderMenu((prev) => (open ? "mobile" : prev === "mobile" ? null : prev));
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
      if (savedCurrency === "USD" || savedCurrency === "AMD") {
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
      const savedPublished = window.localStorage.getItem(PUBLISHED_KEY);
      // Property listings now live in the API, not localStorage — drop any leftover demo
      // entries under the API's own categories (real-estate, …) and hydrate to [] otherwise.
      const parsed = savedPublished ? (JSON.parse(savedPublished) as Listing[]) : [];
      setPublished(parsed.filter((listing) => !API_DOORS.includes(listing.category)));
    } catch {
      setPublished([]);
    }
    setStorageHydrated(true);
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
    if (!storageHydrated) return;
    try {
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch {
      // Storage can be full or blocked; favourites stay in memory for this session.
    }
  }, [favorites, storageHydrated]);

  React.useEffect(() => {
    if (!storageHydrated) return;
    try {
      window.localStorage.setItem(PUBLISHED_KEY, JSON.stringify(published));
    } catch {
      // Storage can be full or blocked; published listings stay in memory for this session.
    }
    // Note: photos picked in the wizard become blob: object URLs (see step-photos.tsx), which
    // only live for this tab's session — their listing metadata survives a reload just fine,
    // but the photos themselves will 404 until re-uploaded. A real backend would upload the
    // file instead; there isn't one here.
  }, [published, storageHydrated]);

  const toggleFavorite = React.useCallback((id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [id, ...prev]));
  }, []);

  const clearFavorites = React.useCallback(() => setFavorites([]), []);

  const removeFavorites = React.useCallback((ids: string[]) => {
    setFavorites((prev) => prev.filter((id) => !ids.includes(id)));
  }, []);

  const isFavorite = React.useCallback((id: string) => favorites.includes(id), [favorites]);

  const publishListing = React.useCallback((listing: Listing) => {
    setPublished((prev) => [listing, ...prev]);
  }, []);

  const updateListing = React.useCallback((id: string, listing: Listing) => {
    setPublished((prev) => prev.map((item) => (item.id === id ? listing : item)));
  }, []);

  const deleteListing = React.useCallback((id: string) => {
    setPublished((prev) => prev.filter((item) => item.id !== id));
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

  const createHref = hydrated && user ? "/create" : "/sign-in";

  const value = React.useMemo<AppState>(
    () => ({
      favorites,
      isFavorite,
      toggleFavorite,
      clearFavorites,
      removeFavorites,
      published,
      publishListing,
      updateListing,
      deleteListing,
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
      mobileMenuOpen,
      setMobileMenuOpen,
      recentSearches,
      addRecentSearch,
      clearRecentSearches,
      user,
      profile,
      getToken,
      signIn,
      signUp,
      signOut,
      saveProfile,
      changeEmail,
      changePassword,
      setNewPassword,
      requestPasswordReset,
      createHref,
    }),
    [
      favorites,
      isFavorite,
      toggleFavorite,
      clearFavorites,
      removeFavorites,
      published,
      publishListing,
      updateListing,
      deleteListing,
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
      mobileMenuOpen,
      setMobileMenuOpen,
      recentSearches,
      addRecentSearch,
      clearRecentSearches,
      user,
      profile,
      getToken,
      signIn,
      signUp,
      signOut,
      saveProfile,
      changeEmail,
      changePassword,
      setNewPassword,
      requestPasswordReset,
      createHref,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const context = React.useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside <AppProvider>");
  return context;
}

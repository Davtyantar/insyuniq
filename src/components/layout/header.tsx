"use client";

import * as React from "react";
import { Link } from "@/components/i18n/locale-link";
import { usePathname } from "next/navigation";
import { Heart, Menu, Plus, User, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CategoriesMenu } from "@/components/layout/categories-menu";
import { LanguagePicker } from "@/components/layout/language-picker";
import { LocationPicker } from "@/components/layout/location-picker";
import { Logo } from "@/components/layout/logo";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { useApp, type AuthUser } from "@/components/providers/app-provider";
import { SearchBar } from "@/components/search/search-bar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AttentionRing } from "@/components/ui/attention-ring";
import { Button } from "@/components/ui/button";
import { CATEGORY_LIST } from "@/lib/categories";
import { stripLocalePrefix } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function CountBadge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground">
      {count > 99 ? "99+" : count}
    </span>
  );
}

/** The header's profile glyph: the signed-in user's own avatar once we have one, the generic
 * icon otherwise — so "who am I logged in as" is visible at a glance, not just a name label. */
function ProfileGlyph({ user, className }: { user: AuthUser | null; className?: string }) {
  if (!user) return <User className={className} />;
  return (
    <Avatar className={cn(className, "ring-[1.5px] ring-accent ring-offset-1 ring-offset-background")}>
      {user.avatar && <AvatarImage src={user.avatar} alt="" />}
      <AvatarFallback className="text-[10px] font-semibold">
        {user.name.slice(0, 1).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

// Key for the trailing "all listings" link in the category nav's floating indicator.
const NAV_ALL_KEY = "all";

export function Header() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const localPathname = stripLocalePrefix(pathname);
  const { favorites, hydrated, searchOpen, categoriesMenuOpen, mobileMenuOpen, setMobileMenuOpen, user, createHref } =
    useApp();
  const favoritesCount = hydrated ? favorites.length : 0;
  const signedIn = hydrated && !!user;
  const profileLabel = signedIn ? user.name.split(" ")[0] : t("common.signIn");
  // Send signed-out visitors straight to the sign-in form instead of through
  // /profile — that page immediately redirects to /sign-in itself, and the
  // extra hop flashes the profile page's chrome before the auth page's lack
  // of it, a visible jump. Going straight there skips that entirely.
  const profileHref = signedIn ? "/profile" : "/sign-in";
  const mobileMenuTriggerRef = React.useRef<HTMLButtonElement>(null);
  const publishRef = React.useRef<HTMLDivElement>(null);
  // The home page already lists every category as tiles, so the nav row would repeat it.
  const showCategoryNav = localPathname !== "/";
  // Both the search field and the categories menu spotlight the top bar the same way.
  const spotlight = searchOpen || categoriesMenuOpen || mobileMenuOpen;

  // Closing the panel on every route change covers back/forward navigation too —
  // clicking a link inside it already closes it directly.
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, setMobileMenuOpen]);

  const activeCategory = CATEGORY_LIST.find((category) => localPathname.startsWith(category.href));
  const activeNavKey = activeCategory?.slug ?? (localPathname === "/search" ? NAV_ALL_KEY : undefined);

  const navRefs = React.useRef<Map<string, HTMLAnchorElement>>(new Map());
  const [navIndicator, setNavIndicator] = React.useState<{ left: number; width: number } | null>(null);
  const [navIndicatorReady, setNavIndicatorReady] = React.useState(false);

  const updateNavIndicator = React.useCallback(() => {
    const el = activeNavKey ? navRefs.current.get(activeNavKey) : undefined;
    setNavIndicator(el ? { left: el.offsetLeft, width: el.offsetWidth } : null);
  }, [activeNavKey]);

  // Glides the underline to the active tab instead of snapping — measured post-layout so it
  // never flashes at the wrong spot before the first paint.
  React.useLayoutEffect(() => {
    updateNavIndicator();
  }, [updateNavIndicator]);

  React.useEffect(() => {
    const id = requestAnimationFrame(() => setNavIndicatorReady(true));
    window.addEventListener("resize", updateNavIndicator);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", updateNavIndicator);
    };
  }, [updateNavIndicator]);

  return (
    <header className="sticky top-0 z-40 border-b border-border">
      <div
        // `relative z-10` (not just while spotlighting): this wrapper's own `backdrop-blur`
        // already forces a stacking context regardless of z-index, so without an explicit one
        // here, the category-nav row below (also `position: relative`) — being later in DOM
        // order — would paint over it, burying the location/language dropdown panels.
        className="relative z-10 w-full bg-card"
      >
        {/* Desktop/tablet: everything lives in one row. */}
        <div className="container hidden h-16 items-center gap-2 md:flex lg:gap-4">
          <Logo />
          <CategoriesMenu />

          <div className="min-w-0 flex-1">
            <SearchBar />
          </div>

          <LocationPicker />
          <LanguagePicker />

          {/* Phones reach these from the bottom navigation, so the header keeps only search. */}
          <nav className="hidden items-center gap-0.5 md:flex">
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link href="/favorites" title={t("common.favorites")} aria-label={t("common.favorites")}>
                <Heart className="h-5 w-5" />
                <CountBadge count={favoritesCount} />
              </Link>
            </Button>
            <ThemeToggle />
            {signedIn ? (
              <UserMenu user={user} endRef={publishRef}>
                <Button variant="ghost" size="icon" title={profileLabel} aria-label={profileLabel}>
                  <ProfileGlyph user={user} className="h-6 w-6" />
                </Button>
              </UserMenu>
            ) : (
              <Button variant="ghost" size="icon" asChild className="relative">
                <Link href={profileHref} title={profileLabel} aria-label={profileLabel}>
                  <ProfileGlyph user={null} className="h-6 w-6" />
                </Link>
              </Button>
            )}
          </nav>

          <div ref={publishRef} className="shrink-0">
            <AttentionRing>
              <Button variant="accent" asChild className="gap-2">
                <Link href={createHref} title={t("common.publishListing")}>
                  <Plus className="h-[18px] w-[18px]" />
                  <span className="hidden sm:inline">{t("common.publishListing")}</span>
                </Link>
              </Button>
            </AttentionRing>
          </div>
        </div>

        {/* Phone: logo + favorites/theme/profile up top, burger + search underneath. */}
        <div className="container relative flex flex-col gap-2 py-2.5 md:hidden">
          <div className="flex items-center justify-between gap-2">
            <Logo compact />
            <div className="flex shrink-0 items-center gap-1.5">
              <Button variant="ghost" size="icon" asChild className="relative">
                <Link href="/favorites" title={t("common.favorites")} aria-label={t("common.favorites")}>
                  <Heart className="h-5 w-5" />
                  <CountBadge count={favoritesCount} />
                </Link>
              </Button>
              <ThemeToggle />
              {signedIn ? (
                <UserMenu user={user}>
                  <Button variant="secondary" size="sm" className="gap-1.5 rounded-full px-3.5">
                    <ProfileGlyph user={user} className="h-5 w-5" />
                    {profileLabel}
                  </Button>
                </UserMenu>
              ) : (
                <Button variant="accent" size="sm" asChild className="gap-1.5 rounded-full px-3.5">
                  <Link href={profileHref}>
                    <ProfileGlyph user={null} className="h-5 w-5" />
                    {profileLabel}
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              ref={mobileMenuTriggerRef}
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? t("common.close") : t("common.menu")}
              aria-expanded={mobileMenuOpen}
              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors hover:bg-accent/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Menu
                className={cn(
                  "absolute h-5 w-5 transition-all duration-200",
                  mobileMenuOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100",
                )}
              />
              <X
                className={cn(
                  "absolute h-5 w-5 transition-all duration-200",
                  mobileMenuOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0",
                )}
              />
            </button>
            <LocationPicker compact />
            <div className="min-w-0 flex-1">
              <SearchBar mobile />
            </div>
          </div>

          <MobileMenu
            open={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
            triggerRef={mobileMenuTriggerRef}
          />
        </div>
      </div>

      {/* Hidden outright (no fade/transition) the instant search/menu spotlight is on,
          and back the instant it's off — an instant snap, not a dim-and-fade. */}
      {showCategoryNav && !spotlight && (
      <div className="relative w-full bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/75">
        <div className="container relative hidden h-11 items-center gap-6 text-sm md:flex">
          {navIndicator && (
            <div
              aria-hidden
              className="absolute bottom-0 h-0.5 rounded-full bg-accent"
              style={{
                left: navIndicator.left,
                width: navIndicator.width,
                transition: navIndicatorReady
                  ? "left 280ms cubic-bezier(0.22, 1, 0.36, 1), width 280ms cubic-bezier(0.22, 1, 0.36, 1)"
                  : undefined,
              }}
            />
          )}
          {CATEGORY_LIST.map((category) => (
            <Link
              key={category.slug}
              href={category.href}
              ref={(el) => {
                if (el) navRefs.current.set(category.slug, el);
                else navRefs.current.delete(category.slug);
              }}
              className={cn(
                "flex items-center gap-2 py-2.5 font-medium transition-colors",
                activeNavKey === category.slug
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <category.icon className="h-4 w-4" />
              {category.label}
            </Link>
          ))}
          <Link
            href="/search"
            ref={(el) => {
              if (el) navRefs.current.set(NAV_ALL_KEY, el);
              else navRefs.current.delete(NAV_ALL_KEY);
            }}
            className={cn(
              "py-2.5 font-medium transition-colors",
              activeNavKey === NAV_ALL_KEY
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t("common.allListings")}
          </Link>
        </div>
      </div>
      )}
    </header>
  );
}

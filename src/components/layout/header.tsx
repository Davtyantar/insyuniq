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
import { useApp } from "@/components/providers/app-provider";
import { SearchBar } from "@/components/search/search-bar";
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

// Key for the trailing "all listings" link in the category nav's floating indicator.
const NAV_ALL_KEY = "all";

export function Header() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const localPathname = stripLocalePrefix(pathname);
  const { favorites, hydrated, searchOpen, categoriesMenuOpen, mobileMenuOpen, setMobileMenuOpen, user } =
    useApp();
  const favoritesCount = hydrated ? favorites.length : 0;
  const profileLabel = hydrated && user ? user.name.split(" ")[0] : t("common.signIn");
  const actions = [
    { href: "/favorites", label: t("common.favorites"), icon: Heart, badge: "favorites" as const },
    { href: "/profile", label: profileLabel, icon: User, badge: null },
  ];
  const mobileMenuTriggerRef = React.useRef<HTMLButtonElement>(null);
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
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors duration-200",
        spotlight ? "border-transparent" : "border-border",
      )}
    >
      <div
        className={cn(
          // `relative z-10` is unconditional (not just while spotlighting): this wrapper's own
          // `backdrop-blur` already forces a stacking context regardless of z-index, so without an
          // explicit one here, the category-nav row below (also `position: relative`) — being later
          // in DOM order — would paint over it, burying the location/language dropdown panels.
          "relative z-10 w-full backdrop-blur transition-shadow duration-200",
          spotlight
            ? "bg-card shadow-lg"
            : "bg-card/90 supports-[backdrop-filter]:bg-card/75",
        )}
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
            {actions.map((action) => (
              <Button key={action.href} variant="ghost" size="icon" asChild className="relative">
                <Link href={action.href} title={action.label} aria-label={action.label}>
                  <action.icon className="h-5 w-5" />
                  <CountBadge count={action.badge === "favorites" ? favoritesCount : 0} />
                </Link>
              </Button>
            ))}
            <ThemeToggle />
          </nav>

          <Button variant="accent" asChild className="shrink-0 gap-2">
            <Link href="/create" title={t("common.publishListing")}>
              <Plus className="h-[18px] w-[18px]" />
              <span className="hidden sm:inline">{t("common.publishListing")}</span>
            </Link>
          </Button>
        </div>

        {/* Phone: logo + theme + profile up top, burger + search underneath. */}
        <div className="container relative flex flex-col gap-2 py-2.5 md:hidden">
          <div className="flex items-center justify-between gap-2">
            <Logo compact />
            <div className="flex shrink-0 items-center gap-1.5">
              <ThemeToggle />
              <Button
                variant={hydrated && user ? "secondary" : "accent"}
                size="sm"
                asChild
                className="gap-1.5 rounded-full px-3.5"
              >
                <Link href="/profile">
                  <User className="h-4 w-4" />
                  {profileLabel}
                </Link>
              </Button>
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
              <SearchBar />
            </div>
          </div>

          <MobileMenu
            open={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
            triggerRef={mobileMenuTriggerRef}
          />
        </div>
      </div>

      {showCategoryNav && (
      <div
        className={cn(
          "relative w-full border-t bg-card/90 backdrop-blur transition-colors duration-200 supports-[backdrop-filter]:bg-card/75",
          spotlight ? "border-transparent" : "border-border/70",
        )}
      >
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

        {spotlight && (
          <div
            aria-hidden
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] transition-opacity duration-200"
          />
        )}
      </div>
      )}
    </header>
  );
}

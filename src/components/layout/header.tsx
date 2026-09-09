"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Plus, User } from "lucide-react";
import { LanguagePicker } from "@/components/layout/language-picker";
import { LocationPicker } from "@/components/layout/location-picker";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useApp } from "@/components/providers/app-provider";
import { SearchBar } from "@/components/search/search-bar";
import { Button } from "@/components/ui/button";
import { CATEGORY_LIST } from "@/lib/categories";
import { cn } from "@/lib/utils";

const ACTIONS = [
  { href: "/favorites", label: "Հավանածներ", icon: Heart, badge: "favorites" as const },
  { href: "/profile", label: "Մուտք", icon: User, badge: null },
];

function CountBadge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function Header() {
  const pathname = usePathname();
  const { favorites, hydrated } = useApp();
  const favoritesCount = hydrated ? favorites.length : 0;
  // The home page already lists every category as tiles, so the nav row would repeat it.
  const showCategoryNav = pathname !== "/";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/75">
      <div className="container flex h-16 items-center gap-2 lg:gap-4">
        <Logo />

        <div className="min-w-0 flex-1">
          <SearchBar />
        </div>

        <LocationPicker />
        <LanguagePicker />

        {/* Phones reach these from the bottom navigation, so the header keeps only search. */}
        <nav className="hidden items-center gap-0.5 md:flex">
          {ACTIONS.map((action) => (
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
          <Link href="/create" title="Հրապարակել հայտարարություն">
            <Plus className="h-[18px] w-[18px]" />
            <span className="hidden sm:inline">Հրապարակել հայտարարություն</span>
          </Link>
        </Button>
      </div>

      {showCategoryNav && (
      <div className="container hidden h-11 items-center gap-6 border-t border-border/70 text-sm md:flex">
        {CATEGORY_LIST.map((category) => {
          const active = pathname.startsWith(category.href);
          return (
            <Link
              key={category.slug}
              href={category.href}
              className={cn(
                "-mb-px flex items-center gap-2 border-b-2 py-2.5 font-medium transition-colors",
                active
                  ? "border-accent text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <category.icon className="h-4 w-4" />
              {category.label}
            </Link>
          );
        })}
        <Link
          href="/search"
          className="py-2.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          Բոլոր հայտարարությունները
        </Link>
      </div>
      )}
    </header>
  );
}

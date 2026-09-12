"use client";

import * as React from "react";
import { Check, ChevronDown, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useApp } from "@/components/providers/app-provider";
import { CITY_SLUG } from "@/lib/cities";
import { cn } from "@/lib/utils";
import { CITIES } from "@/mock/taxonomy";

/** City picker next to the header search — persists the choice to localStorage.
 * `compact` swaps the icon+label+chevron trigger for a bare icon button, for tight
 * spots like the phone header's burger/search row.
 *
 * Hand-rolled instead of Radix's DropdownMenu: that component renders its content through a
 * Portal positioned via Popper, and in this app's header (sticky + backdrop-blur) that combo
 * was ending up unclickable/invisible. A plain absolutely-positioned panel anchored to this
 * component's own wrapper sidesteps the whole Portal/Popper pipeline.
 *
 * Open state is local (not the shared header-menu context): the header mounts both a desktop
 * and a compact mobile instance of this component at once (CSS just hides whichever doesn't
 * apply), and sharing one "open" flag between two separate DOM subtrees meant each instance's
 * outside-click check saw the *other* instance's panel as "outside" and closed it on every
 * mousedown — which fired before the click on a city button did, so selecting one never landed. */
export function LocationPicker({ compact }: { compact?: boolean }) {
  const { t } = useTranslation();
  const placeholder = t("common.selectCity");
  const {
    city,
    setCity,
    hydrated,
    searchOpen,
    categoriesMenuOpen,
    languageMenuOpen,
    mobileMenuOpen,
    setSearchOpen,
    setCategoriesMenuOpen,
    setLanguageMenuOpen,
    setMobileMenuOpen,
  } = useApp();
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const cityLabel = city ? t(`cities.${CITY_SLUG[city]}.name`) : undefined;
  const label = hydrated ? cityLabel ?? placeholder : placeholder;

  const rootRef = React.useRef<HTMLDivElement>(null);

  // Mount immediately on open, but unmount only after the exit transition finishes, so
  // closing animates instead of the panel just vanishing.
  React.useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
    const timeout = window.setTimeout(() => setMounted(false), 180);
    return () => window.clearTimeout(timeout);
  }, [open]);

  function openMenu() {
    // Mirrors the "only one header dropdown open at a time" rule the other menus share —
    // this one just can't join that shared boolean itself (see the note above).
    setSearchOpen(false);
    setCategoriesMenuOpen(false);
    setLanguageMenuOpen(false);
    setMobileMenuOpen(false);
    setOpen(true);
  }

  // Any other header dropdown opening should close this one.
  React.useEffect(() => {
    if (searchOpen || categoriesMenuOpen || languageMenuOpen || mobileMenuOpen) setOpen(false);
  }, [searchOpen, categoriesMenuOpen, languageMenuOpen, mobileMenuOpen]);

  // Closes on outside click/tap and on Escape — same model as the mobile burger panel.
  React.useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, setOpen]);

  // Closing on a real scroll (not the few px a tap itself can cause on mobile) mirrors the
  // old Radix-based behavior of never locking page scroll while this is open.
  React.useEffect(() => {
    if (!open) return;
    const startY = window.scrollY;
    function handleScroll() {
      if (Math.abs(window.scrollY - startY) > 4) setOpen(false);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [open, setOpen]);

  function selectCity(value: string) {
    setCity(value);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      {compact ? (
        <button
          type="button"
          onClick={() => (open ? setOpen(false) : openMenu())}
          title={label}
          aria-label={label}
          aria-expanded={open}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <MapPin className="h-[18px] w-[18px] text-accent" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => (open ? setOpen(false) : openMenu())}
          aria-expanded={open}
          className="hidden shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:flex"
          title={placeholder}
        >
          <MapPin className="h-4 w-4 shrink-0 text-accent" />
          <span className="max-w-[8rem] truncate">{label}</span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </button>
      )}

      {mounted && (
        <div
          className={cn(
            "absolute left-0 top-[calc(100%+6px)] z-50 max-h-[60vh] w-52 origin-top overflow-y-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-pop transition-all duration-150 ease-out",
            visible ? "translate-y-0 scale-100 opacity-100" : "-translate-y-1 scale-95 opacity-0",
          )}
        >
          {CITIES.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => selectCity(option.value)}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-secondary",
                city === option.value ? "font-medium text-accent" : "text-foreground",
              )}
            >
              {t(`cities.${CITY_SLUG[option.value]}.name`)}
              {city === option.value && <Check className="h-4 w-4 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

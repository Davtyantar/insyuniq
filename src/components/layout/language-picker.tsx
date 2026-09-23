"use client";

import * as React from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FlagIcon } from "@/components/layout/flag-icon";
import { useApp } from "@/components/providers/app-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { CURRENCY_OPTIONS, DISPLAY_CURRENCIES, currencyOption } from "@/lib/currency";
import { LOCALE_OPTIONS } from "@/lib/i18n";

type Tab = "language" | "currency";

interface LanguagePickerProps {
  /** "header" is the desktop top-bar trigger (hidden below `sm`); "bottomNav" is a full-width
   * stacked icon+label trigger matching the phone bottom nav's other items, opening upward. */
  variant?: "header" | "bottomNav";
}

/** Combined language + currency switcher — persists both choices to localStorage.
 *
 * Hand-rolled instead of Radix's DropdownMenu: same reason as LocationPicker (see its comment) —
 * that component's Portal+Popper combo ends up unclickable/invisible inside this app's sticky,
 * backdrop-blurred header and bottom nav. A plain absolutely-positioned panel anchored to this
 * component's own wrapper sidesteps that.
 *
 * Open state is local (not the shared header-menu context) for the same reason as LocationPicker:
 * the header mounts a desktop instance and the bottom nav mounts a phone instance at once (CSS
 * just hides whichever doesn't apply), and sharing one "open" flag between two separate DOM
 * subtrees would open both panels — one anchored to the other's hidden, zero-size trigger. */
export function LanguagePicker({ variant = "header" }: LanguagePickerProps) {
  const { t } = useTranslation();
  const {
    locale,
    setLocale,
    currency,
    setCurrency,
    searchOpen,
    categoriesMenuOpen,
    locationMenuOpen,
    mobileMenuOpen,
    setSearchOpen,
    setCategoriesMenuOpen,
    setLocationMenuOpen,
    setLanguageMenuOpen,
    setMobileMenuOpen,
  } = useApp();
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const [tab, setTab] = React.useState<Tab>("language");
  const localeLabel = LOCALE_OPTIONS.find((option) => option.value === locale)?.label ?? locale;
  const activeCurrency = currencyOption(currency);

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
    // Mirrors the "only one header dropdown open at a time" rule the other menus share.
    setSearchOpen(false);
    setCategoriesMenuOpen(false);
    setLocationMenuOpen(false);
    setMobileMenuOpen(false);
    setLanguageMenuOpen(true);
    setTab("language");
    setOpen(true);
  }

  function closeMenu() {
    setLanguageMenuOpen(false);
    setOpen(false);
  }

  // Any other header dropdown opening should close this one.
  React.useEffect(() => {
    if (searchOpen || categoriesMenuOpen || locationMenuOpen || mobileMenuOpen) setOpen(false);
  }, [searchOpen, categoriesMenuOpen, locationMenuOpen, mobileMenuOpen]);

  // Closes on outside click/tap and on Escape — same model as the mobile burger panel.
  React.useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) closeMenu();
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeMenu();
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Closing on a real scroll (not the few px a tap itself can cause on mobile) mirrors the
  // old Radix-based behavior of never locking page scroll while this is open.
  React.useEffect(() => {
    if (!open) return;
    const startY = window.scrollY;
    function handleScroll() {
      if (Math.abs(window.scrollY - startY) > 4) closeMenu();
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function selectLocale(value: (typeof LOCALE_OPTIONS)[number]["value"]) {
    setLocale(value);
    closeMenu();
  }

  function selectCurrency(value: (typeof CURRENCY_OPTIONS)[number]["value"]) {
    setCurrency(value);
    closeMenu();
  }

  return (
    <div ref={rootRef} className="relative">
      {variant === "bottomNav" ? (
        <button
          type="button"
          onClick={() => (open ? closeMenu() : openMenu())}
          aria-label={t("common.languageAndCurrency")}
          aria-expanded={open}
          className={cn(
            "flex h-14 w-full flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors",
            open ? "text-accent" : "text-muted-foreground",
          )}
        >
          <FlagIcon locale={locale} className="h-5 w-7" />
          {activeCurrency.value}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => (open ? closeMenu() : openMenu())}
          aria-expanded={open}
          className="hidden shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary sm:flex"
          title={t("common.languageAndCurrency")}
        >
          <FlagIcon locale={locale} />
          <span className="font-semibold">{activeCurrency.symbol}</span>
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
            "absolute z-50 w-[280px] overflow-hidden rounded-lg border border-border bg-popover p-0 text-popover-foreground shadow-pop transition-all duration-150 ease-out",
            variant === "bottomNav" ? "bottom-[calc(100%+10px)] left-1/2" : "right-0 top-[calc(100%+6px)]",
            variant === "bottomNav" && "-translate-x-1/2",
            visible
              ? "scale-100 opacity-100"
              : cn("scale-95 opacity-0", variant === "bottomNav" ? "translate-y-1" : "-translate-y-1"),
          )}
        >
          <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)}>
            <TabsList className="flex w-full gap-2 rounded-none border-0 border-b border-border bg-transparent p-3">
              <TabsTrigger
                value="language"
                className="flex flex-1 items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
              >
                <FlagIcon locale={locale} />
                <span className="truncate">{localeLabel}</span>
                {tab === "language" ? (
                  <ChevronUp className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                )}
              </TabsTrigger>
              <TabsTrigger
                value="currency"
                className="flex flex-1 items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
              >
                <span className="truncate">
                  {activeCurrency.value} ({activeCurrency.symbol})
                </span>
                {tab === "currency" ? (
                  <ChevronUp className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="language" className="max-h-[50vh] overflow-y-auto p-1.5">
              {LOCALE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => selectLocale(option.value)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-secondary",
                    option.value === locale && "bg-secondary/70 font-medium",
                  )}
                >
                  <FlagIcon locale={option.value} />
                  <span className="flex-1 text-left">{option.label}</span>
                  {option.value === locale && <Check className="h-4 w-4 text-accent" />}
                </button>
              ))}
            </TabsContent>

            <TabsContent value="currency" className="max-h-[50vh] overflow-y-auto p-1.5">
              {DISPLAY_CURRENCIES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => selectCurrency(option.value)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-secondary",
                    option.value === currency && "bg-secondary/70 font-medium",
                  )}
                >
                  <span className="flex-1 text-left">
                    {option.value} ({option.symbol})
                  </span>
                  {option.value === currency && <Check className="h-4 w-4 text-accent" />}
                </button>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}

"use client";

import * as React from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { FlagIcon } from "@/components/layout/flag-icon";
import { useApp } from "@/components/providers/app-provider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { CURRENCY_OPTIONS, currencyOption } from "@/lib/currency";
import { LOCALE_OPTIONS } from "@/lib/i18n";

type Tab = "language" | "currency";

/** Combined language + currency switcher — persists both choices to localStorage. */
export function LanguagePicker() {
  const { locale, setLocale, currency, setCurrency } = useApp();
  const [open, setOpen] = React.useState(false);
  const [tab, setTab] = React.useState<Tab>("language");
  const localeLabel = LOCALE_OPTIONS.find((option) => option.value === locale)?.label ?? locale;
  const activeCurrency = currencyOption(currency);

  // Radix's default "modal" behavior locks page scroll while open — this menu should stay
  // over a normally-scrollable page, closing itself the moment the user scrolls instead.
  React.useEffect(() => {
    if (!open) return;
    function close() {
      setOpen(false);
    }
    window.addEventListener("scroll", close, { passive: true, capture: true });
    return () => window.removeEventListener("scroll", close, { capture: true });
  }, [open]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) setTab("language");
  }

  function selectLocale(value: (typeof LOCALE_OPTIONS)[number]["value"]) {
    setLocale(value);
    setOpen(false);
  }

  function selectCurrency(value: (typeof CURRENCY_OPTIONS)[number]["value"]) {
    setCurrency(value);
    setOpen(false);
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange} modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="hidden shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary sm:flex"
          title="Լեզու և արժույթ"
        >
          <FlagIcon locale={locale} />
          <span className="font-semibold">{activeCurrency.symbol}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px] p-0">
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

          <TabsContent value="language" className="p-1.5">
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

          <TabsContent value="currency" className="p-1.5">
            {CURRENCY_OPTIONS.map((option) => (
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

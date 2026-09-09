"use client";

import { ChevronDown } from "lucide-react";
import { FlagIcon } from "@/components/layout/flag-icon";
import { useApp } from "@/components/providers/app-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LOCALE_OPTIONS, type Locale } from "@/lib/i18n";

/** Language switcher with flags — persists the choice to localStorage. Site copy is hardcoded Armenian. */
export function LanguagePicker() {
  const { locale, setLocale } = useApp();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="hidden shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary sm:flex"
          title="Լեզու"
        >
          <FlagIcon locale={locale} />
          <span className="uppercase tracking-wide">{locale}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={locale} onValueChange={(value) => setLocale(value as Locale)}>
          {LOCALE_OPTIONS.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value} className="gap-2.5">
              <FlagIcon locale={option.value} />
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

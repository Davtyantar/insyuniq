"use client";

import * as React from "react";
import { ChevronDown, MapPin } from "lucide-react";
import { useApp } from "@/components/providers/app-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { CITIES } from "@/mock/taxonomy";

const PLACEHOLDER = "Ընտրել քաղաքը";

/** City picker next to the header search — persists the choice to localStorage. */
export function LocationPicker() {
  const { city, setCity, hydrated, locationMenuOpen: open, setLocationMenuOpen: setOpen } = useApp();
  const label = hydrated ? city ?? PLACEHOLDER : PLACEHOLDER;

  // Radix's default "modal" behavior locks page scroll while open — this menu should stay
  // over a normally-scrollable page, closing itself the moment the user scrolls instead.
  React.useEffect(() => {
    if (!open) return;
    function close() {
      setOpen(false);
    }
    window.addEventListener("scroll", close, { passive: true, capture: true });
    return () => window.removeEventListener("scroll", close, { capture: true });
  }, [open, setOpen]);

  function selectCity(value: string) {
    setCity(value);
    setOpen(false);
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="hidden shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary sm:flex"
          title={PLACEHOLDER}
        >
          <MapPin className="h-4 w-4 text-accent" />
          <span className="max-w-[8rem] truncate">{label}</span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuRadioGroup value={city ?? ""} onValueChange={selectCity}>
          {CITIES.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

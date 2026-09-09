"use client";

import { ChevronDown, MapPin } from "lucide-react";
import { useApp } from "@/components/providers/app-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CITIES } from "@/mock/taxonomy";

const PLACEHOLDER = "Выбрать город";

/** City picker next to the header search — persists the choice to localStorage. */
export function LocationPicker() {
  const { city, setCity, hydrated } = useApp();
  const label = hydrated ? city ?? PLACEHOLDER : PLACEHOLDER;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="hidden shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary sm:flex"
          title={PLACEHOLDER}
        >
          <MapPin className="h-4 w-4 text-accent" />
          <span className="max-w-[8rem] truncate">{label}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuRadioGroup value={city ?? ""} onValueChange={setCity}>
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

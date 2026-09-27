"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { DISPLAY_CURRENCIES, currencyOption, type Currency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { Option } from "@/mock/taxonomy";

const ANY = "any";

/**
 * When a FilterSection renders inside a SingleOpenAccordion (phone drawer), opening one
 * section closes whichever other one was open — otherwise each section just tracks its
 * own open/closed state independently (desktop sidebar).
 */
const AccordionContext = React.createContext<{
  openTitle: string | null;
  setOpenTitle: React.Dispatch<React.SetStateAction<string | null>>;
} | null>(null);

/** Wrap a mobile drawer's filter fields in this so only one section can be open at a time. */
export function SingleOpenAccordion({ children }: { children: React.ReactNode }) {
  const [openTitle, setOpenTitle] = React.useState<string | null>(null);
  return (
    <AccordionContext.Provider value={{ openTitle, setOpenTitle }}>
      {children}
    </AccordionContext.Provider>
  );
}

export function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const accordion = React.useContext(AccordionContext);
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const open = accordion ? accordion.openTitle === title : internalOpen;

  function toggle() {
    if (accordion) {
      accordion.setOpenTitle((prev) => (prev === title ? null : title));
    } else {
      setInternalOpen((prev) => !prev);
    }
  }

  return (
    <div className="border-b border-border py-4 first:pt-0 last:border-b-0">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 text-left text-sm font-medium"
      >
        {title}
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && <div className="mt-3 space-y-3">{children}</div>}
    </div>
  );
}

export function RangeFields({
  from,
  to,
  onFrom,
  onTo,
  fromPlaceholder = "սկսած",
  toPlaceholder = "մինչև",
  suffix,
}: {
  from: string;
  to: string;
  onFrom: (value: string) => void;
  onTo: (value: string) => void;
  fromPlaceholder?: string;
  toPlaceholder?: string;
  suffix?: string;
}) {
  const digits = (value: string) => value.replace(/[^\d.]/g, "");
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Input
          value={from}
          inputMode="numeric"
          onChange={(e) => onFrom(digits(e.target.value))}
          placeholder={fromPlaceholder}
          className="h-9 pr-8 text-[13px]"
        />
        {suffix && (
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[12px] text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      <span className="text-muted-foreground">—</span>
      <div className="relative flex-1">
        <Input
          value={to}
          inputMode="numeric"
          onChange={(e) => onTo(digits(e.target.value))}
          placeholder={toPlaceholder}
          className="h-9 pr-8 text-[13px]"
        />
        {suffix && (
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[12px] text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

export interface PriceBounds {
  /** Always in USD, regardless of the currently selected display currency — converted below. */
  min: number;
  max: number;
  step: number;
}

/**
 * Price range control shared by every category's filters: small currency-symbol chips (default
 * to whichever currency the filters started with — see `defaultFilters` — but freely
 * switchable), a two-thumb slider, and the from/to number inputs, all kept in sync off the same
 * `from`/`to` strings so dragging the slider updates the inputs and vice versa.
 */
export function PriceRangeField({
  currency,
  onCurrencyChange,
  from,
  to,
  onFrom,
  onTo,
  bounds,
}: {
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  from: string;
  to: string;
  onFrom: (value: string) => void;
  onTo: (value: string) => void;
  bounds: PriceBounds;
}) {
  const digits = (value: string) => value.replace(/[^\d.]/g, "");
  const parsed = (value: string, fallback: number) => {
    const n = Number(value.replace(/\s/g, ""));
    return Number.isFinite(n) && value !== "" ? n : fallback;
  };

  const rate = currencyOption(currency).rate;
  const rangeMin = 0;
  const rangeMax = Math.round(bounds.max * rate);
  const step = Math.max(1, Math.round(bounds.step * rate));

  // Clamp only what the slider itself renders — Radix requires the value to sit inside
  // [min, max] — the actual typed/stored string is left exactly as entered either way.
  const sliderFrom = Math.min(Math.max(parsed(from, rangeMin), rangeMin), rangeMax);
  const sliderTo = Math.min(Math.max(parsed(to, rangeMax), rangeMin), rangeMax);
  const sliderValue: [number, number] =
    sliderFrom <= sliderTo ? [sliderFrom, sliderTo] : [sliderTo, sliderFrom];

  function handleCurrencyChange(next: Currency) {
    if (next === currency) return;
    // Re-express whatever the seller/buyer already typed in the new currency instead of
    // reinterpreting the same digits as a completely different amount.
    const nextRate = currencyOption(next).rate;
    const convert = (value: string) => {
      if (!value) return value;
      const n = Number(value.replace(/\s/g, ""));
      return Number.isFinite(n) ? String(Math.round((n / rate) * nextRate)) : value;
    };
    onFrom(convert(from));
    onTo(convert(to));
    onCurrencyChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5">
        {DISPLAY_CURRENCIES.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleCurrencyChange(option.value)}
            aria-pressed={currency === option.value}
            title={option.value}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md border text-[13px] font-semibold transition-colors",
              currency === option.value
                ? "border-accent bg-accent text-accent-foreground"
                : "border-input bg-card text-foreground hover:bg-secondary",
            )}
          >
            {option.symbol}
          </button>
        ))}
      </div>

      <Slider
        min={rangeMin}
        max={rangeMax}
        step={step}
        value={sliderValue}
        onValueChange={([nextFrom, nextTo]) => {
          onFrom(String(nextFrom));
          onTo(String(nextTo));
        }}
      />

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            value={from}
            inputMode="numeric"
            onChange={(e) => onFrom(digits(e.target.value))}
            placeholder="սկսած"
            className="h-9 pr-8 text-[13px]"
          />
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[12px] text-muted-foreground">
            {currencyOption(currency).symbol}
          </span>
        </div>
        <span className="text-muted-foreground">—</span>
        <div className="relative flex-1">
          <Input
            value={to}
            inputMode="numeric"
            onChange={(e) => onTo(digits(e.target.value))}
            placeholder="մինչև"
            className="h-9 pr-8 text-[13px]"
          />
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[12px] text-muted-foreground">
            {currencyOption(currency).symbol}
          </span>
        </div>
      </div>
    </div>
  );
}

export function SelectField({
  value,
  onChange,
  options,
  placeholder,
  anyLabel = "Ցանկացած",
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  anyLabel?: string;
  disabled?: boolean;
}) {
  return (
    <Select
      value={value || ANY}
      onValueChange={(next) => onChange(next === ANY ? "" : next)}
      disabled={disabled}
    >
      <SelectTrigger className="h-9 text-[13px]" aria-label={placeholder}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ANY}>{anyLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Compact dropdown that lets more than one option be checked at once. */
export function MultiSelectField({
  values,
  onChange,
  options,
  placeholder,
  anyLabel = "Ցանկացած",
}: {
  values: string[];
  onChange: (values: string[]) => void;
  options: Option[];
  placeholder?: string;
  anyLabel?: string;
}) {
  function toggle(value: string) {
    onChange(values.includes(value) ? values.filter((v) => v !== value) : [...values, value]);
  }

  const label =
    values.length === 0
      ? placeholder ?? anyLabel
      : values.length === 1
        ? (options.find((o) => o.value === values[0])?.label ?? values[0])
        : `Ընտրված է ${values.length}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-card px-3 text-[13px] text-foreground transition-colors hover:bg-secondary"
        >
          <span className={cn("truncate", values.length === 0 && "text-muted-foreground")}>
            {label}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="max-h-64 w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto thin-scrollbar"
      >
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={values.includes(option.value)}
            onSelect={(event) => event.preventDefault()}
            onCheckedChange={() => toggle(option.value)}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function CheckboxList({
  options,
  values,
  onChange,
  columns = 1,
}: {
  options: Option[];
  values: string[];
  onChange: (values: string[]) => void;
  columns?: 1 | 2;
}) {
  function toggle(value: string) {
    onChange(values.includes(value) ? values.filter((v) => v !== value) : [...values, value]);
  }
  return (
    <div className={cn("grid gap-2.5", columns === 2 && "grid-cols-2")}>
      {options.map((option) => (
        <label
          key={option.value}
          className="flex cursor-pointer items-center gap-2.5 text-[13px] leading-tight"
        >
          <Checkbox
            checked={values.includes(option.value)}
            onCheckedChange={() => toggle(option.value)}
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}

/** Segmented chips — used for short, mutually exclusive or multi-pick sets. */
export function ChipGroup({
  options,
  values,
  onChange,
  multiple = false,
  fullWidth = false,
}: {
  options: Option[];
  values: string[];
  onChange: (values: string[]) => void;
  multiple?: boolean;
  /** Options share the row equally instead of wrapping at their natural width. */
  fullWidth?: boolean;
}) {
  function toggle(value: string) {
    if (!multiple) {
      onChange(values.includes(value) ? [] : [value]);
      return;
    }
    onChange(values.includes(value) ? values.filter((v) => v !== value) : [...values, value]);
  }
  return (
    <div className={cn("flex gap-1.5", fullWidth ? "flex-nowrap" : "flex-wrap")}>
      {options.map((option) => {
        const active = values.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => toggle(option.value)}
            aria-pressed={active}
            className={cn(
              "h-9 rounded-md border px-3 text-[13px] font-medium transition-colors",
              fullWidth && "flex-1",
              active
                ? "border-accent bg-accent text-accent-foreground"
                : "border-input bg-card text-foreground hover:bg-secondary",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function ToggleRow({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 text-[13px]">
      <Checkbox checked={checked} onCheckedChange={(value) => onChange(value === true)} />
      <span>
        <span className="block leading-tight">{label}</span>
        {hint && <span className="mt-0.5 block text-[12px] text-muted-foreground">{hint}</span>}
      </span>
    </label>
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <Label className="mb-1.5 block">{children}</Label>;
}

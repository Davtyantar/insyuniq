"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Option } from "@/mock/taxonomy";

const ANY = "any";

export function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="border-b border-border py-4 first:pt-0 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
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
  fromPlaceholder = "от",
  toPlaceholder = "до",
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

export function SelectField({
  value,
  onChange,
  options,
  placeholder,
  anyLabel = "Любой",
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
}: {
  options: Option[];
  values: string[];
  onChange: (values: string[]) => void;
  multiple?: boolean;
}) {
  function toggle(value: string) {
    if (!multiple) {
      onChange(values.includes(value) ? [] : [value]);
      return;
    }
    onChange(values.includes(value) ? values.filter((v) => v !== value) : [...values, value]);
  }
  return (
    <div className="flex flex-wrap gap-1.5">
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

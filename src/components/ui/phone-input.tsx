"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const PREFIX = "+374";
const MAX_DIGITS = 8;

/** "77558855" -> "77 55 88 55" (also handles a shorter, still-typing prefix like "775"). */
function groupDigits(digits: string): string {
  return digits.match(/.{1,2}/g)?.join(" ") ?? "";
}

/** Pulls the national-number digits back out of a raw value, dropping a leading "374" if the
 * user pasted a full international number (with or without "+", spaces, dashes, parens). */
function extractDigits(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("374")) digits = digits.slice(3);
  return digits.slice(0, MAX_DIGITS);
}

export interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  /** Full value including the "+374" prefix, e.g. "+374 77 55 88 55" — or "" when empty. */
  value: string;
  onChange: (value: string) => void;
}

/** Phone field with a fixed, non-editable "+374" prefix — the user only ever types/edits the
 * national number, which is auto-grouped in pairs as they go ("77 55 88 55"). Used everywhere
 * the app collects an Armenian phone number, so the format is identical across the whole app. */
export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, className, placeholder = "77 55 88 55", disabled, ...props }, ref) => {
    const formatted = groupDigits(extractDigits(value));

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
      const digits = extractDigits(event.target.value);
      onChange(digits ? `${PREFIX} ${groupDigits(digits)}` : "");
    }

    return (
      <div
        className={cn(
          "flex h-10 w-full items-center gap-1.5 rounded-md border border-input bg-card px-3 text-sm transition-colors focus-within:border-ring",
          disabled && "cursor-not-allowed opacity-50",
          className,
        )}
      >
        <span className="shrink-0 select-none text-muted-foreground">{PREFIX}</span>
        <input
          ref={ref}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={formatted}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
          {...props}
        />
      </div>
    );
  },
);
PhoneInput.displayName = "PhoneInput";

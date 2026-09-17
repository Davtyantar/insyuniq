"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const PREFIX = "+374";
const MAX_DIGITS = 8;
/** As long as the value only contains phone-shaped characters, show the "+374" masked field —
 * the moment a letter, "@", or "." shows up it's clearly an email instead. */
const PHONE_SHAPED = /^[+\d\s-]*$/;

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

export interface PhoneOrEmailInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  /** Either "+374 77 55 88 55" (phone) or the raw typed text (email) — or "" when empty. */
  value: string;
  onChange: (value: string) => void;
  emailPlaceholder?: string;
}

/**
 * Login field that accepts a phone number or an email: it looks and behaves exactly like
 * `PhoneInput` (fixed "+374" chip, auto-grouped digits) as long as what's typed still looks like
 * a phone number, then quietly drops the prefix and becomes a plain text field the instant the
 * user types something that isn't — a letter, "@", a dot — so email addresses still work.
 */
export const PhoneOrEmailInput = React.forwardRef<HTMLInputElement, PhoneOrEmailInputProps>(
  (
    { value, onChange, className, placeholder = "77 55 88 55", emailPlaceholder = "you@example.com", disabled, ...props },
    ref,
  ) => {
    const isPhoneLike = PHONE_SHAPED.test(value);

    if (!isPhoneLike) {
      return (
        <input
          ref={ref}
          type="text"
          inputMode="email"
          autoComplete="username"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={emailPlaceholder}
          disabled={disabled}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          {...props}
        />
      );
    }

    const formatted = groupDigits(extractDigits(value));

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
      const raw = event.target.value;
      // The moment it stops looking like a phone number (a letter, "@", …), hand the raw text
      // straight through so email entry isn't fighting the digit-only formatting below.
      if (!PHONE_SHAPED.test(raw)) {
        onChange(raw);
        return;
      }
      const digits = extractDigits(raw);
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
          type="text"
          inputMode="tel"
          autoComplete="username"
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
PhoneOrEmailInput.displayName = "PhoneOrEmailInput";

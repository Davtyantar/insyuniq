"use client";

import { useApp } from "@/components/providers/app-provider";
import type { Currency } from "@/lib/currency";
import { formatPrice } from "@/lib/format";

interface PriceTagProps {
  price: number;
  perMonth?: boolean;
  perDay?: boolean;
  className?: string;
  /** Exact seller-entered price per currency, if any — see `formatPrice`. */
  prices?: Partial<Record<Currency, number>>;
}

/** Renders a listing price in the user's selected currency — needs the client-only app context. */
export function PriceTag({ price, perMonth, perDay, className, prices }: PriceTagProps) {
  const { currency } = useApp();
  const period = perDay ? "օր" : perMonth ? "ամիս" : "";
  return (
    <p className={className}>
      {formatPrice(price, { currency, prices })}
      {period && <span className="ml-1 text-[13px] font-normal text-accent">{period}</span>}
    </p>
  );
}

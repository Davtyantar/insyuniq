"use client";

import { useApp } from "@/components/providers/app-provider";
import { formatPrice } from "@/lib/format";

interface PriceTagProps {
  price: number;
  perMonth?: boolean;
  perDay?: boolean;
  className?: string;
}

/** Renders a listing price in the user's selected currency — needs the client-only app context. */
export function PriceTag({ price, perMonth, perDay, className }: PriceTagProps) {
  const { currency } = useApp();
  const period = perDay ? "օր" : perMonth ? "ամիս" : "";
  return (
    <p className={className}>
      {formatPrice(price, { currency })}
      {period && <span className="ml-1 text-[13px] font-normal text-accent">{period}</span>}
    </p>
  );
}

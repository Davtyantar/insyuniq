"use client";

import { useApp } from "@/components/providers/app-provider";
import type { Money } from "@/lib/api/types";
import { formatAmount, periodLabel, toDisplayCurrency } from "@/lib/money";

/** Renders a price in the viewer's display currency — needs the client-only app context. */
export function PriceTag({ money, className }: { money: Money; className?: string }) {
  const { currency } = useApp();
  const period = money.amount !== null ? periodLabel(money.period) : "";
  return (
    <p className={className}>
      {formatAmount(money, toDisplayCurrency(currency))}
      {period && <span className="ml-1 text-[13px] font-normal text-accent">{period}</span>}
    </p>
  );
}

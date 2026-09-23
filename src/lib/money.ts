import type { Currency, Money, PricePeriod } from "@/lib/api/types";
import { currencyOption } from "@/lib/currency";
import { groupDigits } from "@/lib/format";

/** Illustrative display rate, the same one `CURRENCY_OPTIONS` uses. Not a quote. */
export const AMD_PER_USD = 400;

export const NEGOTIABLE_LABEL = "Պայմանագրային";

const PERIOD_LABEL: Record<PricePeriod, string> = { total: "", month: "ամիս", night: "գիշեր", hour: "ժամ" };

/** The viewer's stored preference may be a legacy EUR or RUB; the contract knows USD and AMD. */
export function toDisplayCurrency(value: string): Currency {
  return value === "AMD" ? "AMD" : "USD";
}

export function convertAmount(amount: number, from: Currency, to: Currency): number {
  if (from === to) return amount;
  return from === "USD" ? amount * AMD_PER_USD : amount / AMD_PER_USD;
}

export function periodLabel(period: PricePeriod): string {
  return PERIOD_LABEL[period];
}

/** Amount with its currency symbol, without the period. */
export function formatAmount(money: Money, display: Currency): string {
  if (money.amount === null) return NEGOTIABLE_LABEL;
  const value = groupDigits(convertAmount(money.amount, money.currency, display));
  const { symbol, suffix } = currencyOption(display);
  return suffix ? `${value} ${symbol}` : `${symbol} ${value}`;
}

/** Amount plus "/ամիս", "/գիշեր" or "/ժամ" when the price is periodic. */
export function formatMoney(money: Money, display: Currency): string {
  const period = periodLabel(money.period);
  if (money.amount === null || !period) return formatAmount(money, display);
  return `${formatAmount(money, display)}/${period}`;
}

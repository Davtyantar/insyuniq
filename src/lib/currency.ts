export type Currency = "USD" | "AMD" | "EUR" | "RUB";

interface CurrencyOption {
  value: Currency;
  symbol: string;
  /** Illustrative fixed rate: units of this currency per 1 USD (listing prices are stored in USD). */
  rate: number;
  /** Dram is conventionally written after the number ("50 000 ֏") instead of before it. */
  suffix?: boolean;
}

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { value: "USD", symbol: "$", rate: 1 },
  { value: "AMD", symbol: "֏", rate: 400, suffix: true },
  { value: "EUR", symbol: "€", rate: 0.92 },
  { value: "RUB", symbol: "₽", rate: 90 },
];

export function currencyOption(value: Currency): CurrencyOption {
  return CURRENCY_OPTIONS.find((option) => option.value === value) ?? CURRENCY_OPTIONS[0];
}

import { describe, expect, it } from "vitest";
import type { Money } from "@/lib/api/types";
import { groupDigits } from "@/lib/format";
import { NEGOTIABLE_LABEL, convertAmount, formatAmount, formatMoney, toDisplayCurrency } from "./money";

const usd = (amount: number | null, period: Money["period"] = "total"): Money => ({
  amount,
  currency: "USD",
  period,
  negotiable: amount === null,
});

describe("money", () => {
  it("converts both ways at the display rate", () => {
    expect(convertAmount(100, "USD", "AMD")).toBe(40000);
    expect(convertAmount(40000, "AMD", "USD")).toBe(100);
    expect(convertAmount(5, "AMD", "AMD")).toBe(5);
  });

  it("formats USD with a leading symbol and AMD with a trailing one", () => {
    expect(formatAmount(usd(42000), "USD").startsWith("$")).toBe(true);
    expect(formatAmount(usd(42000), "USD")).toContain(groupDigits(42000));
    expect(formatAmount(usd(100), "AMD").endsWith("֏")).toBe(true);
    expect(formatAmount(usd(100), "AMD")).toContain(groupDigits(40000));
  });

  it("appends the period, and shows negotiable when there is no amount", () => {
    expect(formatMoney(usd(300, "month"), "USD").endsWith("/ամիս")).toBe(true);
    expect(formatMoney(usd(40, "night"), "USD").endsWith("/գիշեր")).toBe(true);
    expect(formatMoney(usd(42000), "USD").includes("/")).toBe(false);
    expect(formatMoney(usd(null, "month"), "USD")).toBe(NEGOTIABLE_LABEL);
  });

  it("maps any stored display preference onto a contract currency", () => {
    expect(toDisplayCurrency("AMD")).toBe("AMD");
    expect(toDisplayCurrency("EUR")).toBe("USD");
  });
});

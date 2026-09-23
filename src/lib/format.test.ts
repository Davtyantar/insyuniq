import { describe, expect, it } from "vitest";
import { formatRelativeDate } from "./format";

describe("formatRelativeDate", () => {
  it("measures against the real clock by default, not the mock one", () => {
    expect(formatRelativeDate(new Date(Date.now() - 5 * 60_000).toISOString())).toBe("5 րոպե առաջ");
  });

  it("stays deterministic when now is passed", () => {
    const now = Date.parse("2026-09-10T12:00:00Z");
    expect(formatRelativeDate("2026-09-09T12:00:00Z", now)).toBe("երեկ");
  });
});

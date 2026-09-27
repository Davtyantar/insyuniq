import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { cityValues, districtValues } from "./schema";

describe("vendored contract", () => {
  it("pins the version package.json declares", () => {
    const yaml = readFileSync("contract/openapi.yaml", "utf8");
    const pkg = JSON.parse(readFileSync("package.json", "utf8")) as { contractVersion: string };
    expect(/^ {2}version: (\S+)$/m.exec(yaml)?.[1]).toBe(pkg.contractVersion);
  });

  it("exposes contract enums at runtime, districts prefixed by their city", () => {
    expect(cityValues).toContain("kapan");
    expect(districtValues.every((d) => cityValues.some((c) => d.startsWith(`${c}-`)))).toBe(true);
  });
});

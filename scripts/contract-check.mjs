// Fails when contract/openapi.yaml and package.json disagree on the version, or when
// src/lib/api/schema.ts no longer matches what the vendored YAML generates.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const yaml = readFileSync("contract/openapi.yaml", "utf8");
const version = /^ {2}version: (\S+)$/m.exec(yaml)?.[1];
if (version !== pkg.contractVersion) {
  console.error(`contract/openapi.yaml is ${version}; package.json pins ${pkg.contractVersion}.`);
  process.exit(1);
}
const out = join(mkdtempSync(join(tmpdir(), "contract-")), "schema.ts");
execFileSync("npx", ["openapi-typescript", "contract/openapi.yaml", "-o", out, "--enum-values"], { stdio: "ignore" });
if (readFileSync(out, "utf8") !== readFileSync("src/lib/api/schema.ts", "utf8")) {
  console.error("src/lib/api/schema.ts is stale. Run: npm run api:types");
  process.exit(1);
}
console.log(`contract ${version} OK`);

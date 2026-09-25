// Creates supabase/signing_keys.json with one ES256 key the first time. The file is a private
// key: it is gitignored, and every developer generates their own.
import { execFileSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";

const path = "supabase/signing_keys.json";
if (existsSync(path)) {
  console.log(`${path} already exists`);
  process.exit(0);
}
writeFileSync(path, "[]\n");
execFileSync("supabase", ["gen", "signing-key", "--algorithm", "ES256", "--append", "--yes"], { stdio: "inherit" });

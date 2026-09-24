// Smoke test for the API-backed routes. Needs `npm run dev` (or `npm start`) and InSyunik-Api
// with seed data. Usage: node scripts/smoke-api.mjs [baseUrl]
const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const RE_1 = "947e6113-f009-5717-a2f7-97b482ec8acf";

const checks = [
  ["/", 200, "/real-estate/"],
  ["/real-estate", 200, "/real-estate/"],
  ["/rentals", 200, "/rentals/"],
  ["/hotels", 200, "/hotels/"],
  [`/real-estate/${RE_1}`, 200, "RealEstateListing"],
  ["/real-estate/re-1", 404, null],
  ["/cars", 200, "/cars/car-"],
  ["/sitemap.xml", 200, `/real-estate/${RE_1}`],
];

let failed = 0;
for (const [path, status, needle] of checks) {
  const response = await fetch(base + path, { redirect: "manual" });
  const body = await response.text();
  const ok = response.status === status && (needle === null || body.includes(needle));
  if (!ok) failed += 1;
  console.log(`${ok ? "ok  " : "FAIL"} ${response.status} ${path}`);
}
process.exit(failed ? 1 : 0);

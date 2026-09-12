/**
 * Maps each Armenian city name — the actual stored value used as a filter key
 * against `listing.city` (see mock/taxonomy.ts CITIES, lib/format.ts
 * DISTRICTS) — to a stable, language-independent slug for i18n lookups. The
 * stored value itself must stay Armenian; only its on-screen label changes
 * with the locale, via `t(`cities.${slug}.name`)` / `.in`.
 */
export const CITY_SLUG: Record<string, string> = {
  Կապան: "kapan",
  Գորիս: "goris",
  Սիսիան: "sisian",
  Քաջարան: "kajaran",
  Մեղրի: "meghri",
  Ագարակ: "agarak",
  Դաստակերտ: "dastakert",
  Տաթև: "tatev",
  Խնձորեսկ: "khndzoresk",
  Շինուհայր: "shinuhayr",
};

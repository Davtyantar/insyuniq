import { cityValues, districtValues } from "@/lib/api/schema";
import type { City, District } from "@/lib/api/types";
import { CITY_SLUG } from "@/lib/cities";

export const CITY_LABEL: Record<City, string> = {
  kapan: "Կապան",
  goris: "Գորիս",
  sisian: "Սիսիան",
  kajaran: "Քաջարան",
  meghri: "Մեղրի",
  agarak: "Ագարակ",
  dastakert: "Դաստակերտ",
  tatev: "Տաթև",
  khndzoresk: "Խնձորեսկ",
  shinuhayr: "Շինուհայր",
};

export const DISTRICT_LABEL: Record<District, string> = {
  "kapan-center": "Կենտրոն",
  "kapan-vachagan": "Վաչագան",
  "kapan-achanan": "Աճանան",
  "kapan-shahumyan": "Շահումյան",
  "kapan-dzork": "Ձորք",
  "kapan-kavart": "Կավարտ",
  "kapan-aghbyur": "Աղբյուր",
  "goris-center": "Կենտրոն",
  "goris-verin-goris": "Վերին Գորիս",
  "goris-aghbyur": "Աղբյուր",
  "goris-davit-bek": "Դավիթ Բեկ",
  "goris-syunik": "Սյունիք",
  "sisian-center": "Կենտրոն",
  "sisian-arevik": "Արևիկ",
  "sisian-norashen": "Նորաշեն",
  "sisian-sisakan": "Սիսական",
  "kajaran-center": "Կենտրոն",
  "kajaran-norashen": "Նորաշեն",
  "kajaran-lernayin": "Լեռնային",
  "meghri-center": "Կենտրոն",
  "meghri-prkashen": "Պրկաշեն",
  "meghri-mets-tagh": "Մեծ Թաղ",
  "agarak-center": "Կենտրոն",
  "agarak-gortsaranayin": "Գործարանային",
  "dastakert-center": "Կենտրոն",
  "tatev-center": "Կենտրոն",
  "tatev-vorotan-gorge": "Որոտանի կիրճ",
  "khndzoresk-center": "Կենտրոն",
  "khndzoresk-hin-khndzoresk": "Հին Խնձորեսկ",
  "shinuhayr-center": "Կենտրոն",
};

export function isCity(value: string): value is City {
  return (cityValues as readonly string[]).includes(value);
}

export function isDistrict(value: string): value is District {
  return (districtValues as readonly string[]).includes(value);
}

/** The AppProvider still stores the header city by its Armenian name; this is the bridge. */
export function citySlugOf(armenianName: string): City | undefined {
  const slug = CITY_SLUG[armenianName];
  return slug && isCity(slug) ? slug : undefined;
}

/** A district slug carries its city as a prefix, so no separate table is needed. */
export function districtsOf(cities: readonly City[]): District[] {
  return districtValues.filter((district) => cities.some((city) => district.startsWith(`${city}-`)));
}

export function locationText(city: City, district?: District): string {
  return district ? `${CITY_LABEL[city]}, ${DISTRICT_LABEL[district]}` : CITY_LABEL[city];
}

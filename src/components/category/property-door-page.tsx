import { redirect } from "next/navigation";
import { PropertyCategoryPage } from "@/components/category/property-category-page";
import { JsonLd } from "@/components/seo/json-ld";
import { createApi } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { getPropertyFacets, searchProperty } from "@/lib/api/property";
import { propertyCard } from "@/lib/card";
import { CATEGORIES } from "@/lib/categories";
import type { PropertyDoor } from "@/lib/property-doors";
import {
  parsePropertyState,
  stripRejectedParams,
  toPropertyFacetQuery,
  toPropertyQuery,
  toSearchParams,
} from "@/lib/property-filters";
import { breadcrumbJsonLd, categoryItemListJsonLd } from "@/lib/structured-data";

interface Props {
  door: PropertyDoor;
  searchParams: Record<string, string | string[] | undefined>;
}

export async function PropertyDoorPage({ door, searchParams }: Props) {
  const params = toSearchParams(searchParams);
  const state = parsePropertyState(door, params);
  const api = createApi();

  let result;
  try {
    const [page, facets] = await Promise.all([
      searchProperty(api, toPropertyQuery(door, state)),
      getPropertyFacets(api, toPropertyFacetQuery(door, state.filters)),
    ]);
    result = { page, facets };
  } catch (error) {
    // Parsing already drops unknown values; a 400 here means a value passed our checks but not the
    // API's. Drop exactly the rejected parameters and reload once. Anything else reaches error.tsx.
    if (error instanceof ApiError && error.status === 400) {
      const current = params.toString() ? `?${params}` : "";
      const next = stripRejectedParams(params, error.errors);
      if (next !== current) redirect(`/${door}${next}`);
    }
    throw error;
  }

  const config = CATEGORIES[door];
  const cards = result.page.items.map(propertyCard);
  return (
    <>
      <JsonLd
        data={[
          categoryItemListJsonLd(config.label, config.href, cards),
          breadcrumbJsonLd([
            { name: "Գլխավոր", path: "/" },
            { name: config.label, path: config.href },
          ]),
        ]}
      />
      <PropertyCategoryPage door={door} state={state} cards={cards} total={result.page.total} facets={result.facets} />
    </>
  );
}

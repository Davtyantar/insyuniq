"use client";

import {
  ChipGroup,
  FilterSection,
  MultiSelectField,
  PriceRangeField,
  RangeFields,
  SelectField,
  ToggleRow,
  type PriceBounds,
} from "@/components/filters/filter-fields";
import type { HotelFilters } from "@/lib/types";
import { CITIES, HOTEL_SUBCATEGORIES, POOL_OPTIONS } from "@/mock/taxonomy";

/** In USD — nightly/term rates run much lower than a real-estate sale price. */
const PRICE_BOUNDS: PriceBounds = { min: 0, max: 500, step: 5 };

interface Props {
  filters: HotelFilters;
  onChange: (patch: Partial<HotelFilters>) => void;
  /** Phone drawer: collapses the secondary sections by default. Desktop sidebar is unchanged. */
  mobile?: boolean;
}

export function HotelFilterFields({ filters, onChange, mobile = false }: Props) {
  return (
    <>
      <FilterSection title="Բնակատեղիի տեսակ">
        <SelectField
          value={filters.subcategory}
          onChange={(subcategory) => onChange({ subcategory })}
          options={HOTEL_SUBCATEGORIES}
          placeholder="Ցանկացած տեսակ"
          anyLabel="Ցանկացած տեսակ"
        />
      </FilterSection>

      <FilterSection title="Տեղադրություն">
        <MultiSelectField
          values={filters.city}
          onChange={(city) => onChange({ city })}
          options={CITIES}
          placeholder="Ողջ Սյունիք"
          anyLabel="Ողջ Սյունիք"
        />
      </FilterSection>

      <FilterSection title="Գին" defaultOpen={!mobile}>
        <PriceRangeField
          currency={filters.priceCurrency}
          onCurrencyChange={(priceCurrency) => onChange({ priceCurrency })}
          from={filters.priceMin}
          to={filters.priceMax}
          onFrom={(priceMin) => onChange({ priceMin })}
          onTo={(priceMax) => onChange({ priceMax })}
          bounds={PRICE_BOUNDS}
        />
      </FilterSection>

      <FilterSection title="Լողավազան" defaultOpen={!mobile}>
        <ChipGroup
          options={POOL_OPTIONS}
          values={filters.pool ? [filters.pool] : []}
          onChange={(values) => onChange({ pool: (values[0] ?? "") as HotelFilters["pool"] })}
          fullWidth
        />
      </FilterSection>

      <FilterSection title="Հայտարարություններ" defaultOpen={!mobile}>
        <ToggleRow
          label="Միայն նկարով"
          checked={filters.withPhoto}
          onChange={(withPhoto) => onChange({ withPhoto })}
        />
        <ToggleRow
          label="Միայն ստուգված"
          checked={filters.verifiedOnly}
          onChange={(verifiedOnly) => onChange({ verifiedOnly })}
        />
      </FilterSection>
    </>
  );
}

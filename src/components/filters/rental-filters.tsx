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
import type { RentalFilters } from "@/lib/types";
import { CITIES, RENTAL_SUBCATEGORIES, RENTAL_TERMS, ROOMS_OPTIONS } from "@/mock/taxonomy";

/** In USD — covers both daily and long-term monthly rent. */
const PRICE_BOUNDS: PriceBounds = { min: 0, max: 3000, step: 25 };

interface Props {
  filters: RentalFilters;
  onChange: (patch: Partial<RentalFilters>) => void;
  /** Phone drawer: every section starts collapsed so the sheet opens as a compact,
   * tap-to-expand list instead of a long scroll of always-open fields. Desktop sidebar
   * keeps everything expanded. */
  mobile?: boolean;
}

export function RentalFilterFields({ filters, onChange, mobile = false }: Props) {
  return (
    <>
      <FilterSection title="Բնակարանի տեսակ" defaultOpen={!mobile}>
        <SelectField
          value={filters.subcategory}
          onChange={(subcategory) => onChange({ subcategory })}
          options={RENTAL_SUBCATEGORIES}
          placeholder="Ցանկացած տեսակ"
          anyLabel="Ցանկացած տեսակ"
        />
      </FilterSection>

      <FilterSection title="Վարձակալության ժամկետ" defaultOpen={!mobile}>
        <ChipGroup
          options={RENTAL_TERMS}
          values={filters.term ? [filters.term] : []}
          onChange={(values) => onChange({ term: (values[0] ?? "") as RentalFilters["term"] })}
        />
      </FilterSection>

      <FilterSection title="Տեղադրություն" defaultOpen={!mobile}>
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

      <FilterSection title="Սենյակներ" defaultOpen={!mobile}>
        <ChipGroup
          options={ROOMS_OPTIONS}
          values={filters.rooms}
          onChange={(rooms) => onChange({ rooms })}
          multiple
        />
      </FilterSection>

      <FilterSection title="Մակերես, մ²" defaultOpen={!mobile}>
        <RangeFields
          from={filters.areaMin}
          to={filters.areaMax}
          onFrom={(areaMin) => onChange({ areaMin })}
          onTo={(areaMax) => onChange({ areaMax })}
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

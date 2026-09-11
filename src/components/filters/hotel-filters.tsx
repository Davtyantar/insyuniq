"use client";

import {
  ChipGroup,
  FilterSection,
  MultiSelectField,
  RangeFields,
  SelectField,
  ToggleRow,
} from "@/components/filters/filter-fields";
import type { HotelFilters } from "@/lib/types";
import { CITIES, HOTEL_SUBCATEGORIES, POOL_OPTIONS } from "@/mock/taxonomy";

interface Props {
  filters: HotelFilters;
  onChange: (patch: Partial<HotelFilters>) => void;
}

export function HotelFilterFields({ filters, onChange }: Props) {
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

      <FilterSection title="Գին, $">
        <RangeFields
          from={filters.priceMin}
          to={filters.priceMax}
          onFrom={(priceMin) => onChange({ priceMin })}
          onTo={(priceMax) => onChange({ priceMax })}
        />
      </FilterSection>

      <FilterSection title="Լողավազան">
        <ChipGroup
          options={POOL_OPTIONS}
          values={filters.pool ? [filters.pool] : []}
          onChange={(values) => onChange({ pool: (values[0] ?? "") as HotelFilters["pool"] })}
          fullWidth
        />
      </FilterSection>

      <FilterSection title="Հայտարարություններ">
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

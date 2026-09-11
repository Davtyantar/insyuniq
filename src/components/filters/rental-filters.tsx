"use client";

import {
  ChipGroup,
  FilterSection,
  MultiSelectField,
  RangeFields,
  SelectField,
  ToggleRow,
} from "@/components/filters/filter-fields";
import type { RentalFilters } from "@/lib/types";
import { CITIES, RENTAL_SUBCATEGORIES, RENTAL_TERMS, ROOMS_OPTIONS } from "@/mock/taxonomy";

interface Props {
  filters: RentalFilters;
  onChange: (patch: Partial<RentalFilters>) => void;
}

export function RentalFilterFields({ filters, onChange }: Props) {
  return (
    <>
      <FilterSection title="Բնակարանի տեսակ">
        <SelectField
          value={filters.subcategory}
          onChange={(subcategory) => onChange({ subcategory })}
          options={RENTAL_SUBCATEGORIES}
          placeholder="Ցանկացած տեսակ"
          anyLabel="Ցանկացած տեսակ"
        />
      </FilterSection>

      <FilterSection title="Վարձակալության ժամկետ">
        <ChipGroup
          options={RENTAL_TERMS}
          values={filters.term ? [filters.term] : []}
          onChange={(values) => onChange({ term: (values[0] ?? "") as RentalFilters["term"] })}
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

      <FilterSection title="Սենյակներ">
        <ChipGroup
          options={ROOMS_OPTIONS}
          values={filters.rooms}
          onChange={(rooms) => onChange({ rooms })}
          multiple
        />
      </FilterSection>

      <FilterSection title="Մակերես, մ²" defaultOpen={false}>
        <RangeFields
          from={filters.areaMin}
          to={filters.areaMax}
          onFrom={(areaMin) => onChange({ areaMin })}
          onTo={(areaMax) => onChange({ areaMax })}
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

"use client";

import {
  ChipGroup,
  FilterSection,
  MultiSelectField,
  RangeFields,
  SelectField,
} from "@/components/filters/filter-fields";
import type { WorkFilters } from "@/lib/types";
import { CITIES, EMPLOYMENT_TYPES, WORK_SUBCATEGORIES } from "@/mock/taxonomy";

interface Props {
  filters: WorkFilters;
  onChange: (patch: Partial<WorkFilters>) => void;
}

export function WorkFilterFields({ filters, onChange }: Props) {
  return (
    <>
      <FilterSection title="Ոլորտ">
        <SelectField
          value={filters.subcategory}
          onChange={(subcategory) => onChange({ subcategory })}
          options={WORK_SUBCATEGORIES}
          placeholder="Ցանկացած ոլորտ"
          anyLabel="Ցանկացած ոլորտ"
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

      <FilterSection title="Աշխատավարձ, $/ամիս">
        <RangeFields
          from={filters.priceMin}
          to={filters.priceMax}
          onFrom={(priceMin) => onChange({ priceMin })}
          onTo={(priceMax) => onChange({ priceMax })}
        />
      </FilterSection>

      <FilterSection title="Դրույք">
        <ChipGroup
          options={EMPLOYMENT_TYPES}
          values={filters.employmentType}
          onChange={(employmentType) => onChange({ employmentType })}
          multiple
        />
      </FilterSection>
    </>
  );
}

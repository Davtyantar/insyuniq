"use client";

import {
  FilterSection,
  MultiSelectField,
  PriceRangeField,
  SelectField,
  type PriceBounds,
} from "@/components/filters/filter-fields";
import type { WorkFilters } from "@/lib/types";
import { CITIES, EMPLOYMENT_TYPES, WORK_SUBCATEGORIES } from "@/mock/taxonomy";

/** In USD/month. */
const PRICE_BOUNDS: PriceBounds = { min: 0, max: 5000, step: 50 };

interface Props {
  filters: WorkFilters;
  onChange: (patch: Partial<WorkFilters>) => void;
  /** Phone drawer: every section starts collapsed so the sheet opens as a compact,
   * tap-to-expand list instead of a long scroll of always-open fields. Desktop sidebar
   * keeps everything expanded. */
  mobile?: boolean;
}

export function WorkFilterFields({ filters, onChange, mobile = false }: Props) {
  return (
    <>
      <FilterSection title="Ոլորտ" defaultOpen={!mobile}>
        <SelectField
          value={filters.subcategory}
          onChange={(subcategory) => onChange({ subcategory })}
          options={WORK_SUBCATEGORIES}
          placeholder="Ցանկացած ոլորտ"
          anyLabel="Ցանկացած ոլորտ"
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

      <FilterSection title="Աշխատավարձ, ամսական" defaultOpen={!mobile}>
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

      <FilterSection title="Դրույք" defaultOpen={!mobile}>
        <MultiSelectField
          values={filters.employmentType}
          onChange={(employmentType) => onChange({ employmentType: employmentType as WorkFilters["employmentType"] })}
          options={EMPLOYMENT_TYPES}
          placeholder="Ցանկացած դրույք"
          anyLabel="Ցանկացած դրույք"
        />
      </FilterSection>
    </>
  );
}

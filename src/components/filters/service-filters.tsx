"use client";

import {
  FilterSection,
  MultiSelectField,
  SelectField,
  ToggleRow,
} from "@/components/filters/filter-fields";
import type { ServiceFilters } from "@/lib/types";
import { CITIES, SERVICE_SUBCATEGORIES } from "@/mock/taxonomy";

interface Props {
  filters: ServiceFilters;
  onChange: (patch: Partial<ServiceFilters>) => void;
  /** Phone drawer: every section starts collapsed so the sheet opens as a compact,
   * tap-to-expand list instead of a long scroll of always-open fields. Desktop sidebar
   * keeps everything expanded. */
  mobile?: boolean;
}

export function ServiceFilterFields({ filters, onChange, mobile = false }: Props) {
  return (
    <>
      <FilterSection title="Ծառայության տեսակ" defaultOpen={!mobile}>
        <SelectField
          value={filters.subcategory}
          onChange={(subcategory) => onChange({ subcategory })}
          options={SERVICE_SUBCATEGORIES}
          placeholder="Ցանկացած տեսակ"
          anyLabel="Ցանկացած տեսակ"
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

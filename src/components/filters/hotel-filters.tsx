"use client";

import {
  ChipGroup,
  FilterSection,
  RangeFields,
  SelectField,
  ToggleRow,
} from "@/components/filters/filter-fields";
import type { HotelFilters } from "@/lib/types";
import { CITIES, HOTEL_SUBCATEGORIES, RENTAL_TERMS, ROOMS_OPTIONS } from "@/mock/taxonomy";

interface Props {
  filters: HotelFilters;
  onChange: (patch: Partial<HotelFilters>) => void;
}

export function HotelFilterFields({ filters, onChange }: Props) {
  return (
    <>
      <FilterSection title="Тип жилья">
        <SelectField
          value={filters.subcategory}
          onChange={(subcategory) => onChange({ subcategory })}
          options={HOTEL_SUBCATEGORIES}
          placeholder="Любой тип"
          anyLabel="Любой тип"
        />
      </FilterSection>

      <FilterSection title="Срок аренды">
        <ChipGroup
          options={RENTAL_TERMS}
          values={filters.term ? [filters.term] : []}
          onChange={(values) => onChange({ term: (values[0] ?? "") as HotelFilters["term"] })}
        />
      </FilterSection>

      <FilterSection title="Расположение">
        <SelectField
          value={filters.city}
          onChange={(city) => onChange({ city })}
          options={CITIES}
          placeholder="Весь Сюник"
          anyLabel="Весь Сюник"
        />
      </FilterSection>

      <FilterSection title="Цена, $">
        <RangeFields
          from={filters.priceMin}
          to={filters.priceMax}
          onFrom={(priceMin) => onChange({ priceMin })}
          onTo={(priceMax) => onChange({ priceMax })}
        />
      </FilterSection>

      <FilterSection title="Комнаты">
        <ChipGroup
          options={ROOMS_OPTIONS}
          values={filters.rooms}
          onChange={(rooms) => onChange({ rooms })}
          multiple
        />
      </FilterSection>

      <FilterSection title="Площадь, м²" defaultOpen={false}>
        <RangeFields
          from={filters.areaMin}
          to={filters.areaMax}
          onFrom={(areaMin) => onChange({ areaMin })}
          onTo={(areaMax) => onChange({ areaMax })}
        />
      </FilterSection>

      <FilterSection title="Объявления">
        <ToggleRow
          label="Только с фото"
          checked={filters.withPhoto}
          onChange={(withPhoto) => onChange({ withPhoto })}
        />
        <ToggleRow
          label="Только проверенные объявления"
          hint="Документы и адрес подтверждены модератором"
          checked={filters.verifiedOnly}
          onChange={(verifiedOnly) => onChange({ verifiedOnly })}
        />
      </FilterSection>
    </>
  );
}

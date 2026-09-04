"use client";

import {
  CheckboxList,
  ChipGroup,
  FieldLabel,
  FilterSection,
  RangeFields,
  SelectField,
  ToggleRow,
} from "@/components/filters/filter-fields";
import type { RealEstateFilters } from "@/lib/types";
import {
  BUILDING_TYPES,
  CITIES,
  DEAL_TYPES,
  DISTRICTS,
  REAL_ESTATE_SUBCATEGORIES,
  RE_CONDITIONS,
  ROOMS_OPTIONS,
} from "@/mock/taxonomy";

interface Props {
  filters: RealEstateFilters;
  onChange: (patch: Partial<RealEstateFilters>) => void;
}

export function RealEstateFilterFields({ filters, onChange }: Props) {
  const districts = (DISTRICTS[filters.city] ?? []).map((d) => ({ value: d, label: d }));

  return (
    <>
      <FilterSection title="Тип недвижимости">
        <SelectField
          value={filters.subcategory}
          onChange={(subcategory) => onChange({ subcategory })}
          options={REAL_ESTATE_SUBCATEGORIES}
          placeholder="Любой тип"
          anyLabel="Любой тип"
        />
      </FilterSection>

      <FilterSection title="Тип сделки">
        <ChipGroup
          options={DEAL_TYPES}
          values={filters.deal ? [filters.deal] : []}
          onChange={(values) => onChange({ deal: (values[0] ?? "") as RealEstateFilters["deal"] })}
        />
      </FilterSection>

      <FilterSection title="Расположение">
        <div>
          <FieldLabel>Город</FieldLabel>
          <SelectField
            value={filters.city}
            onChange={(city) => onChange({ city, district: "" })}
            options={CITIES}
            placeholder="Весь Сюник"
            anyLabel="Весь Сюник"
          />
        </div>
        <div>
          <FieldLabel>Район</FieldLabel>
          <SelectField
            value={filters.district}
            onChange={(district) => onChange({ district })}
            options={districts}
            placeholder={filters.city ? "Любой район" : "Сначала выберите город"}
            anyLabel="Любой район"
            disabled={!filters.city}
          />
        </div>
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

      <FilterSection title="Площадь, м²">
        <RangeFields
          from={filters.areaMin}
          to={filters.areaMax}
          onFrom={(areaMin) => onChange({ areaMin })}
          onTo={(areaMax) => onChange({ areaMax })}
        />
      </FilterSection>

      <FilterSection title="Этаж" defaultOpen={false}>
        <div>
          <FieldLabel>Этаж квартиры</FieldLabel>
          <RangeFields
            from={filters.floorMin}
            to={filters.floorMax}
            onFrom={(floorMin) => onChange({ floorMin })}
            onTo={(floorMax) => onChange({ floorMax })}
          />
        </div>
        <div>
          <FieldLabel>Этажность дома, не менее</FieldLabel>
          <RangeFields
            from={filters.totalFloorsMin}
            to=""
            onFrom={(totalFloorsMin) => onChange({ totalFloorsMin })}
            onTo={() => undefined}
            fromPlaceholder="от"
            toPlaceholder="—"
          />
        </div>
      </FilterSection>

      <FilterSection title="Состояние" defaultOpen={false}>
        <CheckboxList
          options={RE_CONDITIONS}
          values={filters.condition}
          onChange={(condition) => onChange({ condition })}
        />
      </FilterSection>

      <FilterSection title="Тип дома" defaultOpen={false}>
        <ChipGroup
          options={BUILDING_TYPES}
          values={filters.buildingType ? [filters.buildingType] : []}
          onChange={(values) =>
            onChange({ buildingType: (values[0] ?? "") as RealEstateFilters["buildingType"] })
          }
        />
      </FilterSection>

      <FilterSection title="Удобства" defaultOpen={false}>
        <ToggleRow
          label="Мебель"
          checked={filters.furniture}
          onChange={(furniture) => onChange({ furniture })}
        />
        <ToggleRow
          label="Балкон"
          checked={filters.balcony}
          onChange={(balcony) => onChange({ balcony })}
        />
        <ToggleRow
          label="Парковка"
          checked={filters.parking}
          onChange={(parking) => onChange({ parking })}
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

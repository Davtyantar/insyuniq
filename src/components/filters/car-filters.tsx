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
import type { CarFilters } from "@/lib/types";
import {
  BODY_TYPES,
  CAR_BRANDS,
  CAR_BRAND_OPTIONS,
  CAR_COLORS,
  CAR_CONDITIONS,
  CAR_SUBCATEGORIES,
  CITIES,
  DRIVE_TYPES,
  FUEL_TYPES,
  STEERING_TYPES,
  TRANSMISSIONS,
} from "@/mock/taxonomy";

interface Props {
  filters: CarFilters;
  onChange: (patch: Partial<CarFilters>) => void;
}

export function CarFilterFields({ filters, onChange }: Props) {
  const models = (CAR_BRANDS[filters.brand] ?? []).map((m) => ({ value: m, label: m }));

  return (
    <>
      <FilterSection title="Тип транспорта">
        <SelectField
          value={filters.subcategory}
          onChange={(subcategory) => onChange({ subcategory })}
          options={CAR_SUBCATEGORIES}
          placeholder="Любой тип"
          anyLabel="Любой тип"
        />
      </FilterSection>

      <FilterSection title="Марка и модель">
        <div>
          <FieldLabel>Марка</FieldLabel>
          <SelectField
            value={filters.brand}
            onChange={(brand) => onChange({ brand, model: "" })}
            options={CAR_BRAND_OPTIONS}
            placeholder="Любая марка"
            anyLabel="Любая марка"
          />
        </div>
        <div>
          <FieldLabel>Модель</FieldLabel>
          <SelectField
            value={filters.model}
            onChange={(model) => onChange({ model })}
            options={models}
            placeholder={filters.brand ? "Любая модель" : "Сначала выберите марку"}
            anyLabel="Любая модель"
            disabled={!filters.brand}
          />
        </div>
      </FilterSection>

      <FilterSection title="Год выпуска">
        <RangeFields
          from={filters.yearMin}
          to={filters.yearMax}
          onFrom={(yearMin) => onChange({ yearMin })}
          onTo={(yearMax) => onChange({ yearMax })}
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

      <FilterSection title="Пробег, км">
        <RangeFields
          from={filters.mileageMin}
          to={filters.mileageMax}
          onFrom={(mileageMin) => onChange({ mileageMin })}
          onTo={(mileageMax) => onChange({ mileageMax })}
        />
      </FilterSection>

      <FilterSection title="Тип кузова" defaultOpen={false}>
        <CheckboxList
          options={BODY_TYPES}
          values={filters.bodyType}
          onChange={(bodyType) => onChange({ bodyType })}
          columns={2}
        />
      </FilterSection>

      <FilterSection title="Двигатель">
        <CheckboxList
          options={FUEL_TYPES}
          values={filters.fuel}
          onChange={(fuel) => onChange({ fuel })}
          columns={2}
        />
        <div>
          <FieldLabel>Объём, л</FieldLabel>
          <RangeFields
            from={filters.engineMin}
            to={filters.engineMax}
            onFrom={(engineMin) => onChange({ engineMin })}
            onTo={(engineMax) => onChange({ engineMax })}
          />
        </div>
      </FilterSection>

      <FilterSection title="Коробка передач" defaultOpen={false}>
        <CheckboxList
          options={TRANSMISSIONS}
          values={filters.transmission}
          onChange={(transmission) => onChange({ transmission })}
          columns={2}
        />
      </FilterSection>

      <FilterSection title="Привод" defaultOpen={false}>
        <ChipGroup
          options={DRIVE_TYPES}
          values={filters.drive}
          onChange={(drive) => onChange({ drive })}
          multiple
        />
      </FilterSection>

      <FilterSection title="Цвет" defaultOpen={false}>
        <SelectField
          value={filters.color}
          onChange={(color) => onChange({ color })}
          options={CAR_COLORS}
          placeholder="Любой цвет"
          anyLabel="Любой цвет"
        />
      </FilterSection>

      <FilterSection title="Состояние и владельцы" defaultOpen={false}>
        <ChipGroup
          options={CAR_CONDITIONS}
          values={filters.condition ? [filters.condition] : []}
          onChange={(values) =>
            onChange({ condition: (values[0] ?? "") as CarFilters["condition"] })
          }
        />
        <div>
          <FieldLabel>Руль</FieldLabel>
          <ChipGroup
            options={STEERING_TYPES}
            values={filters.steering ? [filters.steering] : []}
            onChange={(values) =>
              onChange({ steering: (values[0] ?? "") as CarFilters["steering"] })
            }
          />
        </div>
        <div>
          <FieldLabel>Владельцев не более</FieldLabel>
          <RangeFields
            from={filters.ownersMax}
            to=""
            onFrom={(ownersMax) => onChange({ ownersMax })}
            onTo={() => undefined}
            fromPlaceholder="например, 2"
            toPlaceholder="—"
          />
        </div>
      </FilterSection>

      <FilterSection title="Расположение" defaultOpen={false}>
        <SelectField
          value={filters.city}
          onChange={(city) => onChange({ city })}
          options={CITIES}
          placeholder="Весь Сюник"
          anyLabel="Весь Сюник"
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
          hint="Продавец и документы подтверждены"
          checked={filters.verifiedOnly}
          onChange={(verifiedOnly) => onChange({ verifiedOnly })}
        />
        <ToggleRow
          label="Без ДТП"
          checked={filters.accidentFree}
          onChange={(accidentFree) => onChange({ accidentFree })}
        />
      </FilterSection>
    </>
  );
}

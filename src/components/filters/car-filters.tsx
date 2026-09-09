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
      <FilterSection title="Տրանսպորտի տեսակ">
        <SelectField
          value={filters.subcategory}
          onChange={(subcategory) => onChange({ subcategory })}
          options={CAR_SUBCATEGORIES}
          placeholder="Ցանկացած տեսակ"
          anyLabel="Ցանկացած տեսակ"
        />
      </FilterSection>

      <FilterSection title="Մակնիշ և մոդել">
        <div>
          <FieldLabel>Մակնիշ</FieldLabel>
          <SelectField
            value={filters.brand}
            onChange={(brand) => onChange({ brand, model: "" })}
            options={CAR_BRAND_OPTIONS}
            placeholder="Ցանկացած մակնիշ"
            anyLabel="Ցանկացած մակնիշ"
          />
        </div>
        <div>
          <FieldLabel>Մոդել</FieldLabel>
          <SelectField
            value={filters.model}
            onChange={(model) => onChange({ model })}
            options={models}
            placeholder={filters.brand ? "Ցանկացած մոդել" : "Նախ ընտրեք մակնիշը"}
            anyLabel="Ցանկացած մոդել"
            disabled={!filters.brand}
          />
        </div>
      </FilterSection>

      <FilterSection title="Թողարկման տարի">
        <RangeFields
          from={filters.yearMin}
          to={filters.yearMax}
          onFrom={(yearMin) => onChange({ yearMin })}
          onTo={(yearMax) => onChange({ yearMax })}
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

      <FilterSection title="Վազք, կմ">
        <RangeFields
          from={filters.mileageMin}
          to={filters.mileageMax}
          onFrom={(mileageMin) => onChange({ mileageMin })}
          onTo={(mileageMax) => onChange({ mileageMax })}
        />
      </FilterSection>

      <FilterSection title="Թափքի տեսակ" defaultOpen={false}>
        <CheckboxList
          options={BODY_TYPES}
          values={filters.bodyType}
          onChange={(bodyType) => onChange({ bodyType })}
          columns={2}
        />
      </FilterSection>

      <FilterSection title="Շարժիչ">
        <CheckboxList
          options={FUEL_TYPES}
          values={filters.fuel}
          onChange={(fuel) => onChange({ fuel })}
          columns={2}
        />
        <div>
          <FieldLabel>Ծավալ, լ</FieldLabel>
          <RangeFields
            from={filters.engineMin}
            to={filters.engineMax}
            onFrom={(engineMin) => onChange({ engineMin })}
            onTo={(engineMax) => onChange({ engineMax })}
          />
        </div>
      </FilterSection>

      <FilterSection title="Փոխանցումատուփ" defaultOpen={false}>
        <CheckboxList
          options={TRANSMISSIONS}
          values={filters.transmission}
          onChange={(transmission) => onChange({ transmission })}
          columns={2}
        />
      </FilterSection>

      <FilterSection title="Քարշակ" defaultOpen={false}>
        <ChipGroup
          options={DRIVE_TYPES}
          values={filters.drive}
          onChange={(drive) => onChange({ drive })}
          multiple
        />
      </FilterSection>

      <FilterSection title="Գույն" defaultOpen={false}>
        <SelectField
          value={filters.color}
          onChange={(color) => onChange({ color })}
          options={CAR_COLORS}
          placeholder="Ցանկացած գույն"
          anyLabel="Ցանկացած գույն"
        />
      </FilterSection>

      <FilterSection title="Վիճակ և սեփականատերեր" defaultOpen={false}>
        <ChipGroup
          options={CAR_CONDITIONS}
          values={filters.condition ? [filters.condition] : []}
          onChange={(values) =>
            onChange({ condition: (values[0] ?? "") as CarFilters["condition"] })
          }
        />
        <div>
          <FieldLabel>Ղեկ</FieldLabel>
          <ChipGroup
            options={STEERING_TYPES}
            values={filters.steering ? [filters.steering] : []}
            onChange={(values) =>
              onChange({ steering: (values[0] ?? "") as CarFilters["steering"] })
            }
          />
        </div>
        <div>
          <FieldLabel>Առավելագույնը սեփականատերեր</FieldLabel>
          <RangeFields
            from={filters.ownersMax}
            to=""
            onFrom={(ownersMax) => onChange({ ownersMax })}
            onTo={() => undefined}
            fromPlaceholder="օրինակ՝ 2"
            toPlaceholder="—"
          />
        </div>
      </FilterSection>

      <FilterSection title="Տեղադրություն" defaultOpen={false}>
        <SelectField
          value={filters.city}
          onChange={(city) => onChange({ city })}
          options={CITIES}
          placeholder="Ողջ Սյունիք"
          anyLabel="Ողջ Սյունիք"
        />
      </FilterSection>

      <FilterSection title="Հայտարարություններ">
        <ToggleRow
          label="Միայն նկարով"
          checked={filters.withPhoto}
          onChange={(withPhoto) => onChange({ withPhoto })}
        />
        <ToggleRow
          label="Միայն ստուգված հայտարարություններ"
          hint="Վաճառողն ու փաստաթղթերը հաստատված են"
          checked={filters.verifiedOnly}
          onChange={(verifiedOnly) => onChange({ verifiedOnly })}
        />
        <ToggleRow
          label="Առանց ավարիայի"
          checked={filters.accidentFree}
          onChange={(accidentFree) => onChange({ accidentFree })}
        />
      </FilterSection>
    </>
  );
}

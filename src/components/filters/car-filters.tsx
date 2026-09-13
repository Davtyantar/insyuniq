"use client";

import {
  ChipGroup,
  FieldLabel,
  FilterSection,
  MultiSelectField,
  PriceRangeField,
  RangeFields,
  SelectField,
  ToggleRow,
  type PriceBounds,
} from "@/components/filters/filter-fields";
import type { CarFilters } from "@/lib/types";

/** In USD. */
const PRICE_BOUNDS: PriceBounds = { min: 0, max: 100000, step: 500 };
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
  /** Phone drawer: collapses the secondary sections by default. Desktop sidebar is unchanged. */
  mobile?: boolean;
}

export function CarFilterFields({ filters, onChange, mobile = false }: Props) {
  const models = (CAR_BRANDS[filters.brand] ?? []).map((m) => ({ value: m, label: m }));

  return (
    <>
      <FilterSection title="Տրանսպորտի տեսակ" defaultOpen={!mobile}>
        <SelectField
          value={filters.subcategory}
          onChange={(subcategory) => onChange({ subcategory })}
          options={CAR_SUBCATEGORIES}
          placeholder="Ցանկացած տեսակ"
          anyLabel="Ցանկացած տեսակ"
        />
      </FilterSection>

      <FilterSection title="Մակնիշ և մոդել" defaultOpen={!mobile}>
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

      <FilterSection title="Թողարկման տարի" defaultOpen={!mobile}>
        <RangeFields
          from={filters.yearMin}
          to={filters.yearMax}
          onFrom={(yearMin) => onChange({ yearMin })}
          onTo={(yearMax) => onChange({ yearMax })}
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

      <FilterSection title="Վազք, կմ" defaultOpen={!mobile}>
        <RangeFields
          from={filters.mileageMin}
          to={filters.mileageMax}
          onFrom={(mileageMin) => onChange({ mileageMin })}
          onTo={(mileageMax) => onChange({ mileageMax })}
        />
      </FilterSection>

      <FilterSection title="Թափքի տեսակ" defaultOpen={!mobile}>
        <SelectField
          value={filters.bodyType[0] ?? ""}
          onChange={(value) => onChange({ bodyType: value ? [value] : [] })}
          options={BODY_TYPES}
          placeholder="Ցանկացած թափք"
          anyLabel="Ցանկացած թափք"
        />
      </FilterSection>

      <FilterSection title="Շարժիչ" defaultOpen={!mobile}>
        <SelectField
          value={filters.fuel[0] ?? ""}
          onChange={(value) => onChange({ fuel: value ? [value] : [] })}
          options={FUEL_TYPES}
          placeholder="Ցանկացած շարժիչ"
          anyLabel="Ցանկացած շարժիչ"
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

      <FilterSection title="Փոխանցումատուփ" defaultOpen={!mobile}>
        <SelectField
          value={filters.transmission[0] ?? ""}
          onChange={(value) => onChange({ transmission: value ? [value] : [] })}
          options={TRANSMISSIONS}
          placeholder="Ցանկացած փոխանցումատուփ"
          anyLabel="Ցանկացած փոխանցումատուփ"
        />
      </FilterSection>

      <FilterSection title="Քարշակ" defaultOpen={!mobile}>
        <ChipGroup
          options={DRIVE_TYPES}
          values={filters.drive}
          onChange={(drive) => onChange({ drive })}
          multiple
        />
      </FilterSection>

      <FilterSection title="Գույն" defaultOpen={!mobile}>
        <SelectField
          value={filters.color}
          onChange={(color) => onChange({ color })}
          options={CAR_COLORS}
          placeholder="Ցանկացած գույն"
          anyLabel="Ցանկացած գույն"
        />
      </FilterSection>

      <FilterSection title="Վիճակ և սեփականատերեր" defaultOpen={!mobile}>
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
        <ToggleRow
          label="Առանց ավարիայի"
          checked={filters.accidentFree}
          onChange={(accidentFree) => onChange({ accidentFree })}
        />
      </FilterSection>
    </>
  );
}

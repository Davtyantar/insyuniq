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
import type { RealEstateFilters } from "@/lib/types";
import {
  BUILDING_TYPES,
  CITIES,
  DISTRICTS,
  REAL_ESTATE_SUBCATEGORIES,
  RE_CONDITIONS,
  ROOMS_OPTIONS,
} from "@/mock/taxonomy";

/** In USD — real estate sale prices span a much wider range than any other category. */
const PRICE_BOUNDS: PriceBounds = { min: 0, max: 300000, step: 1000 };

interface Props {
  filters: RealEstateFilters;
  onChange: (patch: Partial<RealEstateFilters>) => void;
  /** Phone drawer: every section starts collapsed so the sheet opens as a compact,
   * tap-to-expand list instead of a long scroll of always-open fields. Desktop sidebar
   * keeps everything expanded. */
  mobile?: boolean;
}

export function RealEstateFilterFields({ filters, onChange, mobile = false }: Props) {
  const isLand = filters.subcategory === "land";
  const isGarage = filters.subcategory === "garages";
  const districts = Array.from(
    new Set(filters.city.flatMap((city) => DISTRICTS[city] ?? [])),
  ).map((d) => ({ value: d, label: d }));

  const locationFields = (
    <>
      <div>
        <FieldLabel>Քաղաք</FieldLabel>
        <MultiSelectField
          values={filters.city}
          onChange={(city) => onChange({ city, district: "" })}
          options={CITIES}
          placeholder="Ողջ Սյունիք"
          anyLabel="Ողջ Սյունիք"
        />
      </div>
      {filters.city.length <= 1 && (
        <div>
          <FieldLabel>Թաղամաս</FieldLabel>
          <SelectField
            value={filters.district}
            onChange={(district) => onChange({ district })}
            options={districts}
            placeholder={filters.city.length ? "Ցանկացած թաղամաս" : "Նախ ընտրեք քաղաքը"}
            anyLabel="Ցանկացած թաղամաս"
            disabled={!filters.city.length}
          />
        </div>
      )}
    </>
  );

  return (
    <>
      <FilterSection title="Անշարժ գույքի տեսակ" defaultOpen={!mobile}>
        <SelectField
          value={filters.subcategory}
          onChange={(subcategory) => onChange({ subcategory })}
          options={REAL_ESTATE_SUBCATEGORIES}
          placeholder="Ցանկացած տեսակ"
          anyLabel="Ցանկացած տեսակ"
        />
      </FilterSection>

      <FilterSection title="Տեղադրություն" defaultOpen={!mobile}>
        {locationFields}
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

      {!isLand && !isGarage && (
        <FilterSection title="Սենյակներ" defaultOpen={!mobile}>
          <ChipGroup
            options={ROOMS_OPTIONS}
            values={filters.rooms}
            onChange={(rooms) => onChange({ rooms })}
            multiple
          />
        </FilterSection>
      )}

      <FilterSection title="Մակերես, մ²" defaultOpen={!mobile}>
        <RangeFields
          from={filters.areaMin}
          to={filters.areaMax}
          onFrom={(areaMin) => onChange({ areaMin })}
          onTo={(areaMax) => onChange({ areaMax })}
        />
      </FilterSection>

      {!isLand && !isGarage && (
        <FilterSection title="Հարկ" defaultOpen={!mobile}>
          <RangeFields
            from={filters.floorMin}
            to={filters.floorMax}
            onFrom={(floorMin) => onChange({ floorMin })}
            onTo={(floorMax) => onChange({ floorMax })}
          />
        </FilterSection>
      )}

      {!isLand && (
        <FilterSection title="Վիճակ" defaultOpen={!mobile}>
          <SelectField
            value={filters.condition[0] ?? ""}
            onChange={(value) => onChange({ condition: value ? [value] : [] })}
            options={RE_CONDITIONS}
            placeholder="Ցանկացած վիճակ"
            anyLabel="Ցանկացած վիճակ"
          />
        </FilterSection>
      )}

      {!isLand && !isGarage && (
        <FilterSection title="Շենքի տեսակ" defaultOpen={!mobile}>
          <ChipGroup
            options={BUILDING_TYPES}
            values={filters.buildingType ? [filters.buildingType] : []}
            onChange={(values) =>
              onChange({ buildingType: (values[0] ?? "") as RealEstateFilters["buildingType"] })
            }
          />
        </FilterSection>
      )}

      {!isLand && (
        <FilterSection title="Հարմարություններ" defaultOpen={!mobile}>
          <ToggleRow
            label="Կահույք"
            checked={filters.furniture}
            onChange={(furniture) => onChange({ furniture })}
          />
          <ToggleRow
            label="Պատշգամբ"
            checked={filters.balcony}
            onChange={(balcony) => onChange({ balcony })}
          />
          <ToggleRow
            label="Կայանատեղի"
            checked={filters.parking}
            onChange={(parking) => onChange({ parking })}
          />
        </FilterSection>
      )}

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

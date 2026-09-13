"use client";

import {
  ChipGroup,
  FieldLabel,
  FilterSection,
  MultiSelectField,
  RangeFields,
  SelectField,
  ToggleRow,
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

interface Props {
  filters: RealEstateFilters;
  onChange: (patch: Partial<RealEstateFilters>) => void;
  /** Phone drawer: collapses the secondary sections by default and drops the "Location" header
   * (the "City"/"District" field labels already say what they are). Desktop sidebar is unchanged. */
  mobile?: boolean;
}

export function RealEstateFilterFields({ filters, onChange, mobile = false }: Props) {
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
      <FilterSection title="Անշարժ գույքի տեսակ">
        <SelectField
          value={filters.subcategory}
          onChange={(subcategory) => onChange({ subcategory })}
          options={REAL_ESTATE_SUBCATEGORIES}
          placeholder="Ցանկացած տեսակ"
          anyLabel="Ցանկացած տեսակ"
        />
      </FilterSection>

      {mobile ? (
        <div className="space-y-3 border-b border-border py-4">{locationFields}</div>
      ) : (
        <FilterSection title="Տեղադրություն">{locationFields}</FilterSection>
      )}

      <FilterSection title="Գին, $" defaultOpen={!mobile}>
        <RangeFields
          from={filters.priceMin}
          to={filters.priceMax}
          onFrom={(priceMin) => onChange({ priceMin })}
          onTo={(priceMax) => onChange({ priceMax })}
        />
      </FilterSection>

      <FilterSection title="Սենյակներ" defaultOpen={!mobile}>
        <ChipGroup
          options={ROOMS_OPTIONS}
          values={filters.rooms}
          onChange={(rooms) => onChange({ rooms })}
          multiple
        />
      </FilterSection>

      <FilterSection title="Մակերես, մ²" defaultOpen={!mobile}>
        <RangeFields
          from={filters.areaMin}
          to={filters.areaMax}
          onFrom={(areaMin) => onChange({ areaMin })}
          onTo={(areaMax) => onChange({ areaMax })}
        />
      </FilterSection>

      <FilterSection title="Վիճակ" defaultOpen={false}>
        <SelectField
          value={filters.condition[0] ?? ""}
          onChange={(value) => onChange({ condition: value ? [value] : [] })}
          options={RE_CONDITIONS}
          placeholder="Ցանկացած վիճակ"
          anyLabel="Ցանկացած վիճակ"
        />
      </FilterSection>

      <FilterSection title="Շենքի տեսակ" defaultOpen={false}>
        <ChipGroup
          options={BUILDING_TYPES}
          values={filters.buildingType ? [filters.buildingType] : []}
          onChange={(values) =>
            onChange({ buildingType: (values[0] ?? "") as RealEstateFilters["buildingType"] })
          }
        />
      </FilterSection>

      <FilterSection title="Հարմարություններ" defaultOpen={false}>
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

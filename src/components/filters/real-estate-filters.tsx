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
      <FilterSection title="Անշարժ գույքի տեսակ">
        <SelectField
          value={filters.subcategory}
          onChange={(subcategory) => onChange({ subcategory })}
          options={REAL_ESTATE_SUBCATEGORIES}
          placeholder="Ցանկացած տեսակ"
          anyLabel="Ցանկացած տեսակ"
        />
      </FilterSection>

      <FilterSection title="Գործարքի տեսակ">
        <ChipGroup
          options={DEAL_TYPES}
          values={filters.deal ? [filters.deal] : []}
          onChange={(values) => onChange({ deal: (values[0] ?? "") as RealEstateFilters["deal"] })}
        />
      </FilterSection>

      <FilterSection title="Տեղադրություն">
        <div>
          <FieldLabel>Քաղաք</FieldLabel>
          <SelectField
            value={filters.city}
            onChange={(city) => onChange({ city, district: "" })}
            options={CITIES}
            placeholder="Ողջ Սյունիք"
            anyLabel="Ողջ Սյունիք"
          />
        </div>
        <div>
          <FieldLabel>Թաղամաս</FieldLabel>
          <SelectField
            value={filters.district}
            onChange={(district) => onChange({ district })}
            options={districts}
            placeholder={filters.city ? "Ցանկացած թաղամաս" : "Նախ ընտրեք քաղաքը"}
            anyLabel="Ցանկացած թաղամաս"
            disabled={!filters.city}
          />
        </div>
      </FilterSection>

      <FilterSection title="Գին, $">
        <RangeFields
          from={filters.priceMin}
          to={filters.priceMax}
          onFrom={(priceMin) => onChange({ priceMin })}
          onTo={(priceMax) => onChange({ priceMax })}
        />
      </FilterSection>

      <FilterSection title="Սենյակներ">
        <ChipGroup
          options={ROOMS_OPTIONS}
          values={filters.rooms}
          onChange={(rooms) => onChange({ rooms })}
          multiple
        />
      </FilterSection>

      <FilterSection title="Մակերես, մ²">
        <RangeFields
          from={filters.areaMin}
          to={filters.areaMax}
          onFrom={(areaMin) => onChange({ areaMin })}
          onTo={(areaMax) => onChange({ areaMax })}
        />
      </FilterSection>

      <FilterSection title="Հարկ" defaultOpen={false}>
        <div>
          <FieldLabel>Բնակարանի հարկը</FieldLabel>
          <RangeFields
            from={filters.floorMin}
            to={filters.floorMax}
            onFrom={(floorMin) => onChange({ floorMin })}
            onTo={(floorMax) => onChange({ floorMax })}
          />
        </div>
        <div>
          <FieldLabel>Շենքի հարկայնությունը, ոչ պակաս</FieldLabel>
          <RangeFields
            from={filters.totalFloorsMin}
            to=""
            onFrom={(totalFloorsMin) => onChange({ totalFloorsMin })}
            onTo={() => undefined}
            fromPlaceholder="սկսած"
            toPlaceholder="—"
          />
        </div>
      </FilterSection>

      <FilterSection title="Վիճակ" defaultOpen={false}>
        <CheckboxList
          options={RE_CONDITIONS}
          values={filters.condition}
          onChange={(condition) => onChange({ condition })}
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

      <FilterSection title="Հայտարարություններ">
        <ToggleRow
          label="Միայն նկարով"
          checked={filters.withPhoto}
          onChange={(withPhoto) => onChange({ withPhoto })}
        />
        <ToggleRow
          label="Միայն ստուգված հայտարարություններ"
          hint="Փաստաթղթերն ու հասցեն հաստատված են մոդերատորի կողմից"
          checked={filters.verifiedOnly}
          onChange={(verifiedOnly) => onChange({ verifiedOnly })}
        />
      </FilterSection>
    </>
  );
}

"use client";

import {
  ChipGroup,
  FilterSection,
  MultiSelectField,
  PriceRangeField,
  RangeFields,
  SelectField,
  ToggleRow,
  type PriceBounds,
} from "@/components/filters/filter-fields";
import { cityValues } from "@/lib/api/schema";
import type { City, Facets } from "@/lib/api/types";
import { CITY_LABEL, DISTRICT_LABEL, districtsOf } from "@/lib/geo";
import { PROPERTY_DOORS, type PropertyDoor } from "@/lib/property-doors";
import type { PropertyFilters } from "@/lib/property-filters";
import { BUILDING_TYPES, RE_CONDITIONS, ROOMS_OPTIONS } from "@/mock/taxonomy";

/** Slider range in USD per door; the typed inputs accept any value. */
const PRICE_BOUNDS: Record<PropertyDoor, PriceBounds> = {
  "real-estate": { min: 0, max: 300000, step: 1000 },
  rentals: { min: 0, max: 3000, step: 50 },
  hotels: { min: 0, max: 500, step: 10 },
};

/** Subcategories that have no room count in the contract (rooms is forbidden or meaningless). */
const NO_ROOMS = new Set(["land", "garages", "commercial", "hotels"]);
const WITH_FLOORS = new Set(["", "apartments", "new-buildings", "commercial"]);

const withCount = (text: string, count: number | undefined) => (count === undefined ? text : `${text} (${count})`);

interface Props {
  door: PropertyDoor;
  filters: PropertyFilters;
  onChange: (patch: Partial<PropertyFilters>) => void;
  facets: Facets;
  mobile?: boolean;
}

export function PropertyFilterFields({ door, filters, onChange, facets, mobile = false }: Props) {
  const open = !mobile;
  const subcategoryOptions = PROPERTY_DOORS[door].subcategories.map((option) => ({
    value: option.value,
    label: withCount(option.label, facets.subcategory?.[option.value]),
    icon: option.icon,
  }));
  const cityOptions = cityValues.map((city) => ({ value: city, label: withCount(CITY_LABEL[city], facets.city?.[city]) }));
  const districtOptions = districtsOf(filters.city).map((district) => ({ value: district, label: DISTRICT_LABEL[district] }));
  const conditionOptions = RE_CONDITIONS.map((option) => ({
    ...option,
    label: withCount(option.label, facets.condition?.[option.value]),
  }));

  return (
    <>
      <FilterSection title="Տեսակ" defaultOpen={open}>
        <SelectField
          value={filters.subcategory}
          onChange={(value) => onChange({ subcategory: value as PropertyFilters["subcategory"] })}
          options={subcategoryOptions}
          placeholder="Ցանկացած տեսակ"
          anyLabel="Ցանկացած տեսակ"
        />
      </FilterSection>

      <FilterSection title="Տեղադրություն" defaultOpen={open}>
        <MultiSelectField
          values={filters.city}
          onChange={(city) => onChange({ city: city as City[], district: "" })}
          options={cityOptions}
          placeholder="Ողջ Սյունիք"
          anyLabel="Ողջ Սյունիք"
        />
        {districtOptions.length > 0 && (
          <div className="mt-3">
            <SelectField
              value={filters.district}
              onChange={(value) => onChange({ district: value as PropertyFilters["district"] })}
              options={districtOptions}
              placeholder="Բոլոր թաղամասերը"
              anyLabel="Բոլոր թաղամասերը"
            />
          </div>
        )}
      </FilterSection>

      <FilterSection title="Գին" defaultOpen={open}>
        <PriceRangeField
          currency={filters.cur || "USD"}
          onCurrencyChange={(currency) => onChange({ cur: currency === "AMD" ? "AMD" : "USD" })}
          from={filters.priceMin}
          to={filters.priceMax}
          onFrom={(priceMin) => onChange({ priceMin })}
          onTo={(priceMax) => onChange({ priceMax })}
          bounds={PRICE_BOUNDS[door]}
        />
      </FilterSection>

      {!NO_ROOMS.has(filters.subcategory) && (
        <FilterSection title="Սենյակներ" defaultOpen={open}>
          <ChipGroup
            options={ROOMS_OPTIONS}
            values={filters.rooms}
            onChange={(rooms) => onChange({ rooms: rooms as PropertyFilters["rooms"] })}
            multiple
            fullWidth
          />
        </FilterSection>
      )}

      <FilterSection title="Մակերես" defaultOpen={open}>
        <RangeFields
          from={filters.areaMin}
          to={filters.areaMax}
          onFrom={(areaMin) => onChange({ areaMin })}
          onTo={(areaMax) => onChange({ areaMax })}
          suffix="մ²"
        />
      </FilterSection>

      {WITH_FLOORS.has(filters.subcategory) && (
        <FilterSection title="Հարկ" defaultOpen={open}>
          <RangeFields
            from={filters.floorMin}
            to={filters.floorMax}
            onFrom={(floorMin) => onChange({ floorMin })}
            onTo={(floorMax) => onChange({ floorMax })}
          />
        </FilterSection>
      )}

      {door === "real-estate" && (
        <FilterSection title="Վիճակ" defaultOpen={open}>
          <ChipGroup
            options={conditionOptions}
            values={filters.condition}
            onChange={(condition) => onChange({ condition: condition as PropertyFilters["condition"] })}
            multiple
          />
          <div className="mt-3">
            <ChipGroup
              options={BUILDING_TYPES}
              values={filters.buildingType ? [filters.buildingType] : []}
              onChange={(values) => onChange({ buildingType: (values[0] ?? "") as PropertyFilters["buildingType"] })}
              fullWidth
            />
          </div>
        </FilterSection>
      )}

      <FilterSection title="Հարմարություններ" defaultOpen={open}>
        <div className="space-y-1">
          <ToggleRow label="Կահույք" checked={filters.furniture} onChange={(furniture) => onChange({ furniture })} />
          <ToggleRow label="Պատշգամբ" checked={filters.balcony} onChange={(balcony) => onChange({ balcony })} />
          <ToggleRow label="Կայանատեղի" checked={filters.parking} onChange={(parking) => onChange({ parking })} />
          {door === "hotels" && (
            <ToggleRow label="Լողավազան" checked={filters.pool} onChange={(pool) => onChange({ pool })} />
          )}
          <ToggleRow label="Միայն լուսանկարով" checked={filters.withPhoto} onChange={(withPhoto) => onChange({ withPhoto })} />
          <ToggleRow
            label="Միայն ստուգվածները"
            checked={filters.verifiedOnly}
            onChange={(verifiedOnly) => onChange({ verifiedOnly })}
          />
        </div>
      </FilterSection>
    </>
  );
}

"use client";

import { Field, StepHeader } from "@/components/create/field";
import { ChipGroup, SelectField, ToggleRow } from "@/components/filters/filter-fields";
import { Input } from "@/components/ui/input";
import type { ListingDraft } from "@/lib/draft";
import {
  BODY_TYPES,
  BUILDING_TYPES,
  CAR_BRANDS,
  CAR_BRAND_OPTIONS,
  CAR_COLORS,
  CITIES,
  DISTRICTS,
  DRIVE_TYPES,
  FUEL_TYPES,
  RE_CONDITIONS,
  ROOMS_OPTIONS,
  STEERING_TYPES,
  TRANSMISSIONS,
} from "@/mock/taxonomy";

interface StepProps {
  draft: ListingDraft;
  patch: (patch: Partial<ListingDraft>) => void;
}

const digits = (value: string) => value.replace(/[^\d.]/g, "");

function LocationFields({ draft, patch }: StepProps) {
  const districts = (DISTRICTS[draft.city] ?? []).map((d) => ({ value: d, label: d }));
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Field label="Город" required>
        <SelectField
          value={draft.city}
          onChange={(city) => patch({ city, district: "" })}
          options={CITIES}
          placeholder="Выберите город"
          anyLabel="Не выбран"
        />
      </Field>
      <Field label="Район">
        <SelectField
          value={draft.district}
          onChange={(district) => patch({ district })}
          options={districts}
          placeholder={draft.city ? "Выберите район" : "Сначала город"}
          anyLabel="Не выбран"
          disabled={!draft.city}
        />
      </Field>
      <Field label="Адрес">
        <Input
          value={draft.address}
          onChange={(event) => patch({ address: event.target.value })}
          placeholder="Улица и номер дома"
        />
      </Field>
    </div>
  );
}

export function StepSpecs({ draft, patch }: StepProps) {
  if (draft.category === "cars") {
    const models = (CAR_BRANDS[draft.brand] ?? []).map((m) => ({ value: m, label: m }));
    return (
      <div className="space-y-6">
        <StepHeader
          title="Характеристики автомобиля"
          description="Чем точнее данные, тем выше доверие покупателей."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Марка" required>
            <SelectField
              value={draft.brand}
              onChange={(brand) => patch({ brand, model: "" })}
              options={CAR_BRAND_OPTIONS}
              placeholder="Выберите марку"
              anyLabel="Не выбрана"
            />
          </Field>
          <Field label="Модель" required>
            <SelectField
              value={draft.model}
              onChange={(model) => patch({ model })}
              options={models}
              placeholder={draft.brand ? "Выберите модель" : "Сначала марка"}
              anyLabel="Не выбрана"
              disabled={!draft.brand}
            />
          </Field>
          <Field label="Год выпуска" required>
            <Input
              value={draft.year}
              inputMode="numeric"
              onChange={(event) => patch({ year: digits(event.target.value) })}
              placeholder="Например, 2021"
            />
          </Field>
          <Field label="Пробег, км">
            <Input
              value={draft.mileage}
              inputMode="numeric"
              onChange={(event) => patch({ mileage: digits(event.target.value) })}
              placeholder="Например, 72000"
            />
          </Field>
        </div>

        <Field label="Тип кузова">
          <SelectField
            value={draft.bodyType}
            onChange={(bodyType) => patch({ bodyType: bodyType as ListingDraft["bodyType"] })}
            options={BODY_TYPES}
            placeholder="Выберите кузов"
            anyLabel="Не выбран"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Двигатель">
            <SelectField
              value={draft.fuel}
              onChange={(fuel) => patch({ fuel: fuel as ListingDraft["fuel"] })}
              options={FUEL_TYPES}
              placeholder="Тип топлива"
              anyLabel="Не выбран"
            />
          </Field>
          <Field label="Объём, л">
            <Input
              value={draft.engineVolume}
              inputMode="decimal"
              onChange={(event) => patch({ engineVolume: digits(event.target.value) })}
              placeholder="2.5"
            />
          </Field>
          <Field label="Мощность, л.с.">
            <Input
              value={draft.power}
              inputMode="numeric"
              onChange={(event) => patch({ power: digits(event.target.value) })}
              placeholder="200"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Коробка передач">
            <SelectField
              value={draft.transmission}
              onChange={(transmission) =>
                patch({ transmission: transmission as ListingDraft["transmission"] })
              }
              options={TRANSMISSIONS}
              placeholder="Выберите коробку"
              anyLabel="Не выбрана"
            />
          </Field>
          <Field label="Привод">
            <ChipGroup
              options={DRIVE_TYPES}
              values={draft.drive ? [draft.drive] : []}
              onChange={(values) => patch({ drive: (values[0] ?? "") as ListingDraft["drive"] })}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Цвет">
            <SelectField
              value={draft.color}
              onChange={(color) => patch({ color })}
              options={CAR_COLORS}
              placeholder="Выберите цвет"
              anyLabel="Не выбран"
            />
          </Field>
          <Field label="Руль">
            <ChipGroup
              options={STEERING_TYPES}
              values={[draft.steering]}
              onChange={(values) =>
                patch({ steering: (values[0] ?? "left") as ListingDraft["steering"] })
              }
            />
          </Field>
          <Field label="Владельцев по ПТС">
            <Input
              value={draft.owners}
              inputMode="numeric"
              onChange={(event) => patch({ owners: digits(event.target.value) })}
            />
          </Field>
        </div>

        <ToggleRow
          label="Автомобиль не участвовал в ДТП"
          checked={draft.accidentFree}
          onChange={(accidentFree) => patch({ accidentFree })}
        />

        <LocationFields draft={draft} patch={patch} />
      </div>
    );
  }

  const isLand = draft.subcategory === "land";

  return (
    <div className="space-y-6">
      <StepHeader
        title="Характеристики объекта"
        description="Укажите параметры — они попадут в карточку и в фильтры поиска."
      />

      {!isLand && (
        <Field label="Количество комнат">
          <ChipGroup
            options={ROOMS_OPTIONS}
            values={draft.rooms ? [draft.rooms] : []}
            onChange={(values) => patch({ rooms: values[0] ?? "" })}
          />
        </Field>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={isLand ? "Площадь участка, м²" : "Общая площадь, м²"} required>
          <Input
            value={draft.area}
            inputMode="numeric"
            onChange={(event) => patch({ area: digits(event.target.value) })}
            placeholder="68"
          />
        </Field>
        {isLand ? (
          <Field label="Соток">
            <Input
              value={draft.landArea}
              inputMode="numeric"
              onChange={(event) => patch({ landArea: digits(event.target.value) })}
              placeholder="12"
            />
          </Field>
        ) : (
          <>
            <Field label="Этаж">
              <Input
                value={draft.floor}
                inputMode="numeric"
                onChange={(event) => patch({ floor: digits(event.target.value) })}
                placeholder="7"
              />
            </Field>
            <Field label="Этажность дома">
              <Input
                value={draft.totalFloors}
                inputMode="numeric"
                onChange={(event) => patch({ totalFloors: digits(event.target.value) })}
                placeholder="14"
              />
            </Field>
          </>
        )}
      </div>

      {!isLand && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Санузлов">
              <Input
                value={draft.bathrooms}
                inputMode="numeric"
                onChange={(event) => patch({ bathrooms: digits(event.target.value) })}
              />
            </Field>
            <Field label="Год постройки">
              <Input
                value={draft.buildYear}
                inputMode="numeric"
                onChange={(event) => patch({ buildYear: digits(event.target.value) })}
                placeholder="2022"
              />
            </Field>
            <Field label="Высота потолков, м">
              <Input
                value={draft.ceilingHeight}
                inputMode="decimal"
                onChange={(event) => patch({ ceilingHeight: digits(event.target.value) })}
                placeholder="3"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Состояние">
              <SelectField
                value={draft.reCondition}
                onChange={(reCondition) =>
                  patch({ reCondition: reCondition as ListingDraft["reCondition"] })
                }
                options={RE_CONDITIONS}
                placeholder="Выберите состояние"
                anyLabel="Не выбрано"
              />
            </Field>
            <Field label="Тип дома">
              <ChipGroup
                options={BUILDING_TYPES}
                values={[draft.buildingType]}
                onChange={(values) =>
                  patch({ buildingType: (values[0] ?? "secondary") as ListingDraft["buildingType"] })
                }
              />
            </Field>
          </div>

          <Field label="Дополнительно">
            <div className="space-y-2.5">
              <ToggleRow
                label="Мебель"
                checked={draft.furniture}
                onChange={(furniture) => patch({ furniture })}
              />
              <ToggleRow
                label="Балкон"
                checked={draft.balcony}
                onChange={(balcony) => patch({ balcony })}
              />
              <ToggleRow
                label="Парковка"
                checked={draft.parking}
                onChange={(parking) => patch({ parking })}
              />
            </div>
          </Field>
        </>
      )}

      <LocationFields draft={draft} patch={patch} />
    </div>
  );
}

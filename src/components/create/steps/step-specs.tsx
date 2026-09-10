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
      <Field label="Քաղաք" required>
        <SelectField
          value={draft.city}
          onChange={(city) => patch({ city, district: "" })}
          options={CITIES}
          placeholder="Ընտրեք քաղաքը"
          anyLabel="Ընտրված չէ"
        />
      </Field>
      <Field label="Թաղամաս">
        <SelectField
          value={draft.district}
          onChange={(district) => patch({ district })}
          options={districts}
          placeholder={draft.city ? "Ընտրեք թաղամասը" : "Նախ ընտրեք քաղաքը"}
          anyLabel="Ընտրված չէ"
          disabled={!draft.city}
        />
      </Field>
      <Field label="Հասցե">
        <Input
          value={draft.address}
          onChange={(event) => patch({ address: event.target.value })}
          placeholder="Փողոց և տան համար"
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
          title="Ավտոմեքենայի բնութագրերը"
          description="Որքան ճշգրիտ են տվյալները, այնքան բարձր է գնորդների վստահությունը։"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Մակնիշ" required>
            <SelectField
              value={draft.brand}
              onChange={(brand) => patch({ brand, model: "" })}
              options={CAR_BRAND_OPTIONS}
              placeholder="Ընտրեք մակնիշը"
              anyLabel="Ընտրված չէ"
            />
          </Field>
          <Field label="Մոդել" required>
            <SelectField
              value={draft.model}
              onChange={(model) => patch({ model })}
              options={models}
              placeholder={draft.brand ? "Ընտրեք մոդելը" : "Նախ ընտրեք մակնիշը"}
              anyLabel="Ընտրված չէ"
              disabled={!draft.brand}
            />
          </Field>
          <Field label="Թողարկման տարի" required>
            <Input
              value={draft.year}
              inputMode="numeric"
              onChange={(event) => patch({ year: digits(event.target.value) })}
              placeholder="Օրինակ՝ 2021"
            />
          </Field>
          <Field label="Վազք, կմ">
            <Input
              value={draft.mileage}
              inputMode="numeric"
              onChange={(event) => patch({ mileage: digits(event.target.value) })}
              placeholder="Օրինակ՝ 72000"
            />
          </Field>
        </div>

        <Field label="Թափքի տեսակ">
          <SelectField
            value={draft.bodyType}
            onChange={(bodyType) => patch({ bodyType: bodyType as ListingDraft["bodyType"] })}
            options={BODY_TYPES}
            placeholder="Ընտրեք թափքը"
            anyLabel="Ընտրված չէ"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Շարժիչ">
            <SelectField
              value={draft.fuel}
              onChange={(fuel) => patch({ fuel: fuel as ListingDraft["fuel"] })}
              options={FUEL_TYPES}
              placeholder="Վառելիքի տեսակ"
              anyLabel="Ընտրված չէ"
            />
          </Field>
          <Field label="Ծավալ, լ">
            <Input
              value={draft.engineVolume}
              inputMode="decimal"
              onChange={(event) => patch({ engineVolume: digits(event.target.value) })}
              placeholder="2.5"
            />
          </Field>
          <Field label="Հզորություն, ձ.ու.">
            <Input
              value={draft.power}
              inputMode="numeric"
              onChange={(event) => patch({ power: digits(event.target.value) })}
              placeholder="200"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Փոխանցումատուփ">
            <SelectField
              value={draft.transmission}
              onChange={(transmission) =>
                patch({ transmission: transmission as ListingDraft["transmission"] })
              }
              options={TRANSMISSIONS}
              placeholder="Ընտրեք փոխանցումատուփը"
              anyLabel="Ընտրված չէ"
            />
          </Field>
          <Field label="Քարշակ">
            <ChipGroup
              options={DRIVE_TYPES}
              values={draft.drive ? [draft.drive] : []}
              onChange={(values) => patch({ drive: (values[0] ?? "") as ListingDraft["drive"] })}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Գույն">
            <SelectField
              value={draft.color}
              onChange={(color) => patch({ color })}
              options={CAR_COLORS}
              placeholder="Ընտրեք գույնը"
              anyLabel="Ընտրված չէ"
            />
          </Field>
          <Field label="Ղեկ">
            <ChipGroup
              options={STEERING_TYPES}
              values={[draft.steering]}
              onChange={(values) =>
                patch({ steering: (values[0] ?? "left") as ListingDraft["steering"] })
              }
            />
          </Field>
          <Field label="Սեփականատերեր՝ ըստ վկայագրի">
            <Input
              value={draft.owners}
              inputMode="numeric"
              onChange={(event) => patch({ owners: digits(event.target.value) })}
            />
          </Field>
        </div>

        <ToggleRow
          label="Ավտոմեքենան չի մասնակցել ավարիայի"
          checked={draft.accidentFree}
          onChange={(accidentFree) => patch({ accidentFree })}
        />

        <LocationFields draft={draft} patch={patch} />
      </div>
    );
  }

  if (draft.category === "rentals" || draft.category === "hotels") {
    const isHotel = draft.subcategory === "hotels";
    const noRoomCount =
      draft.subcategory === "hotels" ||
      draft.subcategory === "garages" ||
      draft.subcategory === "commercial";
    return (
      <div className="space-y-6">
        <StepHeader
          title={isHotel ? "Համարի բնութագրերը" : "Բնակատեղիի բնութագրերը"}
          description="Նշեք պարամետրերը — դրանք կհայտնվեն քարտում և որոնման ֆիլտրերում։"
        />

        {!noRoomCount && (
          <Field label="Սենյակների քանակը">
            <ChipGroup
              options={ROOMS_OPTIONS}
              values={draft.rooms ? [draft.rooms] : []}
              onChange={(values) => patch({ rooms: values[0] ?? "" })}
            />
          </Field>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Մակերես, մ²" required>
            <Input
              value={draft.area}
              inputMode="numeric"
              onChange={(event) => patch({ area: digits(event.target.value) })}
              placeholder="45"
            />
          </Field>
          <Field label="Հարկ">
            <Input
              value={draft.floor}
              inputMode="numeric"
              onChange={(event) => patch({ floor: digits(event.target.value) })}
              placeholder="2"
            />
          </Field>
          <Field label="Շենքի հարկայնությունը">
            <Input
              value={draft.totalFloors}
              inputMode="numeric"
              onChange={(event) => patch({ totalFloors: digits(event.target.value) })}
              placeholder="4"
            />
          </Field>
        </div>

        <Field label="Սանհանգույցներ">
          <Input
            value={draft.bathrooms}
            inputMode="numeric"
            onChange={(event) => patch({ bathrooms: digits(event.target.value) })}
          />
        </Field>

        <Field label="Հարմարություններ">
          <div className="space-y-2.5">
            <ToggleRow
              label="Կահույք"
              checked={draft.furniture}
              onChange={(furniture) => patch({ furniture })}
            />
            <ToggleRow
              label="Պատշգամբ"
              checked={draft.balcony}
              onChange={(balcony) => patch({ balcony })}
            />
            <ToggleRow
              label="Կայանատեղի"
              checked={draft.parking}
              onChange={(parking) => patch({ parking })}
            />
            {draft.category === "hotels" && (
              <ToggleRow
                label="Լողավազան"
                checked={draft.pool}
                onChange={(pool) => patch({ pool })}
              />
            )}
          </div>
        </Field>

        <LocationFields draft={draft} patch={patch} />
      </div>
    );
  }

  const isLand = draft.subcategory === "land";

  return (
    <div className="space-y-6">
      <StepHeader
        title="Օբյեկտի բնութագրերը"
        description="Նշեք պարամետրերը — դրանք կհայտնվեն քարտում և որոնման ֆիլտրերում։"
      />

      {!isLand && (
        <Field label="Սենյակների քանակը">
          <ChipGroup
            options={ROOMS_OPTIONS}
            values={draft.rooms ? [draft.rooms] : []}
            onChange={(values) => patch({ rooms: values[0] ?? "" })}
          />
        </Field>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={isLand ? "Հողատարածքի մակերես, մ²" : "Ընդհանուր մակերես, մ²"} required>
          <Input
            value={draft.area}
            inputMode="numeric"
            onChange={(event) => patch({ area: digits(event.target.value) })}
            placeholder="68"
          />
        </Field>
        {isLand ? (
          <Field label="Սոտկա">
            <Input
              value={draft.landArea}
              inputMode="numeric"
              onChange={(event) => patch({ landArea: digits(event.target.value) })}
              placeholder="12"
            />
          </Field>
        ) : (
          <>
            <Field label="Հարկ">
              <Input
                value={draft.floor}
                inputMode="numeric"
                onChange={(event) => patch({ floor: digits(event.target.value) })}
                placeholder="7"
              />
            </Field>
            <Field label="Շենքի հարկայնությունը">
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
            <Field label="Սանհանգույցներ">
              <Input
                value={draft.bathrooms}
                inputMode="numeric"
                onChange={(event) => patch({ bathrooms: digits(event.target.value) })}
              />
            </Field>
            <Field label="Կառուցման տարի">
              <Input
                value={draft.buildYear}
                inputMode="numeric"
                onChange={(event) => patch({ buildYear: digits(event.target.value) })}
                placeholder="2022"
              />
            </Field>
            <Field label="Առաստաղի բարձրություն, մ">
              <Input
                value={draft.ceilingHeight}
                inputMode="decimal"
                onChange={(event) => patch({ ceilingHeight: digits(event.target.value) })}
                placeholder="3"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Վիճակ">
              <SelectField
                value={draft.reCondition}
                onChange={(reCondition) =>
                  patch({ reCondition: reCondition as ListingDraft["reCondition"] })
                }
                options={RE_CONDITIONS}
                placeholder="Ընտրեք վիճակը"
                anyLabel="Ընտրված չէ"
              />
            </Field>
            <Field label="Շենքի տեսակ">
              <ChipGroup
                options={BUILDING_TYPES}
                values={[draft.buildingType]}
                onChange={(values) =>
                  patch({ buildingType: (values[0] ?? "secondary") as ListingDraft["buildingType"] })
                }
              />
            </Field>
          </div>

          <Field label="Լրացուցիչ">
            <div className="space-y-2.5">
              <ToggleRow
                label="Կահույք"
                checked={draft.furniture}
                onChange={(furniture) => patch({ furniture })}
              />
              <ToggleRow
                label="Պատշգամբ"
                checked={draft.balcony}
                onChange={(balcony) => patch({ balcony })}
              />
              <ToggleRow
                label="Կայանատեղի"
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

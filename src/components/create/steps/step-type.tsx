"use client";

import { Field, OptionCard, StepHeader } from "@/components/create/field";
import { ChipGroup } from "@/components/filters/filter-fields";
import { CATEGORIES } from "@/lib/categories";
import type { ListingDraft } from "@/lib/draft";
import type { DealType } from "@/lib/types";
import { CAR_CONDITIONS, DEAL_TYPES } from "@/mock/taxonomy";

interface StepProps {
  draft: ListingDraft;
  patch: (patch: Partial<ListingDraft>) => void;
}

export function StepType({ draft, patch }: StepProps) {
  if (!draft.category) return null;
  const config = CATEGORIES[draft.category];

  return (
    <div>
      <StepHeader
        title="Тип объявления"
        description={`Выберите раздел в категории «${config.label}».`}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {config.subcategories.map((sub) => (
          <OptionCard
            key={sub.value}
            title={sub.label}
            selected={draft.subcategory === sub.value}
            onSelect={() => patch({ subcategory: sub.value })}
          />
        ))}
      </div>

      <div className="mt-6">
        {draft.category === "real-estate" ? (
          <Field label="Тип сделки" required>
            <ChipGroup
              options={DEAL_TYPES}
              values={[draft.deal]}
              onChange={(values) => patch({ deal: (values[0] ?? "sale") as DealType })}
            />
          </Field>
        ) : (
          <Field label="Состояние" required>
            <ChipGroup
              options={CAR_CONDITIONS}
              values={[draft.carCondition]}
              onChange={(values) =>
                patch({ carCondition: (values[0] ?? "used") as ListingDraft["carCondition"] })
              }
            />
          </Field>
        )}
      </div>
    </div>
  );
}

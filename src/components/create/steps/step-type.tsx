"use client";

import { Field, OptionCard, StepHeader } from "@/components/create/field";
import { ChipGroup } from "@/components/filters/filter-fields";
import { CATEGORIES } from "@/lib/categories";
import type { ListingDraft } from "@/lib/draft";
import type { DealType, RentalTerm } from "@/lib/types";
import { CAR_CONDITIONS, DEAL_TYPES, RENTAL_TERMS } from "@/mock/taxonomy";

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
        title="Հայտարարության տեսակը"
        description={`Ընտրեք բաժինը «${config.label}» կատեգորիայում։`}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {config.subcategories.map((sub) => (
          <OptionCard
            key={sub.value}
            title={sub.label}
            icon={sub.icon}
            selected={draft.subcategory === sub.value}
            onSelect={() => patch({ subcategory: sub.value })}
          />
        ))}
      </div>

      <div className="mt-6">
        {draft.category === "real-estate" && (
          <Field label="Գործարքի տեսակը" required>
            <ChipGroup
              options={DEAL_TYPES}
              values={[draft.deal]}
              onChange={(values) => patch({ deal: (values[0] ?? "sale") as DealType })}
            />
          </Field>
        )}
        {draft.category === "cars" && (
          <Field label="Վիճակը" required>
            <ChipGroup
              options={CAR_CONDITIONS}
              values={[draft.carCondition]}
              onChange={(values) =>
                patch({ carCondition: (values[0] ?? "used") as ListingDraft["carCondition"] })
              }
            />
          </Field>
        )}
        {(draft.category === "rentals" || draft.category === "hotels") && (
          <Field label="Վարձակալության ժամկետը" required>
            <ChipGroup
              options={RENTAL_TERMS}
              values={[draft.term]}
              onChange={(values) => patch({ term: (values[0] ?? "daily") as RentalTerm })}
            />
          </Field>
        )}
      </div>
    </div>
  );
}

"use client";

import { OptionCard, StepHeader } from "@/components/create/field";
import { CATEGORY_LIST } from "@/lib/categories";
import type { ListingDraft } from "@/lib/draft";

interface StepProps {
  draft: ListingDraft;
  patch: (patch: Partial<ListingDraft>) => void;
}

export function StepCategory({ draft, patch }: StepProps) {
  return (
    <div>
      <StepHeader
        title="Что вы размещаете?"
        description="От категории зависят характеристики, которые мы спросим дальше."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {CATEGORY_LIST.map((category) => (
          <OptionCard
            key={category.slug}
            title={category.label}
            description={category.tagline}
            icon={category.icon}
            selected={draft.category === category.slug}
            onSelect={() => patch({ category: category.slug, subcategory: "" })}
          />
        ))}
      </div>
    </div>
  );
}

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
        title="Ի՞նչ եք տեղադրում"
        description="Կատեգորիայից են կախված այն բնութագրերը, որոնք հետո կհարցնենք։"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {CATEGORY_LIST.filter((category) => category.slug !== "work").map((category) => (
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

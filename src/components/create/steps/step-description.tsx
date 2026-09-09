"use client";

import { Field, StepHeader } from "@/components/create/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ListingDraft } from "@/lib/draft";

interface StepProps {
  draft: ListingDraft;
  patch: (patch: Partial<ListingDraft>) => void;
}

const TIPS = [
  "Նշեք վիճակը և թե ինչ է մտնում արժեքի մեջ",
  "Նշեք մոտակա ենթակառուցվածքը կամ սպասարկման պատմությունը",
  "Գրեք, երբ է հարմար նայել և հնարավո՞ր է զեղչ",
];

export function StepDescription({ draft, patch }: StepProps) {
  return (
    <div className="space-y-6">
      <StepHeader
        title="Նկարագրություն"
        description="Վերնագիրը երևում է որոնման արդյունքներում, նկարագրությունը՝ հայտարարության էջում։"
      />

      <Field label="Վերնագիր" required hint={`${draft.title.length} 80 նիշից`}>
        <Input
          value={draft.title}
          maxLength={80}
          onChange={(event) => patch({ title: event.target.value })}
          placeholder={
            draft.category === "cars"
              ? "Օրինակ՝ Toyota Camry 2021, մեկ սեփականատեր"
              : draft.category === "rentals"
                ? "Օրինակ՝ 2-սենյականոց բնակարանի վարձակալություն Կապանում"
                : draft.category === "hotels"
                  ? "Օրինակ՝ «Սյունիք» հյուրանոց, համար՝ օրավարձով"
                  : "Օրինակ՝ 2-սենյականոց բնակարան նորակառույցում Արաբկիրում"
          }
        />
      </Field>

      <Field
        label="Նկարագրություն"
        required
        hint={`${draft.description.length} նիշ, նվազագույնը 40`}
      >
        <Textarea
          value={draft.description}
          onChange={(event) => patch({ description: event.target.value })}
          placeholder="Նկարագրեք օբյեկտը այնպես, ինչպես կպատմեիք գնորդին հանդիպման ժամանակ…"
          className="min-h-[200px]"
        />
      </Field>

      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-semibold">Ինչի մասին արժե նշել</h3>
        <ul className="mt-2 space-y-1.5">
          {TIPS.map((tip) => (
            <li key={tip} className="flex gap-2 text-[13px] text-muted-foreground">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

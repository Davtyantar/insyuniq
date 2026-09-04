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
  "Расскажите о состоянии и о том, что входит в стоимость",
  "Укажите инфраструктуру рядом или историю обслуживания",
  "Напишите, когда удобно смотреть и возможен ли торг",
];

export function StepDescription({ draft, patch }: StepProps) {
  return (
    <div className="space-y-6">
      <StepHeader
        title="Описание"
        description="Заголовок видно в результатах поиска, описание — на странице объявления."
      />

      <Field label="Заголовок" required hint={`${draft.title.length} из 80 символов`}>
        <Input
          value={draft.title}
          maxLength={80}
          onChange={(event) => patch({ title: event.target.value })}
          placeholder={
            draft.category === "cars"
              ? "Например: Toyota Camry 2021, один владелец"
              : "Например: 2-комнатная квартира в новостройке на Арабкире"
          }
        />
      </Field>

      <Field
        label="Описание"
        required
        hint={`${draft.description.length} символов, минимум 40`}
      >
        <Textarea
          value={draft.description}
          onChange={(event) => patch({ description: event.target.value })}
          placeholder="Опишите объект так, как рассказали бы покупателю при встрече…"
          className="min-h-[200px]"
        />
      </Field>

      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-semibold">Что стоит упомянуть</h3>
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

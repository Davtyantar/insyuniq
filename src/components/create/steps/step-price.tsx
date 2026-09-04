"use client";

import { Field, StepHeader } from "@/components/create/field";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/format";
import type { ListingDraft } from "@/lib/draft";

interface StepProps {
  draft: ListingDraft;
  patch: (patch: Partial<ListingDraft>) => void;
}

export function StepPrice({ draft, patch }: StepProps) {
  const price = Number(draft.price) || 0;
  const isRent = draft.category === "real-estate" && draft.deal === "rent";

  return (
    <div className="space-y-6">
      <StepHeader
        title="Цена и контакты"
        description="Цену указывайте в долларах — так ищет большинство покупателей."
      />

      <Field
        label={isRent ? "Цена за месяц, $" : "Цена, $"}
        required
        hint={price > 0 ? `Покупатель увидит ${formatPrice(price, { perMonth: isRent })}` : undefined}
      >
        <Input
          value={draft.price}
          inputMode="numeric"
          onChange={(event) => patch({ price: event.target.value.replace(/\D/g, "") })}
          placeholder="125000"
          className="h-12 text-lg"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Имя" required>
          <Input
            value={draft.contactName}
            onChange={(event) => patch({ contactName: event.target.value })}
            placeholder="Как к вам обращаться"
          />
        </Field>
        <Field label="Телефон" required>
          <Input
            value={draft.phone}
            onChange={(event) => patch({ phone: event.target.value })}
            placeholder="+374 __ __ __ __"
          />
        </Field>
      </div>

      <p className="rounded-lg border border-border bg-card p-4 text-[13px] leading-relaxed text-muted-foreground">
        Номер показывается только после нажатия «Показать телефон». Сообщения приходят в чат на
        площадке — отвечать можно с телефона и компьютера.
      </p>
    </div>
  );
}

"use client";

import { Field, StepHeader } from "@/components/create/field";
import { ToggleRow } from "@/components/filters/filter-fields";
import { useApp } from "@/components/providers/app-provider";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/format";
import type { ListingDraft } from "@/lib/draft";

interface StepProps {
  draft: ListingDraft;
  patch: (patch: Partial<ListingDraft>) => void;
}

export function StepPrice({ draft, patch }: StepProps) {
  const { currency } = useApp();
  const price = Number(draft.price) || 0;
  const isRent = draft.category === "real-estate" && draft.deal === "rent";
  const isStay = draft.category === "rentals" || draft.category === "hotels";
  const isDaily = isStay && draft.term === "daily";
  const isLongRental = isStay && draft.term === "long";
  const perMonth = isRent || isLongRental;

  const priceLabel = isDaily ? "Գին օրավարձով, $" : perMonth ? "Գին ամսավարձով, $" : "Գին, $";

  return (
    <div className="space-y-6">
      <StepHeader
        title="Գին և կոնտակտներ"
        description="Գինը նշեք դոլարով — այդպես է փնտրում գնորդների մեծ մասը։"
      />

      <Field
        label={priceLabel}
        required
        hint={
          price > 0
            ? `Գնորդը կտեսնի ${formatPrice(price, { perMonth, perDay: isDaily, currency })}`
            : undefined
        }
      >
        <Input
          value={draft.price}
          inputMode="numeric"
          onChange={(event) => patch({ price: event.target.value.replace(/\D/g, "") })}
          placeholder="125000"
          className="h-12 text-lg"
        />
      </Field>

      <Field label="Հրատապ">
        <ToggleRow
          label="Նշել որպես հրատապ (Срочно)"
          hint="Հայտարարության վրա կցուցադրվի կարմիր «Հրատապ» կպչիկ"
          checked={draft.urgent}
          onChange={(urgent) => patch({ urgent })}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Անուն" required>
          <Input
            value={draft.contactName}
            onChange={(event) => patch({ contactName: event.target.value })}
            placeholder="Ինչպես դիմենք ձեզ"
          />
        </Field>
        <Field label="Հեռախոս" required>
          <Input
            value={draft.phone}
            onChange={(event) => patch({ phone: event.target.value })}
            placeholder="+374 __ __ __ __"
          />
        </Field>
      </div>

      <p className="rounded-lg border border-border bg-card p-4 text-[13px] leading-relaxed text-muted-foreground">
        Հեռախոսահամարը գնորդներին ցուցադրվում է միայն «Ցուցադրել հեռախոսը» կոճակը սեղմելուց հետո —
        կզանգահարեն ուղիղ ձեզ։
      </p>
    </div>
  );
}

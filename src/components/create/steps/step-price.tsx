"use client";

import { Field, StepHeader } from "@/components/create/field";
import { ToggleRow } from "@/components/filters/filter-fields";
import { Input } from "@/components/ui/input";
import { CURRENCY_OPTIONS, type Currency } from "@/lib/currency";
import type { ListingDraft } from "@/lib/draft";

interface StepProps {
  draft: ListingDraft;
  patch: (patch: Partial<ListingDraft>) => void;
}

/** Draft field per currency — only the dollar one is required; the rest fall back to an
 * automatic dollar conversion (see `formatPrice`) if the seller leaves them blank. */
const PRICE_FIELDS: {
  key: "price" | "priceEur" | "priceAmd" | "priceRub";
  currency: Currency;
  required: boolean;
}[] = [
  { key: "price", currency: "USD", required: true },
  { key: "priceEur", currency: "EUR", required: false },
  { key: "priceAmd", currency: "AMD", required: false },
  { key: "priceRub", currency: "RUB", required: false }
];

export function StepPrice({ draft, patch }: StepProps) {
  const isRent = draft.category === "real-estate" && draft.deal === "rent";
  const isStay = draft.category === "rentals" || draft.category === "hotels";
  const isDaily = isStay && draft.term === "daily";
  const isLongRental = isStay && draft.term === "long";
  const perMonth = isRent || isLongRental;

  const priceHeading = isDaily
    ? "Գին օրավարձով"
    : perMonth
      ? "Գին ամսավարձով"
      : "Գին";

  return (
    <div className='space-y-6'>
      <StepHeader
        title='Գին և կոնտակտներ'
        description='Գինը նշեք դոլարով — այդպես է փնտրում գնորդների մեծ մասը։'
      />

      <Field label={priceHeading}>
        <div className='flex flex-wrap gap-3'>
          {PRICE_FIELDS.map(({ key, currency, required }) => {
            const option = CURRENCY_OPTIONS.find((c) => c.value === currency)!;
            return (
              <div
                key={key}
                className='relative flex-1 basis-[calc(50%-6px)] sm:basis-[120px]'
              >
                <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'>
                  {option.symbol}
                  {required && <span className='text-destructive'>*</span>}
                </span>
                <Input
                  value={draft[key]}
                  inputMode='numeric'
                  onChange={(event) =>
                    patch({ [key]: event.target.value.replace(/\D/g, "") })
                  }
                  placeholder={required ? "125000" : "—"}
                  aria-label={`${priceHeading}, ${currency}${required ? " *" : ""}`}
                  className='h-12 w-full pl-8 text-lg placeholder:text-[12px] sm:placeholder:text-base'
                />
              </div>
            );
          })}
        </div>
      </Field>

      <div className='flex flex-wrap gap-4'>
        <ToggleRow
          label='Հրատապ (Срочно)'
          checked={draft.urgent}
          onChange={(urgent) => patch({ urgent })}
        />
        <ToggleRow
          label='Սակարկելի'
          checked={draft.negotiable}
          onChange={(negotiable) => patch({ negotiable })}
        />
      </div>

      <div className='grid gap-4 sm:grid-cols-2'>
        <Field label='Անուն' required>
          <Input
            value={draft.contactName}
            onChange={(event) => patch({ contactName: event.target.value })}
            placeholder='Ինչպես դիմենք ձեզ'
            className='placeholder:text-[12px] sm:placeholder:text-sm'
          />
        </Field>
        <Field label='Հեռախոս' required>
          <Input
            value={draft.phone}
            onChange={(event) => patch({ phone: event.target.value })}
            placeholder='+374 __ __ __ __'
            className='placeholder:text-[12px] sm:placeholder:text-sm'
          />
        </Field>
      </div>
    </div>
  );
}

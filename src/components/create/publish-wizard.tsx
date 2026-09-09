"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, CircleAlert, PartyPopper } from "lucide-react";
import { StepCategory } from "@/components/create/steps/step-category";
import { StepDescription } from "@/components/create/steps/step-description";
import { StepPhotos } from "@/components/create/steps/step-photos";
import { StepPrice } from "@/components/create/steps/step-price";
import { StepPreview } from "@/components/create/steps/step-preview";
import { StepSpecs } from "@/components/create/steps/step-specs";
import { StepType } from "@/components/create/steps/step-type";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { listingHref } from "@/lib/categories";
import {
  EMPTY_DRAFT,
  WIZARD_STEPS,
  draftToListing,
  stepErrors,
  type ListingDraft,
} from "@/lib/draft";
import type { Listing } from "@/lib/types";
import { cn } from "@/lib/utils";

function Stepper({ current, onGoTo }: { current: number; onGoTo: (step: number) => void }) {
  return (
    <ol className="flex gap-1 overflow-x-auto pb-1 no-scrollbar lg:flex-col lg:gap-1.5 lg:overflow-visible">
      {WIZARD_STEPS.map((step) => {
        const state = step.id === current ? "current" : step.id < current ? "done" : "todo";
        return (
          <li key={step.id} className="shrink-0 lg:w-full">
            <button
              type="button"
              onClick={() => step.id < current && onGoTo(step.id)}
              disabled={step.id > current}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md border px-3 py-2 text-left transition-colors",
                state === "current" && "border-accent bg-brand-50/60",
                state === "done" && "border-border bg-card hover:bg-secondary",
                state === "todo" && "border-transparent text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold",
                  state === "current" && "bg-accent text-accent-foreground",
                  state === "done" && "bg-brand-100 text-brand-700",
                  state === "todo" && "bg-secondary text-muted-foreground",
                )}
              >
                {state === "done" ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : step.id}
              </span>
              <span className="min-w-0">
                <span className="block whitespace-nowrap text-[13px] font-medium lg:whitespace-normal">
                  {step.title}
                </span>
                <span className="hidden text-[12px] text-muted-foreground lg:block">
                  {step.hint}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function SuccessState({ listing, onReset }: { listing: Listing; onReset: () => void }) {
  return (
    <div className="mx-auto max-w-xl rounded-lg border border-border bg-card px-6 py-12 text-center">
      <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        <PartyPopper className="h-7 w-7" />
      </span>
      <h2 className="text-xl font-semibold tracking-tight">Հայտարարությունը հրապարակված է</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        «{listing.title}»-ն արդեն հասանելի է կատալոգում։ Առաջին արձագանքները սովորաբար գալիս են մեկ օրվա ընթացքում։
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Button asChild variant="accent">
          <Link href={listingHref(listing)}>Բացել հայտարարությունը</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/profile">Իմ հայտարարությունները</Link>
        </Button>
        <Button variant="ghost" onClick={onReset}>
          Հրապարակել ևս մեկը
        </Button>
      </div>
    </div>
  );
}

export function PublishWizard() {
  const { publishListing } = useApp();
  const [step, setStep] = React.useState(1);
  const [draft, setDraft] = React.useState<ListingDraft>(EMPTY_DRAFT);
  const [showErrors, setShowErrors] = React.useState(false);
  const [publishedListing, setPublishedListing] = React.useState<Listing | null>(null);

  const patch = React.useCallback((update: Partial<ListingDraft>) => {
    setDraft((prev) => ({ ...prev, ...update }));
  }, []);

  const errors = stepErrors(step, draft);
  const preview = React.useMemo(
    () => (draft.category ? draftToListing(draft, "draft-preview") : null),
    [draft],
  );

  function next() {
    if (errors.length) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    setStep((prev) => Math.min(prev + 1, WIZARD_STEPS.length));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    setShowErrors(false);
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function publish() {
    const listing = draftToListing(draft);
    publishListing(listing);
    setPublishedListing(listing);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setDraft(EMPTY_DRAFT);
    setPublishedListing(null);
    setStep(1);
  }

  if (publishedListing) {
    return (
      <div className="container py-10">
        <SuccessState listing={publishedListing} onReset={reset} />
      </div>
    );
  }

  return (
    <div className="container py-6 lg:py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight lg:text-[28px]">
          Հրապարակել հայտարարություն
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Քայլ {step}-ը {WIZARD_STEPS.length}-ից · {WIZARD_STEPS[step - 1].title}
        </p>
        <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${(step / WIZARD_STEPS.length) * 100}%` }}
          />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <aside className="lg:sticky lg:top-[124px] lg:self-start">
          <Stepper current={step} onGoTo={setStep} />
        </aside>

        <div className="min-w-0">
          <div className="rounded-lg border border-border bg-background p-5 md:p-6">
            {step === 1 && <StepCategory draft={draft} patch={patch} />}
            {step === 2 && <StepType draft={draft} patch={patch} />}
            {step === 3 && <StepSpecs draft={draft} patch={patch} />}
            {step === 4 && <StepPhotos draft={draft} patch={patch} />}
            {step === 5 && <StepDescription draft={draft} patch={patch} />}
            {step === 6 && <StepPrice draft={draft} patch={patch} />}
            {step === 7 && preview && <StepPreview listing={preview} />}

            {showErrors && errors.length > 0 && (
              <div className="mt-5 flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-[13px] text-destructive">
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <ul className="space-y-0.5">
                  {errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <Button variant="outline" onClick={back} disabled={step === 1} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Հետ
            </Button>

            {step < WIZARD_STEPS.length ? (
              <Button variant="accent" onClick={next} className="gap-2">
                Հաջորդը
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="accent" size="lg" onClick={publish} className="gap-2">
                <Check className="h-4 w-4" />
                Հրապարակել հայտարարությունը
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

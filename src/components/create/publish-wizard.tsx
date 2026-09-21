"use client";

import * as React from "react";
import { Link } from "@/components/i18n/locale-link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Skeleton } from "@/components/ui/skeleton";
import { listingHref } from "@/lib/categories";
import {
  EMPTY_DRAFT,
  draftToListing,
  listingToDraft,
  stepErrors,
  wizardSteps,
  type ListingDraft,
  type WizardStepDef,
} from "@/lib/draft";
import type { Listing } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Compact connected-dots progress track for phones — the full labeled list below is a lot of
 * text to cram into a narrow header, and the current step's own title/hint already show in the
 * page header above this, so the dots only need to carry state, not repeat the copy. */
function MobileStepper({
  steps,
  current,
  highestStep,
  onGoTo,
}: {
  steps: WizardStepDef[];
  current: number;
  highestStep: number;
  onGoTo: (step: number) => void;
}) {
  return (
    <ol className="flex items-center lg:hidden">
      {steps.map((step, index) => {
        const state = step.id === current ? "current" : step.id <= highestStep ? "done" : "todo";
        const isLast = index === steps.length - 1;
        return (
          <li key={step.id} className={cn("flex items-center", !isLast && "flex-1")}>
            <button
              type="button"
              onClick={() => step.id <= highestStep && onGoTo(step.id)}
              disabled={step.id > highestStep}
              aria-current={state === "current" ? "step" : undefined}
              aria-label={step.title}
              title={step.title}
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold transition-all",
                state === "current" && "bg-accent text-accent-foreground ring-4 ring-accent/20",
                state === "done" && "bg-accent/15 text-accent",
                state === "todo" && "bg-secondary text-muted-foreground",
              )}
            >
              {state === "done" ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : step.id}
            </button>
            {!isLast && (
              <span
                className={cn(
                  "mx-1 h-[3px] flex-1 rounded-full transition-colors",
                  step.id < highestStep ? "bg-accent" : "bg-secondary",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** Full labeled step list for the sticky desktop sidebar. */
function Stepper({
  steps,
  current,
  highestStep,
  onGoTo,
}: {
  steps: WizardStepDef[];
  current: number;
  highestStep: number;
  onGoTo: (step: number) => void;
}) {
  return (
    <ol className="hidden lg:flex lg:flex-col lg:gap-1.5">
      {steps.map((step) => {
        const state = step.id === current ? "current" : step.id <= highestStep ? "done" : "todo";
        return (
          <li key={step.id} className="lg:w-full">
            <button
              type="button"
              onClick={() => step.id <= highestStep && onGoTo(step.id)}
              disabled={step.id > highestStep}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md border px-3 py-2 text-left transition-colors",
                state === "current" && "border-accent bg-brand-50/60 dark:bg-emerald-500/15",
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
                <span className="block text-[13px] font-medium">{step.title}</span>
                <span className="block text-[12px] text-muted-foreground">{step.hint}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function SuccessState({
  listing,
  isEdit,
  onReset,
}: {
  listing: Listing;
  isEdit: boolean;
  onReset: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl rounded-lg border border-border bg-card px-6 py-12 text-center">
      <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        <PartyPopper className="h-7 w-7" />
      </span>
      <h2 className="text-xl font-semibold tracking-tight">
        {isEdit ? "Հայտարարությունը թարմացված է" : "Հայտարարությունը հրապարակված է"}
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {isEdit
          ? `«${listing.title}»-ի փոփոխությունները պահպանված են։`
          : `«${listing.title}»-ն արդեն հասանելի է կատալոգում։ Առաջին արձագանքները սովորաբար գալիս են մեկ օրվա ընթացքում։`}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Button asChild variant="accent">
          <Link href="/profile">Իմ հայտարարությունները</Link>
        </Button>
        {!isEdit && (
          <>
            <Button asChild variant="outline">
              <Link href={listingHref(listing)}>Բացել հայտարարությունը</Link>
            </Button>
            <Button variant="ghost" onClick={onReset}>
              Հրապարակել ևս մեկը
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export function PublishWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const { publishListing, updateListing, published, user, hydrated, localizeHref } = useApp();

  // Publishing requires an account. Every "Add a listing" link in the app already points
  // signed-out visitors straight to /sign-in (see useApp().createHref) — this only catches
  // someone reaching /create directly (a typed URL, a bookmark, the back button).
  React.useEffect(() => {
    if (hydrated && !user) router.replace(localizeHref("/sign-in"));
  }, [hydrated, user, router, localizeHref]);

  const [step, setStep] = React.useState(1);
  // Highest step ever reached — once a step is passed it stays marked "done" in the stepper
  // even after navigating back to an earlier one, instead of resetting relative to `step`.
  const [highestStep, setHighestStep] = React.useState(1);
  const [draft, setDraft] = React.useState<ListingDraft>(EMPTY_DRAFT);
  const [showErrors, setShowErrors] = React.useState(false);
  const [publishedListing, setPublishedListing] = React.useState<Listing | null>(null);
  // Whichever listing id ?edit= actually resolved to, once resolved — the id publish() should
  // overwrite instead of creating a new one, and what drives every "edit mode" bit of copy below.
  const [editingId, setEditingId] = React.useState<string | null>(null);
  // Distinguishes "nothing to edit" from "haven't looked yet" — before hydration `published` is
  // still empty, so resolving ?edit= against it one render too early would always miss and fall
  // through to a blank wizard even for a listing that does exist. Skipped entirely when there's
  // no ?edit= param, so the ordinary create flow renders immediately as before.
  const [editResolved, setEditResolved] = React.useState(!editId);

  React.useEffect(() => {
    if (!editId || !hydrated || editResolved) return;
    const existing = published.find((listing) => listing.id === editId);
    if (existing) {
      setDraft(listingToDraft(existing, { name: user?.name, phone: user?.phone }));
      setEditingId(editId);
    }
    setEditResolved(true);
    // Deliberately narrow: this is a one-time seed once hydration + the id are both ready, not a
    // live sync — re-running on every `published`/`user` change would stomp on in-progress edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId, hydrated, editResolved]);

  // Services skip the price/contacts step, so the step list itself depends on the category.
  const steps = React.useMemo(() => wizardSteps(draft.category), [draft.category]);
  const currentStep = steps[step - 1] ?? steps[steps.length - 1];

  // Editing an existing listing starts with every field already filled in, unlike a fresh
  // wizard building up one step at a time — so every step reads as already-done (filled
  // checkmark) and is immediately clickable, instead of gating on `highestStep` reached so far.
  React.useEffect(() => {
    if (editingId) setHighestStep(steps.length);
  }, [editingId, steps.length]);

  React.useEffect(() => {
    setHighestStep((prev) => Math.max(prev, step));
  }, [step]);

  // If switching category shrinks the step list out from under the current position (e.g.
  // stepping back to step 1 and picking "services"), settle back onto the last valid step.
  React.useEffect(() => {
    setStep((prev) => Math.min(prev, steps.length));
  }, [steps.length]);

  const patch = React.useCallback((update: Partial<ListingDraft>) => {
    setDraft((prev) => ({ ...prev, ...update }));
  }, []);

  const errors = stepErrors(currentStep.key, draft);
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
    setStep((prev) => Math.min(prev + 1, steps.length));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    setShowErrors(false);
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function publish() {
    if (editingId) {
      const listing = draftToListing(draft, editingId);
      updateListing(editingId, listing);
      setPublishedListing(listing);
    } else {
      const listing = draftToListing(draft);
      publishListing(listing);
      setPublishedListing(listing);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setDraft(EMPTY_DRAFT);
    setPublishedListing(null);
    setStep(1);
    setHighestStep(1);
  }

  // Still resolving ?edit= against the (just-hydrated) published list — a beat of skeleton
  // instead of flashing a blank "pick a category" step 1 that's about to be replaced.
  if (editId && !editResolved) {
    return (
      <div className="container py-6 lg:py-8">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="mt-3 h-4 w-40" />
        <Skeleton className="mt-6 h-80 w-full rounded-lg" />
      </div>
    );
  }

  if (publishedListing) {
    return (
      <div className="container py-10">
        <SuccessState listing={publishedListing} isEdit={!!editingId} onReset={reset} />
      </div>
    );
  }

  return (
    <div className="container py-6 lg:py-8">
      <header className="mb-6">
        <h1 className="text-[18px] font-semibold tracking-tight lg:text-[28px]">
          {editingId ? "Խմբագրել հայտարարությունը" : "Հրապարակել հայտարարություն"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Քայլ {step}-ը {steps.length}-ից · {currentStep.title}
        </p>
        <div className="mt-4 hidden h-1 w-full overflow-hidden rounded-full bg-secondary lg:block">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${(step / steps.length) * 100}%` }}
          />
        </div>
        <div className="mt-4 lg:hidden">
          <MobileStepper steps={steps} current={step} highestStep={highestStep} onGoTo={setStep} />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <aside className="hidden lg:sticky lg:top-[124px] lg:block lg:self-start">
          <Stepper steps={steps} current={step} highestStep={highestStep} onGoTo={setStep} />
        </aside>

        <div className="min-w-0">
          <div className="rounded-lg border border-border bg-background p-5 md:p-6">
            {currentStep.key === "category" && <StepCategory draft={draft} patch={patch} />}
            {currentStep.key === "type" && <StepType draft={draft} patch={patch} />}
            {currentStep.key === "specs" && <StepSpecs draft={draft} patch={patch} />}
            {currentStep.key === "photos" && <StepPhotos draft={draft} patch={patch} />}
            {currentStep.key === "description" && <StepDescription draft={draft} patch={patch} />}
            {currentStep.key === "price" && <StepPrice draft={draft} patch={patch} />}
            {currentStep.key === "preview" && preview && <StepPreview listing={preview} />}

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

            {step < steps.length ? (
              <Button variant="accent" onClick={next} className="gap-2">
                Հաջորդը
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="accent" size="lg" onClick={publish} className="gap-2">
                <Check className="h-4 w-4" />
                {editingId ? "Պահպանել" : "Հրապարակել"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

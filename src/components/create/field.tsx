"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function Field({
  label,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {hint && <p className="mt-1.5 text-[12px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function StepHeader({ title, description }: { title: string; description?: string }) {
  return (
    <header className="mb-6">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {description && <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>}
    </header>
  );
}

interface OptionCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  selected: boolean;
  onSelect: () => void;
}

export function OptionCard({ title, description, icon: Icon, selected, onSelect }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "relative flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-all",
        selected
          ? "border-accent bg-brand-50/60 shadow-card"
          : "border-border bg-card hover:border-slate-300 hover:shadow-card",
      )}
    >
      {Icon && (
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-md",
            selected ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground",
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-medium">{title}</span>
        {description && (
          <span className="mt-0.5 block text-[13px] leading-relaxed text-muted-foreground">
            {description}
          </span>
        )}
      </span>
      {selected && (
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

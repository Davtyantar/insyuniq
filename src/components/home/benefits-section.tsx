"use client";

import { BadgeCheck, Phone, ShieldCheck, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

const BENEFITS = [
  { key: "verified", icon: BadgeCheck },
  { key: "fast", icon: Zap },
  { key: "call", icon: Phone },
  { key: "safe", icon: ShieldCheck },
] as const;

export function BenefitsSection() {
  const { t } = useTranslation();
  return (
    <section className="hidden border-y border-border bg-secondary/40 md:block">
      <div className="container grid grid-cols-2 gap-3 py-12 sm:gap-4 lg:grid-cols-4">
        {BENEFITS.map((benefit) => (
          <div
            key={benefit.key}
            className="group flex flex-col items-center rounded-2xl border border-border bg-card p-3.5 text-center shadow-sm transition-shadow hover:shadow-lift sm:items-start sm:p-5 sm:text-left"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent transition-colors ">
              <benefit.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-3.5 text-[13px] font-semibold text-foreground sm:text-[15px]">
              {t(`home.benefits.${benefit.key}.title`)}
            </h3>
            <p className="mt-1.5 hidden text-[13px] leading-relaxed text-muted-foreground sm:block">
              {t(`home.benefits.${benefit.key}.text`)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

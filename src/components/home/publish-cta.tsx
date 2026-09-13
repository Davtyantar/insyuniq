"use client";

import Image from "next/image";
import { Building2, Car, DoorOpen, Home, Hotel, KeyRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CtaButton } from "@/components/ui/cta-button";
import { APP_NAME } from "@/lib/constants";

/** Fixed decorative icon badges around the CTA banner's map — same size, evenly placed, no randomness. */
const CTA_MAP_ICONS = [
  { icon: Home, wrap: "-left-5 top-0" },
  { icon: Building2, wrap: "-right-5 top-0" },
  { icon: KeyRound, wrap: "-left-7 top-1/2 -translate-y-1/2" },
  { icon: Car, wrap: "-right-7 top-1/2 -translate-y-1/2" },
  { icon: DoorOpen, wrap: "-left-5 bottom-0" },
  { icon: Hotel, wrap: "-right-5 bottom-0" },
] as const;

/** Closing "publish for free" banner on the home page. */
export function PublishCta() {
  const { t } = useTranslation();
  return (
    <section className="container py-12 md:py-16">
      <div className="relative overflow-hidden rounded-3xl bg-card p-6 shadow-lift ring-1 ring-black/5 dark:ring-white/10 sm:p-9 md:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(37,99,246,0.4)_1.8px,transparent_0),radial-gradient(circle_at_13px_13px,rgba(15,23,42,0.22)_1.4px,transparent_0)] [background-size:26px_26px] [mask-image:radial-gradient(ellipse_120%_100%_at_100%_0%,black,transparent_75%)] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(147,197,253,0.45)_1.8px,transparent_0),radial-gradient(circle_at_13px_13px,rgba(226,232,240,0.2)_1.4px,transparent_0)]"
        />
        <div className="pointer-events-none absolute -right-6 top-1/2 z-0 hidden h-[220px] w-[170px] -translate-y-1/2 opacity-90 sm:block md:h-[280px] md:w-[220px] md:right-8">
          <Image src="/syunik-map.png" alt="" aria-hidden fill className="object-contain" />
          {CTA_MAP_ICONS.map(({ icon: Icon, wrap }, index) => (
            <span
              key={index}
              className={`absolute flex h-14 w-14 items-center justify-center rounded-full bg-card text-accent shadow-md ring-1 ring-black/5 dark:ring-white/10 ${wrap}`}
            >
              <Icon className="h-6 w-6" />
            </span>
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center gap-7 text-center md:flex-row md:items-center md:justify-between md:gap-10 md:text-left">
          <div className="flex flex-col items-center gap-4 md:items-start">
            <Image
              src="/logo.png"
              alt={APP_NAME}
              width={765}
              height={235}
              className="hidden h-9 w-auto rounded-lg sm:block sm:h-12 dark:hidden"
            />
            <Image
              src="/logo-white.png"
              alt={APP_NAME}
              width={765}
              height={235}
              className="hidden h-9 w-auto rounded-lg sm:dark:block sm:h-12"
            />

            <h2 className="max-w-[280px] text-balance text-[18px] font-bold leading-tight tracking-tight text-foreground sm:max-w-none sm:text-[26px] md:text-[30px] dark:text-white">
              {t("home.cta.heading")} <span className="text-accent">{t("home.cta.headingFree")}</span>
            </h2>

            <p className="hidden max-w-[320px] text-balance text-[13px] leading-relaxed text-muted-foreground sm:block sm:max-w-none sm:text-[15px] md:text-base">
              {t("home.cta.text")}
            </p>

            <CtaButton href="/create" className="mt-1">
              {t("home.cta.button")}
            </CtaButton>
          </div>
        </div>
      </div>
    </section>
  );
}

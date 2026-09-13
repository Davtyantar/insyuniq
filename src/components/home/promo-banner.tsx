"use client";

import Image from "next/image";
import { Link } from "@/components/i18n/locale-link";
import { Briefcase } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { CtaButton } from "@/components/ui/cta-button";
import { CITY_SLUG } from "@/lib/cities";
import { APP_NAME } from "@/lib/constants";

/** City-specific clips for the work banner; falls back to the generic one. */
const CITY_WORK_VIDEOS: Record<string, string> = {
  Գորիս: "/goris-work.mp4",
  Սիսիան: "/sisian-work.mp4",
  Քաջարան: "/kajaran-work.mp4",
  Մեղրի: "/megri-work.mp4",
};

/** Promo banner above the category grid — the site's own "advertisement". */
export function PromoBanner() {
  const { t } = useTranslation();
  const { city, hydrated } = useApp();
  const locationLabel =
    hydrated && city ? t(`cities.${CITY_SLUG[city]}.in`) : t("common.acrossTheRegion");
  const workHref = city ? `/work?city=${encodeURIComponent(city)}` : "/work";
  const workVideoSrc = (hydrated && city && CITY_WORK_VIDEOS[city]) || "/work.mp4";

  return (
    <section className='container pt-6 md:pt-8'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-[3fr_2fr]'>
        <div className='relative overflow-hidden rounded-3xl bg-card px-6 pb-[calc(1.5rem+25px)] pt-6 ring-1 ring-black/5 dark:ring-white/10 sm:px-8 sm:pb-[calc(2rem+25px)] sm:pt-8 md:px-10 md:pb-[calc(2.5rem+25px)] md:pt-10'>
          <div
            aria-hidden
            className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(37,99,246,0.4)_1.8px,transparent_0),radial-gradient(circle_at_13px_13px,rgba(15,23,42,0.22)_1.4px,transparent_0)] [background-size:26px_26px] [mask-image:radial-gradient(ellipse_120%_100%_at_100%_0%,black,transparent_75%)] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(147,197,253,0.45)_1.8px,transparent_0),radial-gradient(circle_at_13px_13px,rgba(226,232,240,0.2)_1.4px,transparent_0)]'
          />

          <div className='relative z-10 flex flex-col items-center gap-5 text-center md:h-full md:flex-row md:items-center md:justify-between md:gap-6 md:text-left'>
            <div className='flex flex-col items-center gap-3.5 md:items-start'>
              <Image
                src='/logo.png'
                alt={APP_NAME}
                width={765}
                height={235}
                priority
                className='hidden h-9 w-auto rounded-lg sm:block sm:h-10 dark:hidden'
              />
              <Image
                src='/logo-white.png'
                alt={APP_NAME}
                width={765}
                height={235}
                priority
                className='hidden h-9 w-auto rounded-lg sm:dark:block sm:h-10'
              />
              <h1 className='max-w-[280px] text-balance text-[18px] font-bold leading-tight tracking-tight text-foreground sm:max-w-none sm:text-[26px] md:text-[28px] lg:text-[28px] dark:text-white'>
                {t("home.promo.heading")}{" "}
                <span className='text-accent'>{t("home.promo.headingHighlight")}</span>
              </h1>
              <p className='hidden max-w-[300px] text-balance text-[12px] leading-relaxed text-muted-foreground sm:block sm:max-w-none sm:text-[15px]'>
                {t("home.promo.text")}
              </p>
              <div className='mt-1 flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-center md:justify-start'>
                <CtaButton
                  href='/create'
                  size='default'
                  className='w-full whitespace-nowrap px-4 sm:w-auto'
                >
                  {t("common.publish")}
                </CtaButton>
                <Button
                  asChild
                  size='default'
                  variant='outline'
                  className='w-full whitespace-nowrap border-border bg-card px-4 text-foreground hover:bg-secondary sm:w-auto'
                >
                  <Link href='/search'>{t("home.promo.viewListings")}</Link>
                </Button>
              </div>
            </div>

            <div className='relative hidden h-[235px] w-[189px] shrink-0 [perspective:700px] sm:block md:h-[265px] md:w-[213px] lg:h-[295px] lg:w-[237px]'>
              <Image
                src='/syunik-map.png'
                alt=''
                aria-hidden
                fill
                className='animate-float-3d object-contain [transform-style:preserve-3d] will-change-transform'
              />
            </div>
          </div>
        </div>

        <div className='relative aspect-[3/2] overflow-hidden rounded-3xl shadow-lift ring-1 ring-black/5 dark:ring-white/10 md:aspect-auto'>
          <video
            key={workVideoSrc}
            src={workVideoSrc}
            poster='/work.jpg'
            aria-hidden
            autoPlay
            muted
            loop
            playsInline
            preload='auto'
            className='absolute inset-0 h-full w-full object-cover'
          />

          <Image
            src='/logo-white.png'
            alt=''
            aria-hidden
            width={765}
            height={235}
            className='absolute right-3 top-3 z-10 hidden h-9 w-auto opacity-90 drop-shadow-md sm:block md:h-10'
          />

          <Link
            href={workHref}
            className='absolute right-2 top-2 z-20 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-accent to-brand-700 py-1 pl-1 pr-3 text-left shadow-xl ring-1 ring-white/25 sm:bottom-3 sm:right-3 sm:top-auto sm:gap-2 sm:py-1.5 sm:pl-1.5 sm:pr-4'
          >
            <span className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-accent shadow-sm sm:h-7 sm:w-7'>
              <Briefcase className='h-3 w-3 sm:h-3.5 sm:w-3.5' />
            </span>
            <span className='flex items-center whitespace-nowrap leading-tight'>
              <span className='text-[10px] font-semibold text-white sm:text-[13px]'>{t("home.promo.work")}</span>
              <span className='ml-1 text-[10px] font-bold text-white/90 sm:text-[13px]'>{locationLabel}</span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

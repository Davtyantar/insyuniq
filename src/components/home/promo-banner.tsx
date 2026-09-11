"use client";

import Image from "next/image";
import Link from "next/link";
import { Briefcase } from "lucide-react";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { CtaButton } from "@/components/ui/cta-button";
import { APP_NAME } from "@/lib/constants";
import { cityInPrepositional } from "@/lib/format";

/** Promo banner above the category grid — the site's own "advertisement". */
export function PromoBanner() {
  const { city, hydrated } = useApp();
  const locationLabel =
    hydrated && city ? cityInPrepositional(city) : "Ողջ մարզում";
  const workHref = city
    ? `/search?q=${encodeURIComponent("աշխատանք")}&city=${encodeURIComponent(city)}`
    : `/search?q=${encodeURIComponent("աշխատանք")}`;

  return (
    <section className='container pt-6 md:pt-8'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-[3fr_2fr]'>
        <div className='relative overflow-hidden rounded-3xl bg-card px-6 pb-[calc(1.5rem+25px)] pt-6 ring-1 ring-black/5 dark:ring-white/10 sm:px-8 sm:pb-[calc(2rem+25px)] sm:pt-8 md:px-10 md:pb-[calc(2.5rem+25px)] md:pt-10'>
          <div
            aria-hidden
            className='pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-brand-300/50 to-brand-500/20 blur-3xl'
          />
          <div
            aria-hidden
            className='pointer-events-none absolute -bottom-28 -left-16 h-56 w-56 rounded-full bg-gradient-to-tr from-amber-200/50 to-brand-100/40 blur-3xl'
          />
          <div
            aria-hidden
            className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(37,99,246,0.22)_1.6px,transparent_0),radial-gradient(circle_at_13px_13px,rgba(15,23,42,0.1)_1.2px,transparent_0)] [background-size:26px_26px] [mask-image:radial-gradient(ellipse_120%_100%_at_100%_0%,black,transparent_75%)]'
          />

          <div className='relative z-10 flex flex-col items-center gap-5 text-center md:h-full md:flex-row md:items-center md:justify-between md:gap-6 md:text-left'>
            <div className='flex flex-col items-center gap-3.5 md:items-start'>
              <Image
                src='/logo.png'
                alt={APP_NAME}
                width={765}
                height={235}
                priority
                className='h-9 w-auto rounded-lg sm:h-10 dark:bg-white/95 dark:px-2 dark:py-1.5'
              />
              <h1 className='max-w-[280px] text-balance text-[22px] font-bold leading-tight tracking-tight text-foreground sm:max-w-none sm:text-[26px] md:text-[28px] lg:text-[28px]'>
                Անվճար հայտարարությունների տախտակ{" "}
                <span className='text-accent'>Սյունիքի մարզի</span>
              </h1>
              <p className='max-w-[300px] text-balance text-[13px] leading-relaxed text-muted-foreground sm:max-w-none sm:text-[15px]'>
                Անշարժ գույք, տրանսպորտ, վարձակալություն և կացություն՝ հեշտ ու
                արագ մեկ հարթակում։ Ձեր բոլոր կարիքները՝ մեկ հարթակում։
              </p>
              <div className='mt-1 flex w-full flex-nowrap items-center justify-center gap-2 sm:w-auto md:justify-start'>
                <CtaButton
                  href='/create'
                  size='default'
                  className='flex-1 whitespace-nowrap px-4 sm:flex-none'
                >
                  Հրապարակել
                </CtaButton>
                <Button
                  asChild
                  size='default'
                  variant='outline'
                  className='flex-1 whitespace-nowrap border-border bg-card px-4 text-foreground hover:bg-secondary sm:flex-none'
                >
                  <Link href='/search'>Դիտել հայտարարությունները</Link>
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
            src='/work.mp4'
            poster='/work.jpg'
            aria-hidden
            autoPlay
            muted
            loop
            playsInline
            preload='auto'
            className='absolute inset-0 h-full w-full object-cover'
          />

          <Link
            href={workHref}
            className='absolute right-4 top-4 z-20 inline-flex items-center gap-3 rounded-2xl bg-white/95 py-2.5 pl-2.5 pr-4 text-left shadow-xl ring-1 ring-black/5 backdrop-blur dark:bg-slate-900/90 dark:ring-white/10'
          >
            <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-sm'>
              <Briefcase className='h-5 w-5' />
            </span>
            <span className='flex items-center whitespace-nowrap leading-tight'>
              <span className='text-[14px] font-medium text-slate-900 dark:text-white'>
                Աշխատանք
              </span>
              <span className='ml-1.5 text-[14px] font-bold text-slate-900 dark:text-slate-300'>
                {locationLabel}
              </span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

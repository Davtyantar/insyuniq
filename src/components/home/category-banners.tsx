"use client";

import Image from "next/image";
import { Link } from "@/components/i18n/locale-link";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const BANNERS = [
  {
    href: "/real-estate?subcategory=apartments",
    key: "apartments",
    map: "/syunik-map-red.png",
  },
  {
    href: "/hotels?subcategory=guesthouses",
    key: "guesthouses",
    map: "/syunik-map-orange.png",
  },
] as const;

/** Two spotlight banners under the category grid, styled like the hero PromoBanner above. */
export function CategoryBanners() {
  const { t } = useTranslation();
  return (
    <section className='container pt-6 md:pt-8'>
      <div className='grid grid-cols-1 gap-5 sm:grid-cols-2'>
        {BANNERS.map((banner) => (
          <Link
            key={banner.href}
            href={banner.href}
            className='group relative flex min-h-[192px] flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-brand-100 via-card to-card p-6 shadow-sm ring-1 ring-black/5 dark:ring-white/10 sm:p-7'
          >
            <div
              aria-hidden
              className='pointer-events-none absolute -right-10 -top-14 h-52 w-52 rounded-full bg-gradient-to-br from-brand-300/60 to-brand-500/25 blur-3xl'
            />
            <div
              aria-hidden
              className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(37,99,246,0.18)_1.4px,transparent_0)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_120%_100%_at_100%_0%,black,transparent_70%)]'
            />
            <div
              aria-hidden
              className='pointer-events-none absolute right-3 top-4 h-32 w-32 sm:h-36 sm:w-36'
            >
              <Image
                src={banner.map}
                alt=''
                fill
                sizes='144px'
                className='object-contain'
              />
            </div>

            <div className='relative z-10 max-w-[80%]'>
              <h3 className='text-[19px] font-bold leading-snug tracking-tight text-foreground sm:text-[21px]'>
                {t(`home.banners.${banner.key}.title`)}{" "}
                <span className='text-accent'>{t(`home.banners.${banner.key}.highlight`)}</span>
              </h3>
              <p className='mt-1.5 text-[13px] leading-relaxed text-muted-foreground'>
                {t(`home.banners.${banner.key}.text`)}
              </p>
            </div>

            <span className='relative z-10 inline-flex w-fit items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-[13px] font-semibold text-accent-foreground shadow-sm transition-colors group-hover:bg-brand-700'>
              {t(`home.banners.${banner.key}.cta`)}
              <ArrowRight className='h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1' />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

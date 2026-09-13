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
            className='group relative flex flex-col justify-between gap-4 overflow-hidden rounded-2xl bg-card p-6 shadow-sm ring-1 ring-black/5 dark:ring-white/10 sm:min-h-[192px] sm:p-7'
          >
            <div
              aria-hidden
              className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(37,99,246,0.38)_1.6px,transparent_0)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_120%_100%_at_100%_0%,black,transparent_70%)] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(147,197,253,0.4)_1.6px,transparent_0)]'
            />
            <div
              aria-hidden
              className='pointer-events-none absolute right-3 top-4 hidden h-32 w-32 sm:block'
            >
              <Image
                src={banner.map}
                alt=''
                fill
                sizes='144px'
                className='object-contain'
              />
            </div>

            <div className='relative z-10'>
              {/* The map graphic is hidden on mobile, so both lines only need to leave room for it
                  from sm upward — longer translations (e.g. Russian) otherwise run under it. */}
              <h3 className='text-[16px] font-bold leading-snug tracking-tight text-foreground sm:max-w-[80%] sm:text-[19px] md:text-[21px]'>
                {t(`home.banners.${banner.key}.title`)}{" "}
                <span className='text-accent'>{t(`home.banners.${banner.key}.highlight`)}</span>
              </h3>
              <p className='mt-1.5 text-[12px] leading-relaxed text-muted-foreground sm:max-w-[80%] sm:text-[13px]'>
                {t(`home.banners.${banner.key}.text`)}
              </p>
            </div>

            <span className='relative z-10 inline-flex w-fit items-center gap-1.5 self-end rounded-lg bg-accent px-3.5 py-2 text-[13px] font-semibold text-accent-foreground shadow-sm transition-colors group-hover:bg-brand-700 sm:self-start'>
              {t(`home.banners.${banner.key}.cta`)}
              <ArrowRight className='h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1' />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

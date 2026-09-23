import { Link } from "@/components/i18n/locale-link";
import { ArrowRight } from "lucide-react";
import { VideoHoverCta } from "@/components/home/video-hover-cta";
import { CATEGORY_LIST } from "@/lib/categories";

/** On phones, services caps its chip list at this many and folds the rest behind a "+N" chip —
 * desktop has the room to show every subcategory in the full-width card. */
const SERVICES_MOBILE_CHIPS = 5;

/** The four category groups — no city name in the headings, the city already lives in the header. */
export function Categories() {
  return (
    <section className='container space-y-5 pt-6 md:pb-12 md:pt-8'>
      <h2 className='hidden text-xl font-bold tracking-tight text-foreground sm:block md:text-2xl'>
        Կատեգորիաներ
      </h2>

      <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
        {CATEGORY_LIST.filter((category) => category.slug !== "work").map((category) => {
          const isFullWidth = category.slug === "services";
          const mobileExtraCount = isFullWidth
            ? category.subcategories.length - SERVICES_MOBILE_CHIPS
            : 0;

          const header = (
            <div className='flex items-center justify-between gap-3'>
              <h3 className='text-[18px] font-bold text-foreground'>
                {category.mobileLabel && <span className='sm:hidden'>{category.mobileLabel}</span>}
                <span className={category.mobileLabel ? "hidden sm:inline" : undefined}>
                  {category.label}
                </span>
              </h3>
              <Link
                href={category.href}
                className='inline-flex shrink-0 items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-brand-700'
              >
                <span className='sm:hidden'>Տեսնել</span>
                <span className='hidden sm:inline'>Բոլոր հայտարարությունները</span>
                <ArrowRight className='h-4 w-4' />
              </Link>
            </div>
          );

          const nav = (
            <nav className='mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2'>
              {category.subcategories.map((sub, index) => {
                const hiddenOnMobile = isFullWidth && index >= SERVICES_MOBILE_CHIPS;
                return (
                  <Link
                    key={sub.value}
                    href={`${category.href}?subcategory=${sub.value}`}
                    className={`group ${hiddenOnMobile ? "hidden sm:flex" : "flex"} w-full items-center gap-2 rounded-xl bg-secondary px-3 py-2.5 text-[13px] font-medium leading-snug text-secondary-foreground/80 ring-1 ring-transparent transition-all hover:bg-accent/10 hover:text-accent hover:ring-accent/25 hover:shadow-sm`}
                  >
                    {sub.icon && (
                      <sub.icon className='h-4 w-4 shrink-0 text-accent transition-transform group-hover:scale-110' />
                    )}
                    <span>{sub.label}</span>
                  </Link>
                );
              })}
              {mobileExtraCount > 0 && (
                <Link
                  href={category.href}
                  className='flex w-full items-center justify-center gap-1 rounded-xl bg-accent/10 px-3 py-2.5 text-[13px] font-semibold leading-snug text-accent ring-1 ring-accent/20 transition-all hover:bg-accent/15 hover:ring-accent/35 sm:hidden'
                >
                  +{mobileExtraCount}
                </Link>
              )}
            </nav>
          );

          if (isFullWidth) {
            return (
              <div key={category.slug} className='flex flex-col gap-5 md:col-span-2 lg:flex-row lg:items-stretch'>
                <Link
                  href={category.href}
                  className='group flex flex-col overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-black/5 dark:ring-white/10 lg:flex-[2]'
                >
                  <div className='relative h-48 w-full shrink-0 overflow-hidden sm:h-auto sm:min-h-[280px] sm:flex-1'>
                    <video
                      src='/xustup-video.mp4'
                      poster='/xustup.jpg'
                      aria-hidden
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload='auto'
                      className='absolute inset-0 h-full w-full object-cover'
                    />
                    {/* The work tile's scrim, faded in on hover only, so the tint lands as deep as it does there. */}
                    <div
                      aria-hidden
                      className='pointer-events-none absolute inset-0 hidden bg-gradient-to-t from-black/50 via-black/0 to-black/10 opacity-0 transition-opacity duration-300 sm:block sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100'
                    />
                    <VideoHoverCta>Գտնել տուր</VideoHoverCta>
                  </div>

                  <div className='flex items-center justify-center gap-1.5 px-5 py-3 text-sm font-semibold text-accent sm:hidden'>
                    Գտնել տուր
                    <ArrowRight className='h-4 w-4' />
                  </div>
                </Link>

                <div className='rounded-2xl bg-card p-5 shadow-sm ring-1 ring-black/5 dark:ring-white/10 sm:p-6 lg:flex-[3]'>
                  {header}
                  {nav}
                </div>
              </div>
            );
          }

          return (
            <div
              key={category.slug}
              className='rounded-2xl bg-card p-5 shadow-sm ring-1 ring-black/5 dark:ring-white/10 sm:p-6'
            >
              {header}
              {nav}
            </div>
          );
        })}
      </div>
    </section>
  );
}

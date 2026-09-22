"use client";

import * as React from "react";
import Image from "next/image";
import { Link } from "@/components/i18n/locale-link";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { VideoHoverCta } from "@/components/home/video-hover-cta";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { CtaButton } from "@/components/ui/cta-button";
import { CITY_SLUG } from "@/lib/cities";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** City-specific clips for the work banner, each with its own first frame as the poster so the
 * placeholder is the same shot the clip opens on; anything else falls back to the generic pair. */
const DEFAULT_WORK_MEDIA = { video: "/work.mp4", poster: "/work.jpg" };
const CITY_WORK_MEDIA: Record<string, { video: string; poster: string }> = {
  Գորիս: { video: "/goris-work.mp4", poster: "/goris-work.jpg" },
  Սիսիան: { video: "/sisian-work.mp4", poster: "/sisian-work.jpg" },
  Քաջարան: { video: "/kajaran-work.mp4", poster: "/kajaran-work.jpg" },
  Մեղրի: { video: "/megri-work.mp4", poster: "/megri-work.jpg" },
};
/** Every poster, rendered stacked so each is already loaded when the city changes — swapping
 * to one fetched on demand would flash an empty card first. */
const WORK_POSTERS = [DEFAULT_WORK_MEDIA.poster, ...Object.values(CITY_WORK_MEDIA).map((media) => media.poster)];

/** Promo banner above the category grid — the site's own "advertisement". */
export function PromoBanner() {
  const { t } = useTranslation();
  const { city, hydrated, createHref } = useApp();
  const locationLabel =
    hydrated && city ? t(`cities.${CITY_SLUG[city]}.in`) : t("common.acrossTheRegion");
  const workHref = city ? `/work?city=${encodeURIComponent(city)}` : "/work";
  const workMedia = (hydrated && city && CITY_WORK_MEDIA[city]) || DEFAULT_WORK_MEDIA;
  const workVideoSrc = workMedia.video;
  // Which clip has loaded, rather than a plain flag: on a city switch `videoReady` is false in the
  // very render that swaps `src`, so there's no frame where the new, still-empty video counts as ready.
  const [readyVideoSrc, setReadyVideoSrc] = React.useState<string | null>(null);
  const videoReady = readyVideoSrc === workVideoSrc;
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Switching city swaps `src`, and the `key` below forces a fresh <video> element for it, which
  // fades in once it's actually ready instead of popping in mid-load.
  //
  // The readyState check covers navigating away and back: Next.js's router cache can restore this
  // component (and its already-loaded <video> element) without remounting it, so the "loadeddata"
  // event below never fires again. Checking the element's own readyState catches that case
  // immediately instead of waiting on an event that isn't coming.
  React.useEffect(() => {
    const el = videoRef.current;
    if (el && el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      setReadyVideoSrc(workVideoSrc);
    }
  }, [workVideoSrc]);

  return (
    <section className='container pt-6 md:pt-8'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-[3fr_2fr]'>
        <div className='relative overflow-hidden rounded-3xl bg-card px-6 pb-6 pt-6 ring-1 ring-black/5 dark:ring-white/10 sm:px-8 sm:pb-[calc(2rem+25px)] sm:pt-8 md:px-10 md:pb-[calc(2.5rem+25px)] md:pt-10'>
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
                  href={createHref}
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

        <Link
          href={workHref}
          className='group flex flex-col overflow-hidden rounded-3xl bg-secondary ring-1 ring-black/5 dark:ring-white/10'
        >
          <div className='relative aspect-[3/2] w-full shrink-0 overflow-hidden sm:aspect-auto sm:flex-1'>
            {/* The poster is the selected city's own first frame, not a generic photo — it fills the
                card immediately, then slowly zooms out as it fades under the video once that's
                ready, so the reveal reads as one continuous shot. Before hydration the city isn't
                known yet, so no poster shows rather than the wrong city's; and on a city switch
                the new poster snaps in (no transition) so the previous clip never lingers. */}
            {WORK_POSTERS.map((poster) => {
              const active = hydrated && poster === workMedia.poster;
              return (
                <Image
                  key={poster}
                  src={poster}
                  alt=''
                  aria-hidden
                  fill
                  priority={poster === DEFAULT_WORK_MEDIA.poster}
                  sizes='(min-width: 768px) 40vw, 100vw'
                  className={cn(
                    'object-cover',
                    active && !videoReady
                      ? 'scale-100 opacity-100'
                      : 'scale-110 opacity-0 transition-[transform,opacity] duration-[1400ms] ease-out',
                  )}
                />
              );
            })}

            <video
              ref={videoRef}
              key={workVideoSrc}
              src={workVideoSrc}
              aria-hidden
              autoPlay
              muted
              loop
              playsInline
              preload='auto'
              onLoadedData={() => setReadyVideoSrc(workVideoSrc)}
              className={cn(
                'absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out',
                videoReady ? 'opacity-100' : 'opacity-0',
              )}
            />

            {/* Bottom scrim keeps the badge/logo readable over the photo the way it already was
                over the video — a gradient instead of a flat tint feels less like a slapped-on box. */}
            <div
              aria-hidden
              className='pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/10'
            />

            {!videoReady && (
              <div
                aria-hidden
                className='absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1.5 backdrop-blur-sm transition-opacity duration-500 sm:bottom-4 sm:left-4 sm:group-hover:opacity-0'
              >
                <span className='h-1.5 w-1.5 animate-bounce rounded-full bg-white [animation-delay:-0.3s]' />
                <span className='h-1.5 w-1.5 animate-bounce rounded-full bg-white [animation-delay:-0.15s]' />
                <span className='h-1.5 w-1.5 animate-bounce rounded-full bg-white' />
              </div>
            )}

            <Image
              src='/logo-white.png'
              alt=''
              aria-hidden
              width={765}
              height={235}
              className='absolute right-3 top-3 z-10 hidden h-9 w-auto opacity-90 drop-shadow-md sm:block md:h-10'
            />

            <VideoHoverCta>
              {t("home.promo.work")} {locationLabel}
            </VideoHoverCta>
          </div>

          <div className='flex items-center justify-center gap-1.5 px-5 py-3 text-sm font-semibold text-accent sm:hidden'>
            {t("home.promo.work")} {locationLabel}
            <ArrowRight className='h-4 w-4' />
          </div>
        </Link>
      </div>
    </section>
  );
}

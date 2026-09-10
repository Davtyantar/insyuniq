import Image from "next/image";
import Link from "next/link";
import { MapPinned, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CtaButton } from "@/components/ui/cta-button";
import { APP_NAME } from "@/lib/constants";

const STATS = [
  { icon: Sparkles, label: "4 կատեգորիա հայտարարություններ" },
  { icon: MapPinned, label: "Սյունիքի 10 քաղաք" },
  { icon: ShieldCheck, label: "Ստուգված վաճառողներ" }
];

/** Promo banner above the category grid — the site's own "advertisement". */
export function PromoBanner() {
  return (
    <section className='container pt-6 md:pt-8'>
      <div className='relative overflow-hidden rounded-3xl bg-card p-6 shadow-lift ring-1 ring-black/5 dark:ring-white/10 sm:p-9 md:p-12'>
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
        <div className="pointer-events-none absolute right-[320px] top-1/2 z-0 hidden aspect-[78/103] h-[300px] -translate-y-1/2 sm:block sm:h-[360px] md:right-[380px] md:h-[420px] lg:right-[420px] lg:h-[460px]">
          <Image src="/syunik-map.png" alt="" aria-hidden fill className="object-contain" />
        </div>

        <div className='relative z-10 flex flex-col items-center gap-7 text-center md:flex-row md:items-center md:justify-between md:gap-10 md:text-left'>
          <div className='flex flex-col items-center gap-4 md:items-start'>
            <Image
              src='/logo.png'
              alt={APP_NAME}
              width={765}
              height={235}
              priority
              className='h-9 w-auto rounded-lg sm:h-12 dark:bg-white/95 dark:px-2 dark:py-1.5'
            />
            <h1 className='max-w-[280px] text-balance text-[22px] font-bold leading-tight tracking-tight text-foreground sm:max-w-none sm:text-[26px] md:text-[32px]'>
              Անվճար հայտարարությունների տախտակ{" "}
              <span className='text-accent'>Սյունիքի մարզի</span>
            </h1>
            <p className='max-w-[300px] text-balance text-[13px] leading-relaxed text-muted-foreground sm:max-w-none sm:text-[15px] md:text-base'>
              Անշարժ գույք, ավտոմեքենաներ, վարձակալություն և հյուրանոցներ՝ մեկ տեղում
            </p>
            <div className='mt-1 flex flex-wrap items-center justify-center gap-3 md:justify-start'>
              <CtaButton href='/create'>Հրապարակել հայտարարություն</CtaButton>
              <Button
                asChild
                size='lg'
                variant='outline'
                className='border-border bg-card text-foreground hover:bg-secondary'
              >
                <Link href='/search'>Դիտել հայտարարությունները</Link>
              </Button>
            </div>
          </div>

          <div className='flex w-max shrink-0 flex-col gap-3 rounded-2xl bg-card/95 p-5 shadow-md ring-1 ring-black/5 dark:ring-white/10'>
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className='flex items-center gap-2.5 whitespace-nowrap text-sm text-foreground/80'
              >
                <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background text-accent shadow-sm'>
                  <stat.icon className='h-4 w-4' />
                </span>
                {stat.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

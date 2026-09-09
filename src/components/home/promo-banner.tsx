import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPinned, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

const STATS = [
  { icon: Sparkles, label: "4 категории объявлений" },
  { icon: MapPinned, label: "10 городов Сюника" },
  { icon: ShieldCheck, label: "Проверенные продавцы" }
];

/** Promo banner above the category grid — the site's own "advertisement". */
export function PromoBanner() {
  return (
    <section className='container pt-6 md:pt-8'>
      <div className='relative overflow-hidden rounded-3xl bg-white p-6 shadow-lift ring-1 ring-black/5 sm:p-9 md:p-12'>
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
        <Image
          src='/syunik-map.png'
          alt=''
          aria-hidden
          width={1248}
          height={1648}
          className='pointer-events-none absolute right-[110px] top-1/2 z-0 h-[320px] w-auto -translate-y-1/2 opacity-80 sm:h-[390px] md:right-[134px] md:h-[470px] lg:h-[530px]'
        />

        <div className='relative z-10 flex flex-col items-center gap-7 text-center md:flex-row md:items-center md:justify-between md:gap-10 md:text-left'>
          <div className='flex flex-col items-center gap-4 md:items-start'>
            <Image
              src='/logo.png'
              alt={APP_NAME}
              width={765}
              height={235}
              priority
              className='h-10 w-auto sm:h-12'
            />
            <h1 className='whitespace-nowrap text-[18px] font-bold leading-tight tracking-tight text-slate-900 sm:text-[26px] md:text-[32px]'>
              Бесплатная доска объявлений{" "}
              <span className='text-accent'>Сюникской области</span>
            </h1>
            <p className='whitespace-nowrap text-[11px] leading-relaxed text-slate-600 sm:text-[15px] md:text-base'>
              Недвижимость, автомобили, аренда и отели — в одном месте
            </p>
            <div className='mt-1 flex flex-wrap items-center justify-center gap-3 md:justify-start'>
              <Button asChild size='lg' variant='accent' className='gap-2'>
                <Link href='/create'>
                  Подать объявление
                  <ArrowRight className='h-4 w-4' />
                </Link>
              </Button>
              <Button
                asChild
                size='lg'
                variant='outline'
                className='border-slate-200 bg-white text-slate-900 hover:bg-slate-50'
              >
                <Link href='/search'>Смотреть объявления</Link>
              </Button>
            </div>
          </div>

          <div className='flex w-max shrink-0 flex-col gap-3 rounded-2xl bg-white/95 p-5 shadow-md ring-1 ring-slate-100'>
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className='flex items-center gap-2.5 whitespace-nowrap text-sm text-slate-700'
              >
                <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-accent shadow-sm'>
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

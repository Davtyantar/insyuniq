import Image from "next/image";
import {
  BadgeCheck,
  Building2,
  Car,
  DoorOpen,
  Home,
  Hotel,
  KeyRound,
  Phone,
  ShieldCheck,
  Zap
} from "lucide-react";
import { CategoryBanners } from "@/components/home/category-banners";
import { Categories } from "@/components/home/categories";
import { HitsSection } from "@/components/home/hits-section";
import { PromoBanner } from "@/components/home/promo-banner";
import { CtaButton } from "@/components/ui/cta-button";
import { APP_NAME } from "@/lib/constants";
import {
  TOP_CARS,
  TOP_DAILY_HOUSES,
  TOP_HOTELS,
  TOP_REAL_ESTATE,
  TOP_RENTALS
} from "@/mock/listings";

/** Fixed decorative icon badges around the CTA banner's map — same size, evenly placed, no randomness. */
const CTA_MAP_ICONS = [
  { icon: Home, wrap: "-left-5 top-0" },
  { icon: Building2, wrap: "-right-5 top-0" },
  { icon: KeyRound, wrap: "-left-7 top-1/2 -translate-y-1/2" },
  { icon: Car, wrap: "-right-7 top-1/2 -translate-y-1/2" },
  { icon: DoorOpen, wrap: "-left-5 bottom-0" },
  { icon: Hotel, wrap: "-right-5 bottom-0" }
] as const;

const BENEFITS = [
  {
    icon: BadgeCheck,
    title: "Ստուգված հայտարարություններ",
    text: "Փաստաթղթերի և հասցեի ստուգում մինչև հրապարակումը."
  },
  {
    icon: Zap,
    title: "Արագ հրապարակում",
    text: "Հայտարարությունը հրապարակվում է մի քանի րոպեում՝ յոթ քայլով."
  },
  {
    icon: Phone,
    title: "Ուղիղ զանգ վաճառողին",
    text: "Հեռախոսահամարը բացվում է մեկ սեղմումով, առանց միջնորդների."
  },
  {
    icon: ShieldCheck,
    title: "Անվտանգ գործարք",
    text: "Խորհուրդներ և պատմության ստուգում յուրաքանչյուր կատեգորիայում."
  }
];

export default function HomePage() {
  return (
    <>
      <PromoBanner />

      <Categories />

      <CategoryBanners />

      <HitsSection
        title='Անշարժ գույքի հիթեր'
        subtitle='Ամենադիտված բնակարանները, տները և նորակառույցները'
        href='/real-estate'
        listings={TOP_REAL_ESTATE}
      />

      <HitsSection
        title='Ավտոմեքենաների հիթեր'
        subtitle='Ամենադիտված մարդատար և էլեկտրական մեքենաները'
        href='/cars'
        listings={TOP_CARS}
      />

      <HitsSection
        title='Վարձակալության հիթեր'
        subtitle='Բնակարաններ, տներ, ավտոտնակներ և կոմերցիոն գույք վարձով'
        href='/rentals'
        listings={TOP_RENTALS}
      />

      <HitsSection
        title='Հյուրանոցների և հանգստի հիթեր'
        subtitle='Հյուրանոցներ, հյուրատներ և հանգստյան բնակատեղեր՝ օրավարձ և ժամկետով'
        href='/hotels'
        listings={TOP_HOTELS}
      />

      <HitsSection
        title='Օրավարձով առանձնատներ'
        subtitle='Ամբողջական առանձնատներ մեկ օրով՝ ընկերական և ընտանեկան հավաքույթների համար'
        href='/hotels?subcategory=daily-houses'
        listings={TOP_DAILY_HOUSES}
      />

      <section className='border-y border-border bg-secondary/40'>
        <div className='container grid gap-4 py-12 sm:grid-cols-2 lg:grid-cols-4'>
          {BENEFITS.map((benefit) => (
            <div
              key={benefit.title}
              className='group rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-lift'
            >
              <span className='flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent transition-colors '>
                <benefit.icon className='h-5 w-5' />
              </span>
              <h3 className='mt-3.5 text-[15px] font-semibold text-foreground'>
                {benefit.title}
              </h3>
              <p className='mt-1.5 text-[13px] leading-relaxed text-muted-foreground'>
                {benefit.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className='container py-12 md:py-16'>
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
          <div className='pointer-events-none absolute -right-6 top-1/2 z-0 hidden h-[220px] w-[170px] -translate-y-1/2 opacity-90 sm:block md:h-[280px] md:w-[220px] md:right-8'>
            <Image
              src='/syunik-map.png'
              alt=''
              aria-hidden
              fill
              className='object-contain'
            />
            {CTA_MAP_ICONS.map(({ icon: Icon, wrap }, index) => (
              <span
                key={index}
                className={`absolute flex h-14 w-14 items-center justify-center rounded-full bg-card text-accent shadow-md ring-1 ring-black/5 dark:ring-white/10 ${wrap}`}
              >
                <Icon className='h-6 w-6' />
              </span>
            ))}
          </div>

          <div className='relative z-10 flex flex-col items-center gap-7 text-center md:flex-row md:items-center md:justify-between md:gap-10 md:text-left'>
            <div className='flex flex-col items-center gap-4 md:items-start'>
              <Image
                src='/logo.png'
                alt={APP_NAME}
                width={765}
                height={235}
                className='h-9 w-auto rounded-lg sm:h-12 dark:bg-white/95 dark:px-2 dark:py-1.5'
              />

              <h2 className='flex max-w-[340px] flex-wrap items-center justify-center gap-x-2 gap-y-2 text-balance text-[22px] font-bold leading-tight tracking-tight text-foreground sm:max-w-none sm:text-[26px] md:justify-start md:text-[30px]'>
                <span>Տեղադրեք Ձեր հայտարարությունը</span>
                <span className='text-accent'>անվճար</span>
              </h2>

              <p className='max-w-[320px] text-balance text-[13px] leading-relaxed text-muted-foreground sm:max-w-none sm:text-[15px] md:text-base'>
                Տեղադրեք հայտարարությունը անվճար՝ ցանկացած կատեգորիայում —
                անշարժ գույք, ավտոմեքենա, հյուրատուն կամ հյուրանոց. ավելացրեք
                լուսանկարներ, բնութագրեր և ստացեք առաջին արձագանքները դեռ այսօր
              </p>

              <CtaButton href='/create' className='mt-1'>
                Հրապարակել հայտարարություն
              </CtaButton>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

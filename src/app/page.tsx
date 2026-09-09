import Link from "next/link";
import { BadgeCheck, Phone, ShieldCheck, Zap } from "lucide-react";
import { Categories } from "@/components/home/categories";
import { HitsSection } from "@/components/home/hits-section";
import { PromoBanner } from "@/components/home/promo-banner";
import { Button } from "@/components/ui/button";
import {
  TOP_CARS,
  TOP_HOTEL_ROOMS,
  TOP_HOTELS,
  TOP_REAL_ESTATE,
  TOP_RENTALS,
  TOP_VACATION_HOUSES,
} from "@/mock/listings";

const BENEFITS = [
  {
    icon: BadgeCheck,
    title: "Ստուգված հայտարարություններ",
    text: "Փաստաթղթերի և հասցեի ստուգում մինչև հրապարակումը.",
  },
  {
    icon: Zap,
    title: "Արագ հրապարակում",
    text: "Հայտարարությունը հրապարակվում է մի քանի րոպեում՝ յոթ քայլով.",
  },
  {
    icon: Phone,
    title: "Ուղիղ զանգ վաճառողին",
    text: "Հեռախոսահամարը բացվում է մեկ սեղմումով, առանց միջնորդների.",
  },
  {
    icon: ShieldCheck,
    title: "Անվտանգ գործարք",
    text: "Խորհուրդներ և պատմության ստուգում յուրաքանչյուր կատեգորիայում.",
  },
];

export default function HomePage() {
  return (
    <>
      <PromoBanner />

      <Categories />

      <HitsSection
        title="Անշարժ գույքի հիթեր"
        subtitle="Ամենադիտված բնակարանները, տները և նորակառույցները"
        href="/real-estate"
        listings={TOP_REAL_ESTATE}
      />

      <HitsSection
        title="Ավտոմեքենաների հիթեր"
        subtitle="Ամենադիտված մարդատար և էլեկտրական մեքենաները"
        href="/cars"
        listings={TOP_CARS}
      />

      <HitsSection
        title="Վարձակալության հիթեր"
        subtitle="Բնակարաններ, տներ, ավտոտնակներ և կոմերցիոն գույք վարձով"
        href="/rentals"
        listings={TOP_RENTALS}
      />

      <HitsSection
        title="Հյուրանոցների և հանգստի հիթեր"
        subtitle="Հյուրանոցներ, հյուրատներ և հանգստյան բնակատեղեր՝ օրավարձ և ժամկետով"
        href="/hotels"
        listings={TOP_HOTELS}
      />

      <HitsSection
        title="Հանգստյան տներ"
        subtitle="Ամենադիտված հանգստյան տները՝ ընտանեկան և խմբակային հանգստի համար"
        href="/hotels?subcategory=houses"
        listings={TOP_VACATION_HOUSES}
      />

      <HitsSection
        title="Հյուրանոցներ"
        subtitle="Ամենադիտված հյուրանոցները Սյունիքի քաղաքներում"
        href="/hotels?subcategory=hotels"
        listings={TOP_HOTEL_ROOMS}
      />

      <section className="border-y border-border bg-card">
        <div className="container grid gap-8 py-12 md:grid-cols-4">
          {BENEFITS.map((benefit) => (
            <div key={benefit.title} className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                <benefit.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-sm font-semibold">{benefit.title}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                  {benefit.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container py-12 md:py-16">
        <div className="flex flex-col items-start gap-6 rounded-xl border border-border bg-primary px-6 py-10 text-primary-foreground md:flex-row md:items-center md:justify-between md:px-10">
          <div>
            <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
              Վաճառում եք բնակարան կամ ավտոմեքենա?
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-primary-foreground/70">
              Տեղադրեք հայտարարությունը անվճար՝ ավելացրեք լուսանկարներ, բնութագրեր և ստացեք
              առաջին արձագանքները դեռ այսօր.
            </p>
          </div>
          <Button asChild size="lg" variant="accent" className="shrink-0">
            <Link href="/create">Հրապարակել հայտարարություն</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

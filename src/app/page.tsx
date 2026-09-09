import Link from "next/link";
import { BadgeCheck, Phone, ShieldCheck, Zap } from "lucide-react";
import { Categories } from "@/components/home/categories";
import { HitsSection } from "@/components/home/hits-section";
import { PromoBanner } from "@/components/home/promo-banner";
import { Button } from "@/components/ui/button";
import { TOP_CARS, TOP_HOTELS, TOP_REAL_ESTATE, TOP_RENTALS } from "@/mock/listings";

const BENEFITS = [
  {
    icon: BadgeCheck,
    title: "Проверенные объявления",
    text: "Модерация документов и адреса до публикации.",
  },
  {
    icon: Zap,
    title: "Быстрая подача",
    text: "Объявление публикуется за пару минут в семь шагов.",
  },
  {
    icon: Phone,
    title: "Прямой звонок продавцу",
    text: "Телефон открывается в одно нажатие, без посредников.",
  },
  {
    icon: ShieldCheck,
    title: "Безопасная сделка",
    text: "Рекомендации и проверка истории по каждой категории.",
  },
];

export default function HomePage() {
  return (
    <>
      <PromoBanner />

      <Categories />

      <HitsSection
        title="Хиты недвижимости"
        subtitle="Самые просматриваемые квартиры, дома и новостройки"
        href="/real-estate"
        listings={TOP_REAL_ESTATE}
      />

      <HitsSection
        title="Хиты автомобилей"
        subtitle="Что чаще всего смотрят среди легковых и электромобилей"
        href="/cars"
        listings={TOP_CARS}
      />

      <HitsSection
        title="Хиты аренды"
        subtitle="Квартиры, дома, гаражи и коммерческая недвижимость в аренду"
        href="/rentals"
        listings={TOP_RENTALS}
      />

      <HitsSection
        title="Хиты отелей и отдыха"
        subtitle="Отели, гостевые дома и жильё для отдыха посуточно и на срок"
        href="/hotels"
        listings={TOP_HOTELS}
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
              Продаёте квартиру или автомобиль?
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-primary-foreground/70">
              Разместите объявление бесплатно: добавьте фотографии, характеристики и получите первые
              отклики уже сегодня.
            </p>
          </div>
          <Button asChild size="lg" variant="accent" className="shrink-0">
            <Link href="/create">Подать объявление</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
